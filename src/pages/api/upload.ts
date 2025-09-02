// Next.js API Route - Upload Resume and Extract Name
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: false, // disable default body parser for file uploads
  },
};

// helper to parse form with formidable and return a Promise
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

    // handle both array and single file cases
    let file: File | undefined;
    if (Array.isArray(files.file)) {
      file = files.file[0];
    } else {
      file = files.file as File;
    }

    if (!file || !file.filepath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ read file as buffer
    const fileBuffer = await fs.readFile(file.filepath);

    // parse PDF
    const pdfData = await pdf(fileBuffer);

    const text = pdfData.text || "";
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

    // heuristic: skip generic headings like "Resume" or "Curriculum Vitae"
    let extractedName = "User";
    if (lines.length > 0) {
      extractedName =
        lines.find(
          (line) =>
            line.length > 2 &&
            !/^(resume|curriculum vitae|cv)$/i.test(line)
        ) || "User";
    }

    // mock job matches
    const matchedCount = Math.floor(Math.random() * 10);

    return res.status(200).json({
      message: `Hi ${extractedName}, your resume was uploaded successfully! 🎉`,
      matchedCount,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return res.status(500).json({ message: "Error reading PDF" });
  }
}
