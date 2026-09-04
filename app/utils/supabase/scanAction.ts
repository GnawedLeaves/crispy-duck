"use server";

import { ITautaScanData } from "@/app/types/commonTypes";
import { createClient } from "@/app/utils/supabase/server";
import dayjs from "dayjs";
import { cookies } from "next/headers";

export interface ProcessScanResponse {
  success: boolean;
  data: ScanData;
}

export interface ScanData {
  text: string;
  mimeType: string;
  pagesCount: number;
}

export interface StorageUploadResult {
  success: boolean;
  filePath?: string;
  mimeType?: string;
  error?: string;
}

export async function uploadScanToStorage(
  file: File,
): Promise<StorageUploadResult> {
  if (!file || file.size === 0) {
    return { success: false, error: "No valid file payload received." };
  }

  try {
    // Standardize buffer handling across iOS Safari and Node runtimes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileExt = rawExt === "heic" || rawExt === "heif" ? "jpg" : rawExt;
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${Date.now()}_${fileName}`;

    let resolvedMimeType = file.type;
    if (!resolvedMimeType || resolvedMimeType === "" || resolvedMimeType.includes("heic")) {
      resolvedMimeType = "image/jpeg";
    }

    const { data: storageData, error: storageError } = await supabase.storage
      .from("scans")
      .upload(filePath, buffer, {
        contentType: resolvedMimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    return {
      success: true,
      filePath: storageData.path,
      mimeType: resolvedMimeType,
    };
  } catch (err: any) {
    console.error("Storage upload error:", err);
    return {
      success: false,
      error: err?.message ?? "We could not upload your scan image.",
    };
  }
}

export async function processScanFile(
  filePath: string,
  mimeType: string,
): Promise<ProcessScanResponse | undefined> {
  if (!filePath || !mimeType) return;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("process-scan", {
        body: {
          filePath,
          mimeType,
        },
      });

    if (functionError) {
      console.error("❌ SUPABASE FUNCTION DETAILED ERROR:", {
        name: functionError.name,
        message: functionError.message,
        status: functionError.status,
        context: functionError.context,
      });

      throw new Error(`Edge function failed: ${functionError.message}`);
    }

    return functionData as ProcessScanResponse;
  } catch (err: any) {
    console.error(err);
  }
}

export async function handleFileUpload(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return;

  const uploadResult = await uploadScanToStorage(file);

  if (!uploadResult.success || !uploadResult.filePath) {
    throw new Error(uploadResult.error || "Upload failed");
  }

  return processScanFile(
    uploadResult.filePath,
    uploadResult.mimeType ?? "image/jpeg",
  );
}