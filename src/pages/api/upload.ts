// Next.js API Route - Upload Resume
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // disable default body parser for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "File upload error" });
    }

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Here’s where you could parse the PDF and match jobs
    // For now, let’s mock the result
    const matchedCount = Math.floor(Math.random() * 10); // random job matches

    return res.status(200).json({
      message: "Resume uploaded successfully",
      matchedCount,
    });
  });
}
