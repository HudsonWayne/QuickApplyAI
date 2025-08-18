// /pages/api/getApplications.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET allowed" });
  }

  try {
    const { resumeId } = req.query;

    if (!resumeId) {
      return res.status(400).json({ message: "Missing resumeId" });
    }

    const { db } = await connectToDatabase();
    const apps = await db.collection("applications").find({
      resumeId: new ObjectId(resumeId as string),
    }).toArray();

    return res.status(200).json(apps);
  } catch (error) {
    console.error("Get applications error:", error);
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
}
