// src/pages/api/match-jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { cvText } = req.body;
    if (!cvText) {
      return res.status(400).json({ message: 'Missing cvText in request body' });
    }

    // Scrape jobs
    const { data } = await axios.get('https://vacancymail.co.zw/jobs/');
    const $ = cheerio.load(data);
    const jobListings: { title: string; company: string; link: string }[] = [];

    $('.job-listing').each((_, el) => {
      const title = $(el).find('.job-title a').text().trim();
      const company = $(el).find('.job-company').text().trim();
      const link = 'https://vacancymail.co.zw' + $(el).find('.job-title a').attr('href');
      if (title && company) {
        jobListings.push({ title, company, link });
      }
    });

    // Match logic (basic keyword matching)
    const matchedJobs = jobListings.filter(job =>
      cvText.toLowerCase().includes(job.title.toLowerCase())
    );

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('matchedJobs');
    await collection.insertMany(matchedJobs);

    return res.status(200).json({ matchedJobs });
  } catch (error) {
    console.error('Error matching jobs:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
