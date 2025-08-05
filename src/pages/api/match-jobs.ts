// src/pages/api/match-jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('QuickApplyAi');
    const collection = db.collection('resumes');

    // Get the most recent resume
    const latestResume = await collection.findOne({}, { sort: { uploadedAt: -1 } });

    if (!latestResume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const resumeText = latestResume.textExtract;

    // (Temporary) Fake matched jobs using keywords from resume
    const dummyJobs = [
      {
        title: "Frontend Developer",
        company: "TechNova",
        description: "Work with React, Next.js, and Tailwind on scalable UI.",
      },
      {
        title: "Full Stack Engineer",
        company: "InnoSoft",
        description: "Looking for engineers familiar with MongoDB, Node.js.",
      },
      {
        title: "Software Engineer Intern",
        company: "Startup Labs",
        description: "Great fit for recent graduates with JavaScript knowledge.",
      },
    ];

    return res.status(200).json({
      resumeTextPreview: resumeText.slice(0, 300),
      jobs: dummyJobs,
    });
  } catch (error) {
    console.error("Error in match-jobs:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
