// /pages/api/saveCv.ts
import { connectToDatabase } from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { filename, text, matchedJobs } = req.body;

    if (!filename || !text) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { db } = await connectToDatabase();

    // Check if CV already exists
    const existing = await db.collection("cvs").findOne({ filename });

    if (existing) {
      // Update matchedJobs instead of creating duplicate
      await db.collection("cvs").updateOne(
        { filename },
        { $set: { matchedJobs, uploadedAt: new Date() } }
      );
      return res.status(200).json({ message: "Updated CV with matched jobs" });
    }

    // Insert new CV
    await db.collection("cvs").insertOne({
      filename,
      text,
      matchedJobs,
      uploadedAt: new Date(),
    });

    res.status(201).json({ message: "CV saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
