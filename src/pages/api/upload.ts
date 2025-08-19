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

// Example scraping function (replace with real API later)
async function scrapeJobs(cvText: string) {
  const jobs = [];

  if (cvText.includes("React")) {
    jobs.push({ title: "React Developer", company: "Tech Corp", location: "Remote", link: "https://example.com", matchedAt: new Date() });
  }
  if (cvText.includes("Full-Stack")) {
    jobs.push({ title: "Full-Stack Developer", company: "Web Solutions", location: "Harare", link: "https://example.com", matchedAt: new Date() });
  }

  return jobs;
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
          jobs: matchedJobs,
        });
      }

      res.status(200).json({ message: "Resume uploaded and jobs matched", matchedCount: matchedJobs.length });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error: String(error) });
    }
  });
}
