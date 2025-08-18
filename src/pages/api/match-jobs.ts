// /pages/api/matchJobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("🔄 Connecting to DB...");
    const { db } = await connectToDatabase();

    console.log("📦 Fetching matched jobs...");
    // Fetch ALL jobs, newest first
    const matchedDocs = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .toArray();

    console.log("🧪 Matched docs count:", matchedDocs.length);

    if (!matchedDocs || matchedDocs.length === 0) {
      console.log("❌ No matched jobs found");
      return res.status(200).json({ jobs: [] });
    }

    // Flatten all jobs from all docs into one array
    const jobs = matchedDocs.flatMap(doc => doc.jobs || []);

    console.log("✅ Returning jobs:", jobs.length);
    res.status(200).json({ jobs });

  } catch (err: any) {
    console.error("🔥 Failed to fetch matched jobs:", err.message, err.stack);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
