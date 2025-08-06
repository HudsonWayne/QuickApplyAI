import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
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
