// src/pages/api/get-matched-jobs.ts
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

    const jobs = matched.length > 0 ? matched[0].jobs || [] : [];

    res.status(200).json({ jobs }); // ✅ send in expected format
  } catch (err) {
    console.error("Failed to fetch matched jobs:", err);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
