import { NextResponse } from "next/server";
import {
  analyzeCvForAts,
  extractTextFromUpload,
  type CvSource,
} from "@/lib/ats";

const SOURCES: CvSource[] = ["creative-cv", "yourself", "someone-else"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const sourceRaw = String(form.get("source") || "");
    const file = form.get("file");

    if (!SOURCES.includes(sourceRaw as CvSource)) {
      return NextResponse.json(
        { error: "Select how this CV was created." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Upload a CV file (PDF, DOCX, or TXT)." },
        { status: 400 },
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large (max 8MB)." },
        { status: 400 },
      );
    }

    const source = sourceRaw as CvSource;
    const candidateName = String(form.get("candidateName") || "").trim();
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromUpload(buffer, file.name, file.type || "");

    const report = await analyzeCvForAts({
      source,
      fileName: file.name,
      candidateName: candidateName || undefined,
      text,
    });

    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ATS analysis failed" },
      { status: 500 },
    );
  }
}
