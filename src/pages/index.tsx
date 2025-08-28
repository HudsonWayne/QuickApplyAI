"use client";

import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>QuickApply – Smart Job Application System</title>
        <meta
          name="description"
          content="Upload your resume and let QuickApply do the job hunt for you."
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-12">
          {/* LEFT CONTENT */}
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              Welcome to <span className="text-green-600">QuickApplyAi</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700">
              Upload your resume once. We’ll find matching jobs and even apply for you automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
              <Link href="/upload">
                <button className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 ease-in-out">
                  🚀 Get Started
                </button>
              </Link>
              <Link href="/jobs">
                <button className="w-full sm:w-auto px-8 py-3 bg-white border border-green-600 text-green-700 font-semibold rounded-xl shadow-md hover:bg-green-50 transition-all duration-300 ease-in-out">
                  🔍 View Matched Jobs
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/imagee.jpeg"
              alt="Resume upload illustration"
              width={500}
              height={300}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-16 sm:mt-20 text-center space-y-3 text-gray-600 text-sm sm:text-base">
          <p>🎯 Smart Job Matching</p>
          <p>🔒 100% Privacy – Your data is secure</p>
          <p>📈 Save hours applying manually</p>
        </div>
      </main>
    </>
  );
}
