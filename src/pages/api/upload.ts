import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import clientPromise from '@/lib/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }

    const cvFile = files.cv as File;
    if (!cvFile || !cvFile.filepath) {
      return res.status(400).json({ error: 'CV file is missing' });
    }

    try {
      const dataBuffer = fs.readFileSync(cvFile.filepath);
      const parsed = await pdfParse(dataBuffer);
      const cvText = parsed.text;

      if (!cvText) {
        return res.status(400).json({ error: 'CV text could not be parsed' });
      }

      const client = await clientPromise;
      const db = client.db('quickapplyai');
      const result = await db.collection('cvs').insertOne({ text: cvText });

      return res.status(200).json({ message: 'CV uploaded and parsed', cvId: result.insertedId, cvText });
    } catch (e) {
      console.error('Parsing error:', e);
      return res.status(500).json({ error: 'Failed to parse CV' });
    }
  });
}
