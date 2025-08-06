// src/pages/api/get-applications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('jobTracker');

  const applications = await db.collection('applications').find().sort({ createdAt: -1 }).toArray();
  res.status(200).json(applications);
}
