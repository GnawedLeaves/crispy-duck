"use client";

import { parseTautaScan, withDelay } from "@/app/utils/common";
import { ProcessScanResponse } from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useMemo, useState, ViewTransition } from "react";

interface ScanFormProps {
  handleFileUpload: (file: File) => Promise<ProcessScanResponse | undefined>;
}
const ScanForm = ({ handleFileUpload }: ScanFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  null;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setInputFile(file);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleConfirmUpload = withDelay(async () => {
    if (inputFile) {
      setLoading(true);
      const data = await handleFileUpload(inputFile);
      const textFromData = data?.data.text;
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
        <div style={{ textAlign: "left" }}>
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
            className="standardButton  bg-lime-200!"
            onClick={handleConfirmUpload}
          >
            Scan
          </button>
          <button className="standardButton " onClick={handleReplaceImage}>
            Replace
          </button>
        </div>
      ) : (
        !loading && (
          <div>
            <label className="standardButton  cursor-pointer inline-block">
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
