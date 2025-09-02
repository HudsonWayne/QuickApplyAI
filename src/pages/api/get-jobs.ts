// // Next.js API Route - Fetch Jobs
// import type { NextApiRequest, NextApiResponse } from "next";

// type Job = {
//   title: string;
//   company: string;
//   location: string;
//   link: string;
// };

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Mock data (later replace with real DB or scraping results)
//   const jobs: Job[] = [
//     {
//       title: "Frontend Developer",
//       company: "TechCorp",
//       location: "Remote",
//       link: "https://example.com/job/frontend",
//     },
//     {
//       title: "Backend Engineer",
//       company: "CodeWorks",
//       location: "Harare, Zimbabwe",
//       link: "https://example.com/job/backend",
//     },
//     {
//       title: "Fullstack Developer",
//       company: "DevSolutions",
//       location: "Remote",
//       link: "https://example.com/job/fullstack",
//     },
//     {
//       title: "React.js Engineer",
//       company: "SmartApps",
//       location: "Bulawayo, Zimbabwe",
//       link: "https://example.com/job/react",
//     },
//     {
//       title: "Python Django Developer",
//       company: "DataWorks",
//       location: "Remote",
//       link: "https://example.com/job/django",
//     },
//     {
//       title: "Node.js Backend Developer",
//       company: "CloudTech",
//       location: "Mutare, Zimbabwe",
//       link: "https://example.com/job/node",
//     },
//     {
//       title: "Mobile App Developer",
//       company: "AppHub",
//       location: "Remote",
//       link: "https://example.com/job/mobile",
//     },
//     {
//       title: "AI/ML Engineer",
//       company: "FutureAI",
//       location: "Harare, Zimbabwe",
//       link: "https://example.com/job/ai",
//     },
//     {
//       title: "DevOps Engineer",
//       company: "SysOps Ltd",
//       location: "Remote",
//       link: "https://example.com/job/devops",
//     },
//     {
//       title: "Database Administrator",
//       company: "DataSafe",
//       location: "Gweru, Zimbabwe",
//       link: "https://example.com/job/dbadmin",
//     },
//     {
//       title: "UI/UX Designer",
//       company: "CreativeDesigns",
//       location: "Remote",
//       link: "https://example.com/job/uiux",
//     },
//     {
//       title: "Cybersecurity Analyst",
//       company: "SecureNet",
//       location: "Harare, Zimbabwe",
//       link: "https://example.com/job/cyber",
//     },
//   ];

//   res.status(200).json({ jobs });
// }



// /pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    let file: File | undefined;
    if (Array.isArray(files.file)) {
      file = files.file[0];
    } else {
      file = files.file as File;
    }

    if (!file || !file.filepath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = await fs.readFile(file.filepath);
    const pdfData = await pdf(fileBuffer);

    const text = pdfData.text || "";
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

    let extractedName = "User";
    if (lines.length > 0) {
      extractedName =
        lines.find(
          (line) =>
            line.length > 2 &&
            !/^(resume|curriculum vitae|cv)$/i.test(line)
        ) || "User";
    }

    // very naive keyword extraction (could be replaced with NLP/AI later)
    const skillsRegex = /\b(Java|Python|React|Node|TypeScript|AWS|SQL|C\+\+|Machine Learning|Data Science|Developer|Engineer)\b/gi;
    const matches = text.match(skillsRegex);
    const skills = matches ? [...new Set(matches.map((m) => m.trim()))] : [];

    return res.status(200).json({
      message: `Hi ${extractedName}, your resume was uploaded successfully! 🎉`,
      skills,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return res.status(500).json({ message: "Error reading PDF" });
  }
}
