// /pages/api/match-jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import axios from "axios";
import * as cheerio from "cheerio";

type Job = {
  title: string;
  company: string;
  description: string;
  link: string;
  score?: number;
};

function scoreJob(cvWords: string[], jobText: string): number {
  const lowerJobText = jobText.toLowerCase();
  return cvWords.reduce((score, word) => (lowerJobText.includes(word) ? score + 1 : score), 0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { db } = await connectToDatabase();
    const latestResume = await db.collection("resumes").findOne({}, { sort: { uploadedAt: -1 } });
    if (!latestResume) return res.status(404).json({ message: "No resume found" });

    const resumeText = latestResume.text.toLowerCase();
    const cvWords = [...new Set(resumeText.match(/\b\w{4,}\b/g) || [])]; // words 4+ letters

    const scrapedJobs: Job[] = [];

    // Vacancymail scraping
    try {
      const { data } = await axios.get("https://vacancymail.co.zw/jobs/");
      const $ = cheerio.load(data);
      $(".job-listing").each((_, el) => {
        const title = $(el).find("h2").text().trim();
        const company = $(el).find(".company-name, .job-company").text().trim();
        const description = $(el).find(".job-description, p").text().trim();
        let href = $(el).find("a").attr("href");
        if (href && !href.startsWith("http")) href = "https://vacancymail.co.zw" + href;
        if (title && href) scrapedJobs.push({ title, company, description, link: href });
      });
    } catch (err) {
      console.warn("Vacancymail scraping failed:", err.message);
    }

    // RemoteOK scraping
    try {
      const { data } = await axios.get("https://remoteok.com/remote-dev-jobs");
      const $$ = cheerio.load(data);
      $$("tr.job").each((_, el) => {
        const title = $$(el).find("h2").text().trim();
        const company = $$(el).find(".companyLink h3").text().trim();
        const description = $$(el).find(".description").text().trim();
        const href = $$(el).attr("data-href");
        if (title && href) scrapedJobs.push({ title, company, description, link: `https://remoteok.com${href}` });
      });
    } catch (err) {
      console.warn("RemoteOK scraping failed:", err.message);
    }

    // Score and filter jobs
    const matched = scrapedJobs
      .map((job) => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        const score = scoreJob(cvWords, text);
        return { ...job, score };
      })
      .filter((job) => job.score >= 1) // lowered threshold for demo
      .sort((a, b) => b.score! - a.score!)
      .slice(0, 10);

    await db.collection("matchedJobs").insertOne({
      resumeId: latestResume._id,
      matchedAt: new Date(),
      jobs: matched,
    });

    res.status(200).json({ matchedJobs: matched, resumePreview: resumeText.slice(0, 300) });
  } catch (err) {
    console.error("match-jobs error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
