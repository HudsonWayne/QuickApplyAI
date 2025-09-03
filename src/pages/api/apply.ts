import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { resumeId } = req.body;
    if (!resumeId) return res.status(400).json({ message: "Missing resumeId" });

    const { db } = await connectToDatabase();
    const matched = await db
      .collection("matchedJobs")
      .findOne({ _id: new ObjectId(resumeId) });

    if (!matched) return res.status(404).json({ message: "No matched jobs found for this resume" });

    // Mock job matching (replace with real scraping logic)
    const jobs = [
      { title: "Frontend Developer", company: "TechCorp", location: "Remote", link: "#" },
      { title: "Backend Engineer", company: "CodeWorks", location: "Harare", link: "#" },
      { title: "Fullstack Developer", company: "DevSolutions", location: "Remote", link: "#" },
    ];

    // Insert applications
    const applications = jobs.map(job => ({
      resumeId: new ObjectId(resumeId),
      job,
      appliedAt: new Date(),
      status: "applied",
    }));
    await db.collection("applications").insertMany(applications);

    return res.status(200).json({
      message: `Applied to ${applications.length} jobs successfully!`,
      appliedJobs: applications,
    });
  } catch (error: any) {
    console.error("Apply error:", error);
    return res.status(500).json({ message: "Failed to apply", error: error.message });
  }
}
