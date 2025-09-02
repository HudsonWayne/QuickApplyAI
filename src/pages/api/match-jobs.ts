// /pages/api/getMatchedJobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    // get the latest saved jobs
    const latest = await db
      .collection("matchedJobs")
      .find({})
      .sort({ uploadedAt: -1 })
      .limit(1)
      .toArray();

    if (!latest.length) {
      return res.status(200).json({ jobs: [] });
    }

    return res.status(200).json({ jobs: latest[0].jobs });
  } catch (err: any) {
    console.error("❌ Failed to fetch jobs:", err.message);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
