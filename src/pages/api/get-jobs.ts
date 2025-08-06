// src/pages/api/get-jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Access the matchedJobs collection
    const matchedCollection = db.collection('matchedJobs');

    // Find the most recent matched jobs document
    const latest = await matchedCollection.findOne({}, { sort: { matchedAt: -1 } });

    if (!latest || !latest.jobs) {
      return res.status(404).json({ message: 'No matched jobs found' });
    }

    // Return the jobs array
    res.status(200).json({ jobs: latest.jobs });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
