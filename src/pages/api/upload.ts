import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import clientPromise from '@/lib/mongodb';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'File upload failed' });
    }

    const resume = files.resume as File;
    if (!resume) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Read the PDF file buffer
      const dataBuffer = fs.readFileSync(resume.filepath);
      
      // Extract text
      const data = await pdfParse(dataBuffer);
      const text = data.text;

      // (Optional) Basic cleanup or keyword extraction here

      // Save metadata + extracted text to MongoDB
      const client = await clientPromise;
      const db = client.db('QuickApplyAi');
      const collection = db.collection('resumes');

      const filename = path.basename(resume.filepath);
      const fileUrl = `/uploads/${filename}`;

      await collection.insertOne({
        filename,
        fileUrl,
        textExtract: text,
        uploadedAt: new Date(),
      });

      return res.status(200).json({
        message: 'Upload and text extraction successful',
        filename,
        fileUrl,
        textExtract: text.substring(0, 500), // sending back first 500 chars as preview
      });
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      return res.status(500).json({ message: 'Failed to extract text from resume' });
    }
  });
}
