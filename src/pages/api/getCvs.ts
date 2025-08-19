// /pages/api/getCvs.ts
import { connectToDatabase } from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const cvs = await db.collection("cvs").find().toArray();
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
