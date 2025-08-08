import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("🔄 Connecting to DB...");
    const { db } = await connectToDatabase();

    console.log("📦 Fetching matched jobs...");
    const matched = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .limit(1)
      .toArray();

    console.log("🧪 Matched result:", matched);

    if (!matched || matched.length === 0) {
      console.log("❌ No matched jobs found");
      return res.status(200).json({ jobs: [] });
    }

    const jobs = matched[0]?.jobs || [];

    console.log("✅ Returning jobs:", jobs);
    res.status(200).json({ jobs });

  } catch (err: any) {
    console.error("🔥 Failed to fetch matched jobs:", err.message, err.stack);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
