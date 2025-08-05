// src/pages/api/test-db.ts

import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    
    // List all collections to test connection
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      message: "Connected successfully!",
      collections: collections.map((col) => col.name),
    });
  } catch (error: any) {
    res.status(500).json({ message: "Connection failed", error: error.message });
  }
}
