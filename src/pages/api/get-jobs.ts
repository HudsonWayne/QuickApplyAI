import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    // Fetch the latest uploaded resume's matched jobs
    const latest = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .limit(1)
      .toArray();

    if (!latest || latest.length === 0) return res.status(200).json({ jobs: [] });

    const jobs = latest[0].jobs || [];
    res.status(200).json({ jobs });
  } catch (err: any) {
    console.error("Failed to fetch jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
}

