import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { connectToDatabase } from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const form = formidable({ multiples: false, keepExtensions: true });
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ files })));
    });

    const file = files.file as formidable.File;
    if (!file || !file.filepath) return res.status(400).json({ message: "No file uploaded" });

    const buffer = await fs.readFile(file.filepath);
    const pdfData = await pdf(buffer);
    const text = pdfData.text || "";

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const candidateName =
      lines.find(line => line.length > 2 && !/^(resume|cv|curriculum vitae)$/i.test(line)) ||
      "Candidate";

    const skillsRegex =
      /\b(Java|Python|React|Node|TypeScript|AWS|SQL|C\+\+|Machine Learning|Data Science|Developer|Engineer)\b/gi;
    const matches = text.match(skillsRegex);
    const skills = matches ? [...new Set(matches.map(m => m.trim()))] : [];

    const { db } = await connectToDatabase();
    const matchedJobResult = await db.collection("matchedJobs").insertOne({
      candidateName,
      skills,
      matchedAt: new Date(),
    });

    return res.status(200).json({
      message: `Hi ${candidateName}, your resume was uploaded successfully!`,
      candidateName,
      skills,
      resumeId: matchedJobResult.insertedId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Failed to upload", error: error.message });
  }
}
