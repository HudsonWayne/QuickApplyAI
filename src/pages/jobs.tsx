"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

type Job = {
  title: string;
  company: string;
  location: string;
  link: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        // ✅ use correct endpoint
        const res = await fetch("/api/getMatchedJobs");
        if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 p-6 sm:p-10 font-[Georgia]">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-800">
          🚀 Available Jobs
        </h1>
        <p className="mt-3 text-green-700 text-base sm:text-lg md:text-xl">
          Hand-picked job listings matched just for you
        </p>

        {/* BACK BUTTON */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
          >
            <FaArrowLeft className="text-sm" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* LOADING STATE */}
      {loading && (
        <p className="text-center text-green-600 text-lg animate-pulse">
          Loading jobs...
        </p>
      )}

      {/* ERROR STATE */}
      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-500">
          No jobs found yet. Try uploading your resume first.
        </p>
      )}

      {/* JOB LIST */}
      <ul className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-2">
        {jobs.map((job, index) => (
          <li
            key={index}
            className="bg-white border border-green-200 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-bold text-green-900 mb-1">
              {job.title}
            </h2>
            <p className="text-green-800 font-semibold mb-2">
              {job.company} &mdash;{" "}
              <span className="italic">{job.location}</span>
            </p>
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-5 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors duration-300 shadow"
            >
              View Job &rarr;
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
