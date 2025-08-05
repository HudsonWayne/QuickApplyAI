"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>QuickApply – Smart Job Application System</title>
        <meta name="description" content="Upload your resume and let QuickApply do the job hunt for you." />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex flex-col items-center justify-center px-6">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center mt-12">
          {/* Text Content */}
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              Welcome to <span className="text-green-600">QuickApply</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              Upload your resume once. We will find matching jobs and apply for you automatically.
            </p>
            <Link href="/upload">
              <button className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 ease-in-out">
                🚀 Get Started
              </button>
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <Image
              src="/Luca.jpeg"
              alt="Resume upload illustration"
              width={500}
              height={500}
              className="w-full max-w-md hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Footer or Features */}
        <div className="mt-20 text-center space-y-3 text-gray-600 text-sm">
          <p>🎯 Smart Job Matching</p>
          <p>🔒 100% Privacy – Your data is secure</p>
          <p>📈 Save hours applying manually</p>
        </div>
      </main>
    </>
  );
}

