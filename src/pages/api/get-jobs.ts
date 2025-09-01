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



// /pages/api/jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Job = {
  title: string;
  company: string;
  location: string;
  link: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.SCRAPINGDOG_API_KEY; // 🔑 put in .env
    const query = "software developer"; // You can make this dynamic from CV later
    const url = `https://api.scrapingdog.com/google_jobs?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ScrapingDog API failed: ${response.statusText}`);
    }

    const data = await response.json();

    // normalize
    const jobs: Job[] = (data.jobs || []).map((job: any) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      link: job.link,
    }));

    return res.status(200).json({ jobs });
  } catch (err: any) {
    console.error("❌ Job fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
