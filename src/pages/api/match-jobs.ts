// /pages/api/saveMatchedJobs.ts
import { connectToDatabase } from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const { jobs } = req.body; // array of matched jobs

    if (!jobs || jobs.length === 0) {
      return res.status(400).json({ message: "No jobs provided" });
    }

    await db.collection("matchedJobs").insertOne({
      jobs,
      matchedAt: new Date(),
    });

    res.status(200).json({ message: "Jobs saved successfully" });
  } catch (err: any) {
    console.error("🔥 Failed to save jobs:", err.message);
    res.status(500).json({ message: "Failed to save jobs" });
  }
}
