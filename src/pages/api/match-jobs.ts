// src/pages/api/match-jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import * as cheerio from 'cheerio';

type Job = {
  title: string;
  company: string;
  description: string;
  link: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('QuickApplyAi');
    const collection = db.collection('resumes');

    // Get latest resume
    const latestResume = await collection.findOne({}, { sort: { uploadedAt: -1 } });
    if (!latestResume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const resumeText = latestResume.textExtract.toLowerCase();
    const resumeWords = resumeText.split(/\W+/);

    // Scrape VacancyMail
    const { data: html } = await axios.get("https://vacancymail.co.zw/jobs/");
    const $ = cheerio.load(html);
    const scrapedJobs: Job[] = [];

    $(".job-listing").each((i, el) => {
      const title = $(el).find("h2").text().trim();
      const company = $(el).find(".company-name").text().trim();
      const description = $(el).find(".job-description").text().trim();
      const link = "https://vacancymail.co.zw" + $(el).find("a").attr("href");

      scrapedJobs.push({ title, company, description, link });
    });

    // Add this inside handler()

// --- SCRAPE FROM RemoteOK ---
const { data: remoteOKHtml } = await axios.get("https://remoteok.com/");
const $$ = cheerio.load(remoteOKHtml);

$$("tr.job").each((i, el) => {
  const title = $$(el).find("h2").text().trim();
  const company = $$(el).find(".companyLink h3").text().trim();
  const description = $$(el).find(".description").text().trim();
  const link = "https://remoteok.com" + $$(el).attr("data-href");

  if (title && link) {
    scrapedJobs.push({ title, company, description, link });
  }
});






    // Basic keyword match
    const matchedJobs = scrapedJobs.filter(job => {
      const text = (job.title + job.description).toLowerCase();
      return resumeWords.some(word => text.includes(word));
    });

    res.status(200).json({
      resumeTextPreview: resumeText.slice(0, 300),
      jobs: matchedJobs.slice(0, 10), // limit to 10
    });
  } catch (error) {
    console.error("Error in match-jobs:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
