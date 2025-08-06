import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import * as cheerio from 'cheerio';

type Job = {
  title: string;
  company: string;
  description: string;
  link: string;
  score?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('QuickApplyAi');
    const collection = db.collection('resumes');

    const latestResume = await collection.findOne({}, { sort: { uploadedAt: -1 } });
    if (!latestResume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const resumeText = latestResume.textExtract.toLowerCase();
    const words = resumeText.split(/\W+/).filter(w => w.length > 3);
    const uniqueWords = [...new Set(words)];

    const scrapedJobs: Job[] = [];

    // VacancyMail
    try {
      const { data } = await axios.get('https://vacancymail.co.zw/jobs/');
      const $ = cheerio.load(data);
      $('.job-listing').each((_, el) => {
        const title = $(el).find('h2').text().trim();
        const company = $(el).find('.company-name').text().trim();
        const description = $(el).find('.job-description').text().trim();
        const href = $(el).find('a').attr('href');
        const link = href ? `https://vacancymail.co.zw${href}` : '';
        if (title && link) scrapedJobs.push({ title, company, description, link });
      });
    } catch (err) {
      console.warn('VacancyMail scraping failed:', err);
    }

    // RemoteOK
    try {
      const { data } = await axios.get('https://remoteok.com/');
      const $$ = cheerio.load(data);
      $$('tr.job').each((_, el) => {
        const title = $$(el).find('h2').text().trim();
        const company = $$(el).find('.companyLink h3').text().trim();
        const description = $$(el).find('.description').text().trim();
        const href = $$(el).attr('data-href');
        const link = href ? `https://remoteok.com${href}` : '';
        if (title && link) scrapedJobs.push({ title, company, description, link });
      });
    } catch (err) {
      console.warn('RemoteOK scraping failed:', err);
    }

    // Remotive
    try {
      const { data } = await axios.get('https://remotive.com/remote-jobs/');
      const $$$ = cheerio.load(data);
      $$$('div.job-tile').each((_, el) => {
        const title = $$$('h2.job-title', el).text().trim();
        const company = $$$('h3.company-name', el).text().trim();
        const description = $$$('div.job-description', el).text().trim();
        const href = $$$('a.job-link', el).attr('href');
        const link = href ? `https://remotive.com${href}` : '';
        if (title && link) scrapedJobs.push({ title, company, description, link });
      });
    } catch (err) {
      console.warn('Remotive scraping failed:', err);
    }

    // Score & Filter
    const matched = scrapedJobs
      .map(job => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        const score = uniqueWords.reduce((sum, w) => sum + (text.includes(w) ? 1 : 0), 0);
        return { ...job, score };
      })
      .filter(job => job.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // ✅ Insert into matchedJobs collection
    const matchedCollection = db.collection("matchedJobs");
    await matchedCollection.insertOne({
      resumeId: latestResume._id,
      matchedAt: new Date(),
      jobs: matched,
    });

    res.status(200).json({
      resumeTextPreview: resumeText.slice(0, 300),
      jobs: matched,
    });
  } catch (err) {
    console.error('Error in match-jobs:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
