"use client";

import { token } from "@/app/theme";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import { ProcessScanResponse } from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useMemo, useState } from "react";

interface ScanFormProps {
  handleFileUpload: (
    formData: FormData,
  ) => Promise<ProcessScanResponse | undefined>;
}

// 1. Safe Client-Side HEIC Converter with error logging return
// ScanForm.tsx
async function processAndConvertFile(
  file: File,
  onError: (msg: string) => void,
): Promise<File> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type.includes("heic") ||
    file.type.includes("heif");

  if (!isHeic) {
    // ✅ Already JPEG/PNG/etc
    return file;
  }

  // 🔴 HEIC detected—MUST convert or reject
  try {
    const heic2any = (await import("heic2any")).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    const resultBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    if (resultBlob.size === 0) {
      throw new Error("HEIC conversion produced empty blob");
    }

    const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

    return new File([resultBlob], safeName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error: any) {
    const errText = error?.message || String(error);
    console.error("HEIC conversion failed:", error);
    // 🔴 REJECT the upload instead of falling back
    onError(
      `iPhone photos must be converted to JPEG first. Conversion failed: ${errText}. Try using Screenshot or Files app.`
    );
    throw error; // Stop the upload
  }
}

const ScanForm = ({ handleFileUpload }: ScanFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // State for on-screen debug errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  setErrorMessage(null);
  const files = e.target.files;

  if (files && files.length > 0) {
    setLoading(true);
    const rawFile = files[0];

    try {
      const readyFile = await processAndConvertFile(rawFile, (msg) =>
        setErrorMessage(msg),
      );
      // ✅ If we get here, conversion succeeded
      setInputFile(readyFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setErrorMessage("FileReader failed to read the selected file on this device.");
        setLoading(false);
      };
      reader.readAsDataURL(readyFile);
    } catch (err: any) {
      // ✅ Catch conversion errors
      setErrorMessage(`File selection error: ${err?.message || String(err)}`);
      setLoading(false);
    }
  }
};
  const handleConfirmUpload = withDelay(async () => {
    if (inputFile) {
      setLoading(true);
      setErrorMessage(null);

      try {
        const formData = new FormData();
        formData.append("file", inputFile);

        const data = await handleFileUpload(formData);

        if (!data) {
          setErrorMessage(
            "Server returned no response or upload returned undefined.",
          );
        } else if (data?.data?.text) {
          setResult(data.data.text);
        } else {
          setErrorMessage(
            `Upload processed but no text was returned. Data: ${JSON.stringify(data)}`,
          );
        }
      } catch (err: any) {
        const errorDetail = err?.message || String(err);
        console.error("Upload error:", err);
        setErrorMessage(`Upload Failed: ${errorDetail}`);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleReplaceImage = withDelay(() => {
    setInputFile(null);
    setImagePreview(null);
    setResult("");
    setErrorMessage(null);
  });

  const processedResult = useMemo(() => {
    if (result) {
      return parseTautaScan(result);
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
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm break-words">
          <strong className="font-bold block">Debug Log:</strong>
          <span>{errorMessage}</span>
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
    </div>
  );
};

export default ScanForm;
