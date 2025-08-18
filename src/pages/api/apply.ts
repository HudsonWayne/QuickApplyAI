// /pages/api/applications.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const apps = await db.collection("applications")
      .find({})
      .sort({ appliedAt: -1 })
      .toArray();

    return res.status(200).json(apps);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
}
