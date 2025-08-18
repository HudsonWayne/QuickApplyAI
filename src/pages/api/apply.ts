import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const { resumeId, job } = req.body;

    if (!resumeId || !job) {
      return res.status(400).json({ message: "Missing resumeId or job data" });
    }

    let resumeObjectId;
    try {
      resumeObjectId = new ObjectId(resumeId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid resumeId format" });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("applications").insertOne({
      resumeId: resumeObjectId,
      job,
      appliedAt: new Date(),
      status: "applied",
    });

    return res.status(200).json({ message: "Applied successfully", id: result.insertedId });
  } catch (error) {
    console.error("Apply error:", error);
    return res.status(500).json({ message: "Failed to apply", error: String(error) });
  }
}
