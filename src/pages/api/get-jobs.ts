import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    // Get all matched jobs sorted by latest
    const matchedDocs = await db.collection("matchedJobs").find({}).sort({ matchedAt: -1 }).toArray();

    if (!matchedDocs || matchedDocs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    // Flatten all jobs from all documents
    const jobs = matchedDocs.flatMap((doc) => doc.jobs || []);
    res.status(200).json({ jobs });
  } catch (err: any) {
    console.error("Failed to fetch matched jobs:", err.message);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
