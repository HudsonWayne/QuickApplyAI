// src/pages/jobs.tsx
'use client';

import { useEffect, useState } from 'react';

type Job = {
  title: string;
  company: string;
  location: string;
  link: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 font-[Georgia]">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job, index) => (
            <li key={index} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p>{job.company} – {job.location}</p>
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View Job
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
