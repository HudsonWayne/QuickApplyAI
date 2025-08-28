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

  const filename = file.originalFilename || "uploaded.pdf";
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, data);

  // Return relative path for frontend
  return `/uploads/${filename}`;
}

async function scrapeJobs(cvText: string) {
  const apiKey = process.env.SCRAPINGDOG_API_KEY;
  if (!apiKey) throw new Error("SCRAPINGDOG_API_KEY not set in .env");

  const query = encodeURIComponent(cvText.split("\n").slice(0, 3).join(" "));
  const url = `https://api.scrapingdog.com/google_jobs?api_key=${apiKey}&query=${query}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("ScrapingDog API error:", await res.text());
    return [];
  }

  const data = await res.json();
  return (data.jobs || []).map((job: any) => ({
    title: job.title,
    company: job.company,
    location: job.location,
    link: job.link,
    matchedAt: new Date(),
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file)
      return res.status(400).json({ message: "No file uploaded" });

    try {
      const uploadedFile = Array.isArray(files.file)
        ? files.file[0]
        : files.file;

      const filePath = await saveFile(uploadedFile);
      const dataBuffer = await fs.readFile(path.join(process.cwd(), "public", filePath));
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text;

      const { db } = await connectToDatabase();

      // Store resume
      await db.collection("resumes").insertOne({
        uploadedAt: new Date(),
        filename: uploadedFile.originalFilename,
        text: extractedText,
      });

      // Scrape jobs
      const matchedJobs = await scrapeJobs(extractedText);

      if (matchedJobs.length > 0) {
        await db.collection("matchedJobs").insertOne({
          filename: uploadedFile.originalFilename,
          matchedAt: new Date(),
          matchedJobs,
        });
      }

      res.status(200).json({
        message: "Resume uploaded and jobs matched",
        filePath, // ✅ now returning filePath
        matchedCount: matchedJobs.length,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error: String(error) });
    }
  });
}
