import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };

async function saveFile(file: File) {
  const data = await fs.readFile(file.filepath);
  const uploadDir = path.join(process.cwd(), "/public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.originalFilename || "uploaded.pdf");
  await fs.writeFile(filePath, data);
  return filePath;
}

async function realScrapeJobs(cvText: string) {
  const apiKey = process.env.SCRAPINGDOG_API_KEY;
  if (!apiKey) throw new Error("SCRAPINGDOG_API_KEY is missing in .env");

  const query = encodeURIComponent(cvText.split("\n").slice(0, 3).join(" "));
  const url = `https://api.scrapingdog.com/google_jobs?api_key=${apiKey}&query=${query}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("ScrapingDog failed:", await res.text());
    return [];
  }

  const data = await res.json();
  if (!data.jobs) return [];

  return data.jobs.map((job: any) => ({
    title: job.title,
    company: job.company,
    location: job.location,
    link: job.link,
    matchedAt: new Date(),
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = await saveFile(uploadedFile);
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text;

      const { db } = await connectToDatabase();

      // Store resume
      const resumeDoc = await db.collection("resumes").insertOne({
        uploadedAt: new Date(),
        filename: uploadedFile.originalFilename,
        text: extractedText,
      });

      // Fetch real jobs via ScrapingDog
      const matchedJobs = await realScrapeJobs(extractedText);

      if (matchedJobs.length) {
        await db.collection("matchedJobs").insertOne({
          resumeId: resumeDoc.insertedId,
          filename: uploadedFile.originalFilename,
          matchedAt: new Date(),
          jobs: matchedJobs,
        });
      }

      res.status(200).json({
        message: "Resume uploaded and jobs matched successfully",
        matchedCount: matchedJobs.length,
        resumeId: resumeDoc.insertedId,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  });
}
