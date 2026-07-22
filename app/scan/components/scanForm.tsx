"use client";

import { token } from "@/app/theme";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import { ProcessScanResponse } from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useMemo, useState } from "react";
import heic2any from "heic2any"; // 1. Import heic2any

interface ScanFormProps {
  handleFileUpload: (file: File) => Promise<ProcessScanResponse | undefined>;
}

// 2. Helper to convert HEIC/HEIF to JPG directly in the browser
async function processAndConvertFile(file: File): Promise<File> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type.includes("heic") ||
    file.type.includes("heif");

  if (!isHeic) {
    return file; // Return as-is if it's already JPEG/PNG
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    const resultBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    const jpegFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

    return new File([resultBlob], jpegFileName, {
      type: "image/jpeg",
    });
  } catch (error) {
    console.error("HEIC conversion failed, using original file:", error);
    return file;
  }
}

const ScanForm = ({ handleFileUpload }: ScanFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 3. Updated handleFileChange to convert HEIC/HEIF files on selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLoading(true); // Optional: show spinner while converting on mobile
      const rawFile = files[0];

      // Convert HEIC to JPEG if needed
      const readyFile = await processAndConvertFile(rawFile);

      setInputFile(readyFile);

      const previewUrl = URL.createObjectURL(readyFile);
      setImagePreview(previewUrl);
      setLoading(false);
    }
  };

  const handleConfirmUpload = withDelay(async () => {
    if (inputFile) {
      setLoading(true);
      const data = await handleFileUpload(inputFile);
      const textFromData = data?.data?.text;
      if (textFromData) {
        setResult(textFromData);
      }
      setLoading(false);
    }
  });

  const handleReplaceImage = withDelay(() => {
    setInputFile(null);
    setImagePreview(null);
    setResult("");
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
          {key}: {value} <br />
        </div>
      );
    });
  };

  return (
    <div className="flexCenter flex-col gap-4">
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
