"use client";
import { useEffect, useState } from "react";

type Job = {
  title: string;
  company: string;
  description: string;
  link: string;
  score?: number;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetch("/api/match-jobs")
      .then(res => res.json())
      .then(data => {
        setPreview(data.resumeTextPreview);
        setJobs(data.jobs);
      })
      .catch(err => console.error("Fetch failed:", err));
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-6">🎯 Matched Jobs</h1>
      <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
        Based on your resume: <br />
        <em className="text-green-700">{preview}…</em>
      </p>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {jobs.map((job, idx) => (
          <div key={idx} className="p-6 bg-green-50 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-green-800">{job.title}</h2>
            <h3 className="mt-1 text-md text-gray-700">{job.company}</h3>
            {job.score !== undefined && (
              <span className="text-sm text-gray-500">Match score: {job.score}</span>
            )}
            <p className="text-sm text-gray-600 mt-2">{job.description.substring(0, 200)}…</p>
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-green-600 hover:underline font-semibold"
            >
              🔗 Apply Now
            </a>
          </div>
        ))}
        {!jobs.length && <p className="text-center text-gray-500">No matches found.</p>}
      </div>
    </main>
  );
}
