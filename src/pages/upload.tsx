"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploaded" | "searching">("idle");
  const [userName, setUserName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a resume to upload.");
      return;
    }

    setStatus("searching");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response from server");
      }

      const data = await res.json();

      if (res.ok) {
        setStatus("uploaded");
        setUserName(data.name || null);
      } else {
        setStatus("idle");
        alert(`Upload failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("idle");
      alert(`Upload failed: ${error}`);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Resume | QuickApply</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Upload Your Resume
          </h1>
          <p className="text-gray-600 text-lg">
            Let QuickApply handle the job search. Just upload your resume once.
          </p>

          {status !== "uploaded" && (
            <div className="bg-white shadow-xl rounded-2xl px-6 py-8 space-y-6">
              <label className="flex flex-col items-center border-2 border-dashed border-green-400 p-6 rounded-xl cursor-pointer hover:bg-green-50 transition">
                <FaUpload className="text-green-500 text-3xl mb-2" />
                <span className="text-sm text-gray-600">Click to upload a PDF resume</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <p className="text-sm text-green-700 font-medium">📄 Selected: {file.name}</p>
              )}

              <button
                onClick={handleUpload}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition duration-300"
              >
                Upload & Start Applying
              </button>
            </div>
          )}

          {status === "uploaded" && (
            <div className="bg-white shadow-2xl rounded-2xl px-8 py-10 space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold text-green-700">
                🎉 Thanks{userName ? `, ${userName}` : ""}!
              </h2>
              <p className="text-lg text-gray-700">
                We've received your resume and our AI agents are now matching the best jobs for you.
              </p>
              <p className="text-green-500 font-medium">
                You’ll be notified as soon as we've applied on your behalf!
              </p>
              <Link
                href="/jobs"
                className="inline-block mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition"
              >
                View Matching Jobs
              </Link>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-700 transition"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        {status === "searching" && (
          <div
            className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-500 animate-pulse"
            title="Uploading and searching for jobs..."
          >
            🔄 Uploading and searching...
          </div>
        )}
      </main>
    </>
  );
}
