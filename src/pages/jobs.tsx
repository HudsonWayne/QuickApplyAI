"use client";
import { useEffect, useState } from "react";

type Job = { title: string; company: string; link: string; };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/match-jobs");
      if (!res.ok) return setLoading(false);
      const data = await res.json();
      setJobs(data.matchedJobs || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">🚀 Available Jobs</h1>
      {loading ? <p>Loading…</p> : jobs.length ? (
        <ul>
          {jobs.map((j, i) => (
            <li key={i}>
              <a href={j.link} target="_blank" rel="noopener noreferrer">{j.title} @ {j.company}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs found at the moment.</p>
      )}
    </div>
  );
}
