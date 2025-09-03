import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import * as pdfParse from "pdf-parse";

export const runtime = "nodejs"; // allow Node APIs like Buffer

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Convert File → Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF text
    const data = await pdfParse(buffer);
    const text = data.text;

    // Very basic "skills extraction" (improve later)
    const skills = text
      .match(/\b(JavaScript|Python|React|Node|MongoDB|SQL)\b/gi) || [];

    // Save to MongoDB
    const { db } = await connectToDatabase();
    await db.collection("resumes").insertOne({
      filename: file.name,
      skills,
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      message: "Hi User 👋",
      skills,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
