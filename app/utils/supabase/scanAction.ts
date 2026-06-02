"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

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
    return functionData;
  } catch (err: any) {
    console.error(err);
  }
}
