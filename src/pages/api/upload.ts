// /src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Important: disable Next.js body parsing to let formidable handle it
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads');

  // Make sure upload folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    filename: (_name, _ext, part) => {
      // Add timestamp prefix to original file name to avoid conflicts
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  form.parse(req, (err, _fields, files) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ message: 'Failed to upload CV' });
    }

    // Support both single file object and array of files
    const file: File | undefined = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct accessible URL path to the uploaded file
    const filePath = `/uploads/${path.basename(file.filepath)}`;

    return res.status(200).json({ message: 'CV uploaded successfully', filePath });
  });
}
