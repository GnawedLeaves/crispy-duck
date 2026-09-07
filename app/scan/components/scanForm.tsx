"use client";

import { token } from "@/app/theme";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import { ProcessScanResponse } from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ScanFormProps {
  handleFileUpload: (
    formData: FormData,
  ) => Promise<ProcessScanResponse | undefined>;
}

// Initialize Eruda for mobile debugging
function initializeEruda() {
  if (typeof window !== "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda@3/dist/eruda.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      // @ts-ignore
      if (window.eruda) {
        // @ts-ignore
        window.eruda.init();
      }
    };
  }
}

// 1. Safe Client-Side HEIC Converter with error logging
async function processAndConvertFile(
  file: File,
  onError: (msg: string) => void,
): Promise<File | null> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type.includes("heic") ||
    file.type.includes("heif");

  console.log("🔍 FILE DETECTION:", {
    name: file.name,
    ext: fileExt,
    type: file.type,
    isHeic,
    size: file.size,
  });

  if (!isHeic) {
    console.log("✅ Not HEIC, using original file");
    return file;
  }

  // 🔴 HEIC detected—MUST convert or reject
  console.log("🔄 HEIC DETECTED - Attempting conversion...");

  try {
    console.log("📦 Loading heic2any library...");
    const heic2any = (await import("heic2any")).default;
    console.log("✅ heic2any loaded successfully");

    console.log("🔄 Converting HEIC to JPEG...");
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });
    console.log("✅ Conversion completed");

    const resultBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    console.log("📊 Result blob size:", resultBlob.size);

    if (resultBlob.size === 0) {
      throw new Error("HEIC conversion produced empty blob (0 bytes)");
    }

    const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

    const convertedFile = new File([resultBlob], safeName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    console.log("✅ HEIC CONVERSION SUCCESS:", {
      originalName: file.name,
      newName: convertedFile.name,
      newType: convertedFile.type,
      newSize: convertedFile.size,
    });

    return convertedFile;
  } catch (error: any) {
    const errText = error?.message || String(error);
    console.error("❌ HEIC CONVERSION FAILED:", {
      error: error,
      message: errText,
      errorType: error?.constructor?.name,
    });

    const friendlyMessage = `HEIC Conversion Error: ${errText}

Try these fixes:
1. Take a screenshot of your Tanita scale (screenshots are JPEG)
2. Use the Files app to convert the photo to JPEG before uploading
3. Use a different browser (Safari/Chrome)`;

    onError(friendlyMessage);
    return null; // Return null to signal failure
  }
}

const ScanForm = ({ handleFileUpload }: ScanFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Eruda on mount for mobile debugging
  useEffect(() => {
    initializeEruda();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;

    if (files && files.length > 0) {
      setLoading(true);
      const rawFile = files[0];

      console.log("📤 File selected, starting processing...");

      try {
        const readyFile = await processAndConvertFile(rawFile, (msg) => {
          console.log("🚨 Conversion error callback triggered");
          setErrorMessage(msg);
        });

        // ✅ Check if conversion failed (returns null)
        if (!readyFile) {
          console.log("❌ File conversion returned null, stopping");
          setLoading(false);
          return; // Stop here, error is already displayed via onError callback
        }

        console.log("✅ File ready for preview, starting FileReader...");
        setInputFile(readyFile);

        const reader = new FileReader();
        reader.onload = (event) => {
          console.log("✅ FileReader completed successfully");
          setImagePreview(event.target?.result as string);
          setLoading(false);
        };
        reader.onerror = () => {
          console.error("❌ FileReader failed");
          setErrorMessage(
            "FileReader failed to read the selected file on this device.",
          );
          setLoading(false);
        };
        reader.readAsDataURL(readyFile);
      } catch (err: any) {
        // Only catch unexpected errors here, not conversion errors
        const errorDetail = err?.message || String(err);
        console.error("❌ UNEXPECTED ERROR IN handleFileChange:", err);
        setErrorMessage(
          `Unexpected error: ${errorDetail}. Try using a screenshot instead.`,
        );
        setLoading(false);
      }
    }
  };

  const handleConfirmUpload = withDelay(async () => {
    if (inputFile) {
      setLoading(true);
      setErrorMessage(null);

      try {
        console.log("🚀 Starting upload with file:", {
          name: inputFile.name,
          type: inputFile.type,
          size: inputFile.size,
        });

        const formData = new FormData();
        formData.append("file", inputFile);

        const data = await handleFileUpload(formData);

        console.log("📥 Upload response received:", data);

        if (!data) {
          console.error("❌ Response is null/undefined");
          setErrorMessage(
            "Server returned no response or upload returned undefined.",
          );
        } else if (data?.data?.text) {
          console.log("✅ OCR text received, length:", data.data.text.length);
          setResult(data.data.text);
        } else {
          console.error("❌ No text in response:", data);
          setErrorMessage(
            `Upload processed but no text was returned. Data: ${JSON.stringify(data)}`,
          );
        }
      } catch (err: any) {
        const errorDetail = err?.message || String(err);
        console.error("❌ Upload error:", err);
        setErrorMessage(`Upload Failed: ${errorDetail}`);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleReplaceImage = withDelay(() => {
    console.log("🔄 Replacing image");
    setInputFile(null);
    setImagePreview(null);
    setResult("");
    setErrorMessage(null);
  });

  const processedResult = useMemo(() => {
    if (result) {
      try {
        console.log("📊 Parsing OCR result...");
        const parsed = parseTautaScan(result);
        console.log("✅ Parse successful:", parsed);
        return parsed;
      } catch (e) {
        console.error("❌ Parse error:", e);
        setErrorMessage(`Parse error: ${String(e)}`);
        return null;
      }
    }
  }, [result]);

  const renderResults = () => {
    if (!processedResult) return <div>-</div>;
    return Object.entries(processedResult).map(([key, value]) => {
      return (
        <div key={key} style={{ textAlign: "left" }}>
          {key}: {String(value)} <br />
        </div>
      );
    });
  };

  return (
    <div className="flexCenter flex-col gap-4 max-w-md mx-auto p-4">
      {/* Visual Debug Error Banner */}
      {errorMessage && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm break-words whitespace-pre-wrap">
          <strong className="font-bold block">⚠️ Error:</strong>
          <span className="text-xs block mt-2">{errorMessage}</span>
          <button
            className="mt-2 block text-xs underline font-semibold"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {imagePreview && (
        <Image
          alt="scan_preview_image"
          width={200}
          height={200}
          src={imagePreview}
          className="standardBorder"
        />
      )}

      {inputFile && !loading ? (
        <div className="flexCenter gap-4">
          <button
            className="standardButton"
            style={{ background: token.light.primaryColor }}
            onClick={handleConfirmUpload}
          >
            Scan
          </button>
          <button className="standardButton" onClick={handleReplaceImage}>
            Replace
          </button>
        </div>
      ) : (
        !loading && (
          <div>
            <label className="standardButton cursor-pointer inline-block">
              Add file
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )
      )}
      {loading && <span className="loading loading-spinner loading-md"></span>}
      <br />

      <div className="flexCenter" style={{ flexDirection: "column" }}>
        {renderResults()}
      </div>

      {/* Mobile Debugger Hint */}
      <div className="text-xs text-gray-500 mt-4 text-center">
        💡 On iPhone: Look for floating icon at bottom-right corner for console
        logs
      </div>
    </div>
  );
};

export default ScanForm;
