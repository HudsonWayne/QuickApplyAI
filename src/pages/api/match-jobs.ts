import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("🔄 Connecting to DB...");
    const { db } = await connectToDatabase();

    console.log("📦 Fetching matched jobs...");
    // fetch ALL jobs instead of only latest
    const matchedDocs = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .toArray();

    if (!matchedDocs || matchedDocs.length === 0) {
      console.log("❌ No matched jobs found");
      return res.status(200).json({ jobs: [] });
    }

    // flatten jobs from all documents
    const jobs = matchedDocs.flatMap((doc) => doc.jobs || []);

    console.log("✅ Returning jobs:", jobs.length);
    res.status(200).json({ jobs });
  } catch (err: any) {
    console.error("🔥 Failed to fetch matched jobs:", err.message);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
