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
export async function handleFileUpload(file: File) {
  if (!file) return;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${Date.now()}_${fileName}`;
    console.log("scan", { fileExt, fileName, filePath });

    const { data: storageData, error: storageError } = await supabase.storage
      .from("scans")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    console.log("scan", { storageData, storageError });

    if (storageError)
      throw new Error(`Storage upload failed: ${storageError.message}`);

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("process-scan", {
        body: {
          filePath: storageData.path,
          mimeType: file.type,
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
    console.log("✅ Edge Function Success Data:", functionData);
    return functionData as ProcessScanResponse;
  } catch (err: any) {
    console.error(err);
  }
}

export const uploadScanData = async (
  scannedData: ITautaScanData,
  currentUserId: string,
) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  // Convert "15/JAN/2056" to "2056-01-15" using your dayjs library or native JS
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
};
