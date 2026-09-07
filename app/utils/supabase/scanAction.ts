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
  console.log("=== SERVER: uploadScanToStorage START ===");
  console.log("Received file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  if (!file) {
    console.error("❌ No file provided");
    return { success: false, error: "No file was provided." };
  }

  try {
    // Step 1: Convert to ArrayBuffer
    console.log("📦 Converting File to ArrayBuffer...");
    let fileArrayBuffer: ArrayBuffer;

    try {
      fileArrayBuffer = await file.arrayBuffer();
      console.log(
        "✅ ArrayBuffer created successfully, size:",
        fileArrayBuffer.byteLength,
      );

      if (fileArrayBuffer.byteLength === 0) {
        throw new Error(
          "ArrayBuffer is 0 bytes - file may be empty or corrupt",
        );
      }
    } catch (arrayBufferError: any) {
      console.error("❌ ArrayBuffer conversion failed:", arrayBufferError);
      return {
        success: false,
        error: `ArrayBuffer conversion failed: ${arrayBufferError?.message || String(arrayBufferError)}. This is a device compatibility issue.`,
      };
    }

    // Step 2: Create Supabase client
    console.log("🔐 Creating Supabase client...");
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      console.log("✅ Supabase client created");

      // Step 3: Verify authentication
      console.log("🔑 Checking authentication...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("Auth status:", {
        authenticated: !!user,
        error: authError?.message,
      });

      if (authError || !user) {
        const authMsg = authError?.message || "No authenticated user";
        console.error("❌ Auth check failed:", authMsg);
        return {
          success: false,
          error: `Authentication failed: ${authMsg}. Are you logged in?`,
        };
      }

      // Step 4: Prepare upload metadata
      const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${Date.now()}_${fileName}`;

      let resolvedMimeType = file.type || "image/jpeg";
      if (!file.type && (fileExt === "heic" || fileExt === "heif")) {
        resolvedMimeType = "image/heic";
      }

      console.log("📤 Upload metadata:", {
        filePath,
        resolvedMimeType,
        arrayBufferSize: fileArrayBuffer.byteLength,
      });

      // Step 5: Upload to Supabase
      console.log("🚀 Uploading to Supabase storage...");
      const { data: storageData, error: storageError } = await supabase.storage
        .from("scans")
        .upload(filePath, fileArrayBuffer, {
          contentType: resolvedMimeType,
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("❌ Supabase storage error:", {
          message: storageError.message,
          status: storageError.status,
        });
        return {
          success: false,
          error: `Storage upload failed: ${storageError.message}. Check bucket permissions in Supabase.`,
        };
      }

      console.log("✅ Upload successful:", storageData.path);

      return {
        success: true,
        filePath: storageData.path,
        mimeType: resolvedMimeType,
      };
    } catch (supabaseError: any) {
      console.error("❌ Supabase operation error:", supabaseError);
      return {
        success: false,
        error: `Supabase error: ${supabaseError?.message || String(supabaseError)}`,
      };
    }
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("❌ uploadScanToStorage failed:", {
      message: errorMsg,
      stack: err?.stack,
    });
    return {
      success: false,
      error: `Upload error: ${errorMsg}`,
    };
  }
}

export async function processScanFile(
  filePath: string,
  mimeType: string,
): Promise<ProcessScanResponse | undefined> {
  console.log("=== SERVER: processScanFile START ===");
  console.log("Processing:", { filePath, mimeType });

  if (!filePath || !mimeType) {
    console.error("❌ Missing filePath or mimeType");
    return;
  }

  try {
    console.log("🔐 Creating Supabase client...");
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    console.log("📞 Invoking edge function 'process-scan'...");
    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("process-scan", {
        body: { filePath, mimeType },
      });

    if (functionError) {
      console.error("❌ Edge function error:", {
        name: functionError.name,
        message: functionError.message,
        status: functionError.status,
      });
      throw new Error(`Edge function failed: ${functionError.message}`);
    }

    console.log("✅ Edge function response received");
    console.log("Response data:", JSON.stringify(functionData, null, 2));

    if (!functionData) {
      console.error("❌ functionData is null/undefined");
      throw new Error("Edge function returned no data");
    }

    if (!functionData.data) {
      console.error("❌ functionData.data is missing:", functionData);
      throw new Error(
        `Invalid response structure. Expected data.data, got: ${JSON.stringify(functionData)}`,
      );
    }

    if (!functionData.data.text) {
      console.error("❌ No text in response:", functionData);
      throw new Error(
        `OCR returned no text. Response: ${JSON.stringify(functionData)}`,
      );
    }

    console.log(
      "✅ Valid OCR response with text length:",
      functionData.data.text.length,
    );
    return functionData as ProcessScanResponse;
  } catch (err: any) {
    console.error("❌ processScanFile failed:", {
      message: err?.message,
      stack: err?.stack,
    });
    throw err;
  }
}
// 3. Takes FormData directly from the client
export async function handleFileUpload(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return;

  const uploadResult = await uploadScanToStorage(file);

  if (!uploadResult.success || !uploadResult.filePath) return;

  return processScanFile(
    uploadResult.filePath,
    uploadResult.mimeType ?? file?.type ?? "image/jpeg",
  );
}

export async function uploadScanData(
  scannedData: ITautaScanData,
  currentUserId: string,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const formattedDate = dayjs(scannedData.scanDate, "DD/MMM/YYYY").format(
    "YYYY-MM-DD",
  );

  const { data, error } = await supabase.from("tanita_scans").insert([
    {
      user_id: currentUserId,
      scan_date: formattedDate,
      scan_time: scannedData.scanTime,
      weight: scannedData.weight,
      clothes_weight: scannedData.clothesWeight,
      fat_percentage: scannedData.fatPercentage,
      fat_mass: scannedData.fatMass,
      ffm: scannedData.ffm,
      muscle_mass: scannedData.muscleMass,
      tbw: scannedData.tbw,
      tbw_percent: scannedData.tbwPercent,
      bone_mass: scannedData.boneMass,
      bmr: scannedData.bmr,
      metabolic_age: scannedData.metabolicAge,
      visceral_fat_rating: scannedData.visceralFatRating,
      bmi: scannedData.bmi,
      degree_of_obesity: scannedData.degreeOfObesity || null,
      ideal_body_weight: scannedData.idealBodyWeight || null,
    },
  ]);

  return { data, error };
}

export const getUserTanitaScans = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: { message: "Unauthorized access.", code: "401" },
    };
  }

  const { data, error } = await supabase
    .from("tanita_scans")
    .select("*")
    .eq("user_id", user.id)
    .order("scan_date", { ascending: false });

  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }

  return { data, error: null };
};
