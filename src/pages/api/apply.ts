// /pages/api/apply.ts
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Upload error', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    const file = files.cv[0]; // Assuming 'cv' is the field name
    const filePath = file.filepath; // Path where file is saved
    console.log('Saved CV at:', filePath);

    // You can now save `filePath` or the filename to MongoDB
    res.status(200).json({ message: 'CV uploaded', path: filePath });
  });
}
