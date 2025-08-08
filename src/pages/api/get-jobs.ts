// /pages/api/get-jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    const matched = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .limit(1)
      .toArray();

    if (!matched || matched.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    const jobs = matched[0]?.jobs || [];
    res.status(200).json({ jobs });
  } catch (err) {
    console.error("Failed to fetch matched jobs:", err);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
