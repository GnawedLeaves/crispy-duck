// app/api/scan/route.ts
import { processScanFile, uploadScanToStorageFromBuffer } from "@/app/utils/supabase/scanAction";
import { NextResponse } from "next/server";

// Increase body size limit for large images
export const maxDuration = 120; // seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64, fileName, mimeType } = body;

    if (!base64 || !fileName) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    console.log("📥 API received:", { fileName, mimeType, base64Length: base64.length });

    // Convert base64 back to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    console.log("📦 ArrayBuffer created, size:", arrayBuffer.byteLength);

    // Upload to Supabase storage
    const uploadResult = await uploadScanToStorageFromBuffer(
      arrayBuffer,
      fileName,
      mimeType || "image/jpeg",
    );

    console.log("📤 Upload result:", uploadResult);

    if (!uploadResult.success || !uploadResult.filePath) {
      return NextResponse.json(
        { error: uploadResult.error || "Upload failed" },
        { status: 400 },
      );
    }

    // Process with Google Doc AI
    console.log("🔄 Processing scan...");
    const result = await processScanFile(
      uploadResult.filePath,
      uploadResult.mimeType ?? mimeType ?? "image/jpeg",
    );

    console.log("✅ Processing complete");

    return NextResponse.json({ ...result, filePath: uploadResult.filePath });
  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 },
    );
  }
}