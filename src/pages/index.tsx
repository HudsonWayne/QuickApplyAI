"use client";

import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>QuickApply</title>
        <meta name="description" content="Fast-track your job applications with QuickApply" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-r from-[#fdfbfb] to-[#ebedee] flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
            Welcome to <span className="text-green-600">QuickApply</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600">
            Your one-stop solution to apply for jobs faster and smarter. Streamline your job hunt and never miss an opportunity again.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition duration-300">
              Get Started
            </button>
            <button className="border border-green-600 text-green-600 px-6 py-3 rounded-xl hover:bg-green-100 transition duration-300">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-12">
          <img
            src="/quick-apply-illustration.svg"
            alt="Job application illustration"
            className="w-full max-w-lg"
          />
        </div>
      </main>
    </>
  );
}
