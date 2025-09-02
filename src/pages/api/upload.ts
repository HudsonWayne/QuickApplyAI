// /pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { connectToDatabase } from "@/lib/mongodb";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

// helper to parse multipart form
const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: false, keepExtensions: true });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);

    // handle file input
    let file: File | undefined = Array.isArray(files.file)
      ? files.file[0]
      : (files.file as File);

    if (!file?.filepath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // read + parse PDF text
    const fileBuffer = await fs.readFile(file.filepath);
    const pdfData = await pdf(fileBuffer);
    const text = pdfData.text || "";
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // extract candidate name (simple heuristic: first non-generic line)
    let extractedName = "User";
    if (lines.length > 0) {
      extractedName =
        lines.find(
          (line) =>
            line.length > 2 &&
            !/^(resume|curriculum vitae|cv)$/i.test(line)
        ) || "User";
    }

    // extract skills (basic regex, can expand later)
    const skillsRegex =
      /\b(Java|Python|React|Node|TypeScript|AWS|SQL|C\+\+|Machine Learning|Data Science|Developer|Engineer)\b/gi;
    const matches = text.match(skillsRegex);
    const skills = matches ? [...new Set(matches.map((m) => m.trim()))] : [];

    // call ScrapingDog API for jobs
    const apiKey = process.env.SCRAPINGDOG_API_KEY;
    if (!apiKey) throw new Error("Missing SCRAPINGDOG_API_KEY");

    const query = skills.length > 0 ? skills.slice(0, 3).join(" ") : "software developer";
    const url = `https://api.scrapingdog.com/google_jobs?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ScrapingDog API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const jobs =
      (data.jobs || []).map((job: any) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        link: job.link,
      })) || [];

    // persist in MongoDB
    const { db } = await connectToDatabase();
    await db.collection("matchedJobs").insertOne({
      name: extractedName,
      skills,
      jobs,
      uploadedAt: new Date(),
    });

    // return response
    return res.status(200).json({
      message: `Hi ${extractedName}, your resume was uploaded successfully! 🎉`,
      name: extractedName,
      skills,
      jobs,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error.message);
    return res.status(500).json({ message: "Error processing resume" });
  }
}
