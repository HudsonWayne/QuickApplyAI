// /pages/api/upload.ts

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { connectToDatabase } from '@/lib/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Upload error', err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    try {
      const file = files.file?.[0];

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = file.filepath;
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;

      // Extract name: first line with 2+ words
      const firstLine = text.split("\n").find(line => line.trim().split(" ").length >= 2);
      const name = firstLine?.split(" ").slice(0, 2).join(" ") || "there";

      const { db } = await connectToDatabase();
      await db.collection("resumes").insertOne({
        filePath,
        name,
        text,
        uploadedAt: new Date(),
      });

      res.status(200).json({ message: 'CV uploaded', filePath, name });
    } catch (error) {
      console.error("Parsing or DB error", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
