"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaArrowLeft, FaUpload } from "react-icons/fa";


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a resume to upload.");
      return;
    }

    // Later: send this to backend
    alert(`🎉 Resume uploaded: ${file.name}`);
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

          <div className="bg-white shadow-xl rounded-2xl px-6 py-8 space-y-6">
            <label className="flex flex-col items-center border-2 border-dashed border-green-400 p-6 rounded-xl cursor-pointer hover:bg-green-50 transition">
              <FaUpload className="text-green-500 text-3xl mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload a PDF resume
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <p className="text-sm text-green-700 font-medium">
                📄 Selected: {file.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition duration-300"
            >
              Upload & Start Applying
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-700 transition"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
