// /pages/api/match-jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Job = {
  title: string;
  company: string;
  location: string;
  link: string;
};

// in-memory store for last uploaded resume
let lastUpload: { name: string; skills: string[] } = { name: "User", skills: [] };

export function setLastUpload(name: string, skills: string[]) {
  lastUpload = { name, skills };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const apiKey = process.env.SCRAPINGDOG_API_KEY;
    if (!apiKey) throw new Error("Missing SCRAPINGDOG_API_KEY");

    // build search query from skills, fallback to generic
    const query = lastUpload.skills.length > 0
      ? lastUpload.skills.slice(0, 3).join(" ")
      : "software developer";

    const url = `https://api.scrapingdog.com/google_jobs?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ScrapingDog API failed: ${response.statusText}`);
    }

    const data = await response.json();

    const jobs: Job[] = (data.jobs || []).map((job: any) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      link: job.link,
    }));

    return res.status(200).json({
      name: lastUpload.name,
      skills: lastUpload.skills,
      jobs,
    });
  } catch (err: any) {
    console.error("❌ getMatchedJobs error:", err.message);
    return res.status(500).json({ error: "Failed to fetch matched jobs" });
  }
}
