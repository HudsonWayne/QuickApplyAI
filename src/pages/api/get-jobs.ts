// src/pages/api/get-jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('QuickApplyAi');
    const matchedCollection = db.collection('matchedJobs');

    // Get latest matched jobs document
    const latest = await matchedCollection.findOne({}, { sort: { matchedAt: -1 } });

    if (!latest || !latest.jobs) {
      return res.status(404).json({ message: 'No matched jobs found' });
    }

    res.status(200).json({ jobs: latest.jobs });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
