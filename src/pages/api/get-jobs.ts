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

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import fetch from "node-fetch"; // if using Node.js 18+, you can use global fetch

interface Job {
  title: string;
  company: string;
  location: string;
  link: string;
}

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
      return res.status(404).json({ message: "No recent uploads found" });
    }

    const { name, skills } = latest[0];

    // Fetch jobs from remoteok.com using skills as query
    const jobs: Job[] = [];

    for (const skill of skills.slice(0, 3)) { // limit to top 3 skills for search
      const url = `https://remoteok.com/remote-${encodeURIComponent(skill)}-jobs.json`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0", // some sites reject default fetch UA
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (!Array.isArray(data)) continue;

      data.forEach((job: any) => {
        if (job.position && job.company && job.url) {
          jobs.push({
            title: job.position,
            company: job.company,
            location: job.location || "Remote",
            link: `https://remoteok.com${job.url}`,
          });
        }
      });
    }

    // Save jobs back to MongoDB
    await db.collection("matchedJobs").updateOne(
      { _id: latest[0]._id },
      { $set: { jobs, updatedAt: new Date() } }
    );

    return res.status(200).json({
      name,
      skills,
      jobs,
    });
  } catch (error: any) {
    console.error("❌ Get-jobs error:", error.message);
    return res.status(500).json({ message: "Error fetching jobs" });
  }
}
