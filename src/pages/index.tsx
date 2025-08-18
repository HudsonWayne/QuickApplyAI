"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications"); // new API endpoint
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error("Failed to fetch applications", err);
      }
    }
    fetchApplications();
  }, []);

  return (
    <>
      <Head>
        <title>QuickApply – Smart Job Application System</title>
        <meta
          name="description"
          content="Upload your resume and let QuickApply do the job hunt for you."
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex flex-col items-center justify-center px-6">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center mt-12">
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              Welcome to <span className="text-green-600">QuickApplyAi</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              Upload your resume once. We will find matching jobs and apply for
              you automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/upload">
                <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 ease-in-out">
                  🚀 Get Started
                </button>
              </Link>
              <Link href="/jobs">
                <button className="px-8 py-3 bg-white border border-green-600 text-green-700 font-semibold rounded-xl shadow-md hover:bg-green-50 transition-all duration-300 ease-in-out">
                  🔍 View Matched Jobs
                </button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="/imagee.jpeg"
              alt="Resume upload illustration"
              width={500}
              height={300}
              className="w-full max-w-md hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="mt-20 text-center space-y-3 text-gray-600 text-sm">
          <p>🎯 Smart Job Matching</p>
          <p>🔒 100% Privacy – Your data is secure</p>
          <p>📈 Save hours applying manually</p>
        </div>

        {/* Applied Jobs Section */}
        <div className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📌 Your Applied Jobs
          </h2>
          {applications.length === 0 ? (
            <p className="text-center text-gray-600">
              You haven’t applied to any jobs yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app._id}
                  className="p-4 border border-gray-300 rounded-xl shadow-sm bg-white"
                >
                  <h3 className="text-lg font-semibold text-green-700">
                    {app.job?.title || "Untitled Job"}
                  </h3>
                  <p className="text-gray-600">{app.job?.company || "Unknown Company"}</p>
                  <p className="text-sm text-gray-500">
                    Applied at: {new Date(app.appliedAt).toLocaleString()}
                  </p>
                  <p className="text-sm">Status: {app.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
