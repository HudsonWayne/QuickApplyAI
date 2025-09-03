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


// /pages/api/get-jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();

    // Get the most recent upload
    const latest = await db
      .collection("matchedJobs")
      .find({})
      .sort({ uploadedAt: -1 })
      .limit(1)
      .toArray();

    if (!latest || latest.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    const { name, skills, jobs, uploadedAt } = latest[0];

    return res.status(200).json({
      name,
      skills,
      jobs,
      uploadedAt,
    });
  } catch (error: any) {
    console.error("❌ Get-jobs error:", error.message);
    return res.status(500).json({ message: "Error fetching jobs" });
  }
}
