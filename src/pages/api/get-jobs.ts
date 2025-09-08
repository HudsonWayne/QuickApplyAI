

// /pages/api/getMatchedJobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

interface Job {
  title: string;
  company: string;
  location: string;
  link: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();

    // Get the most recent resume upload
    const latest = await db
      .collection("matchedJobs")
      .find({})
      .sort({ uploadedAt: -1 })
      .limit(1)
      .toArray();

    if (!latest || latest.length === 0) {
      return res.status(404).json({ message: "No recent uploads found" });
    }

    const { candidateName, skills } = latest[0];

    // Simulated jobs fetching (later you can integrate an API like RemoteOK)
    const jobs: Job[] = [
      {
        title: "Frontend Developer",
        company: "TechCorp",
        location: "Remote",
        link: "https://example.com/job/frontend",
      },
      {
        title: "Backend Engineer",
        company: "CodeWorks",
        location: "Harare, Zimbabwe",
        link: "https://example.com/job/backend",
      },
    ];

    // Save jobs back to MongoDB
    await db.collection("matchedJobs").updateOne(
      { _id: latest[0]._id },
      { $set: { jobs, updatedAt: new Date() } }
    );

    return res.status(200).json({
      name: candidateName, // ✅ renamed correctly
      skills,
      jobs,
    });
  } catch (error: any) {
    console.error("❌ Get-jobs error:", error.message);
    return res.status(500).json({ message: "Error fetching jobs" });
  }
}
