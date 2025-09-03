// Next.js API Route - Upload Resume
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: false, // disable default body parser for file uploads
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

    // read PDF content
    const fileBuffer = await fs.readFile(file.filepath);
    const pdfData = await pdf(fileBuffer);
    const text = pdfData.text || "";
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // extract candidate name (first non-generic line)
    let extractedName = "Candidate";
    for (const line of lines) {
      if (
        line.length > 2 &&
        !/^(resume|curriculum vitae|cv)$/i.test(line)
      ) {
        extractedName = line;
        break;
      }
    }

    // extract skills (basic example, can expand)
    const skillsRegex =
      /\b(Java|Python|React|Node|TypeScript|AWS|SQL|C\+\+|Machine Learning|Data Science|Developer|Engineer)\b/gi;
    const matches = text.match(skillsRegex);
    const skills = matches ? [...new Set(matches.map((m) => m.trim()))] : [];

    // mock matched count for now
    const matchedCount = skills.length;

    return res.status(200).json({
      message: `Hi ${extractedName} 👋, your resume was uploaded successfully!`,
      name: extractedName,
      matchedCount,
    });
  } catch (error: any) {
    console.error("Upload error:", error.message);
    return res.status(500).json({ message: "Error processing resume" });
  }
}
