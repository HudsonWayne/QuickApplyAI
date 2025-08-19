import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    const matchedDocs = await db
      .collection("matchedJobs")
      .find({})
      .sort({ matchedAt: -1 })
      .toArray();

    if (!matchedDocs || matchedDocs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    // flatten the jobs array
    const jobs = matchedDocs.flatMap((doc) => doc.matchedJobs || []);

    res.status(200).json({ jobs });
  } catch (err: any) {
    console.error("Failed to fetch matched jobs:", err.message);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
}
