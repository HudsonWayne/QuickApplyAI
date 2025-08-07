// /pages/api/apply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  const { resumeId, job } = req.body;
  if (!resumeId || !job) return res.status(400).json({ message: "Missing resumeId or job data" });

  try {
    const { db } = await connectToDatabase();
    await db.collection("applications").insertOne({
      resumeId,
      job,
      appliedAt: new Date(),
      status: "applied",
    });
    res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Failed to apply" });
  }
}
