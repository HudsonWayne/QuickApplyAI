// /pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { connectToDatabase } from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false, keepExtensions: true });

    const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    // Handle formidable's array vs object
    let file: File | undefined;

    if (Array.isArray(files.file)) {
      file = files.file[0]; // first file if array
    } else {
      file = files.file as File;
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = (file as any).filepath || (file as any).path;
    if (!filePath) {
      return res.status(400).json({ message: "No file path found" });
    }

    // Read and parse PDF
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdf(buffer);
    const text = pdfData.text || "";

    // Extract candidate name
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const candidateName =
      lines.find((line) => line.length > 2 && !/^(resume|cv|curriculum vitae)$/i.test(line)) ||
      "Candidate";

    // Extract skills
    const skillsRegex =
      /\b(Java|Python|React|Node|TypeScript|AWS|SQL|C\+\+|Machine Learning|Data Science|Developer|Engineer)\b/gi;
    const matches = text.match(skillsRegex);
    const skills = matches ? [...new Set(matches.map((m) => m.trim()))] : [];

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const result = await db.collection("matchedJobs").insertOne({
      candidateName,
      skills,
      matchedAt: new Date(),
    });

    return res.status(200).json({
      message: `Hi ${candidateName}, your resume was uploaded successfully! 🎉`,
      candidateName,
      skills,
      resumeId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Failed to upload", error: error.message });
  }
}
