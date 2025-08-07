// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ uploadDir: './uploads', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    const file = files.file as File;
    const filePath = file.filepath;

    try {
      const text = await readPDF(filePath);

      // Naive name extraction: get the first non-empty line
      const nameLine = text.split('\n').find(line => line.trim().length > 0) || 'Unknown';

      return res.status(200).json({ name: nameLine });
    } catch (err) {
      console.error('PDF parsing error:', err);
      return res.status(500).json({ error: 'Failed to read PDF' });
    }
  });
}
