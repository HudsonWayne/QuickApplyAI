// pages/api/match-jobs.ts
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
  const text = jobText.toLowerCase();
  return cvWords.reduce((sum, w) => sum + (text.includes(w) ? 1 : 0), 0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { db } = await connectToDatabase();
    const latest = await db.collection("resumes").findOne({}, { sort: { uploadedAt: -1 } });
    if (!latest) return res.status(404).json({ message: "No resume found" });

    const resumeText = latest.text.toLowerCase();
    const cvWords = [...new Set(resumeText.match(/\b\w{4,}\b/g) || [])];
    const scrapedJobs: Job[] = [];

    // 1. VacancyMail
    try {
      const { data } = await axios.get("https://vacancymail.co.zw/jobs/");
      const $ = cheerio.load(data);
      $(".job-listing").each((_, el) => {
        const title = $(el).find("h2").text().trim();
        const company = $(el).find(".company-name").text().trim();
        const description = $(el).find(".job-description").text().trim();
        const href = $(el).find("a").attr("href");
        const link = href?.startsWith("http") ? href : `https://vacancymail.co.zw${href}`;
        if (title && link) scrapedJobs.push({ title, company, description, link });
      });
    } catch (err) {
      console.warn("VacancyMail scraping failed:", (err as Error).message);
    }

    // 2. RemoteOK
    try {
      const { data } = await axios.get("https://remoteok.com/remote-dev-jobs");
      const $$ = cheerio.load(data);
      $$("tr.job").each((_, el) => {
        const title = $$(el).find("h2").text().trim();
        const company = $$(el).find(".companyLink h3").text().trim();
        const description = $$(el).find(".description").text().trim();
        const href = $$(el).attr("data-href");
        const link = href ? `https://remoteok.com${href}` : "";
        if (title && link) scrapedJobs.push({ title, company, description, link });
      });
    } catch (err) {
      console.warn("RemoteOK scraping failed:", (err as Error).message);
    }

    // Score & filter
    const matched = scrapedJobs
      .map(j => ({ ...j, score: scoreJob(cvWords, `${j.title} ${j.description}`) }))
      .filter(j => j.score! >= 3)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10);

    // Store and return
    await db.collection("matchedJobs").insertOne({ resumeId: latest._id, matchedAt: new Date(), jobs: matched });
    res.status(200).json({ matchedJobs: matched });

  } catch (err) {
    console.error("match-jobs error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
