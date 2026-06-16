"use client";

import { ITautaScanData } from "@/app/types/commonTypes";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import { ProcessScanResponse } from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useEffect, useMemo, useState, ViewTransition } from "react";
import EditFormView, { loadDraftFromCookie } from "./editFormView";
import Link from "next/link";
import { token } from "@/app/theme";

// How many required fields can be empty before we consider the scan invalid
const EMPTY_FIELDS_THRESHOLD = 5;
const OPTIONAL_FIELDS = ["degreeOfObesity", "idealBodyWeight"];
const IMAGE_STORAGE_KEY = "tauta_scan_image";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const countEmptyRequiredFields = (data: Record<string, any>): number =>
  Object.entries(data).filter(
    ([key, val]) =>
      !OPTIONAL_FIELDS.includes(key) &&
      (val === null || val === undefined || val === ""),
  ).length;

interface ScannerViewProps {
  handleFileUpload: (file: File) => Promise<ProcessScanResponse | undefined>;
  currentUserId: string;
}

type ViewStep = "scan" | "edit" | "success";

const ScannerView = ({ handleFileUpload, currentUserId }: ScannerViewProps) => {
  const [step, setStep] = useState<ViewStep>("scan");
  const [imagePreview, setImagePreview] = useState<string | null>(null); // base64
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [rawResult, setRawResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState<ITautaScanData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // On mount: restore draft from cookie if one exists
  useEffect(() => {
    const draft = loadDraftFromCookie();
    if (draft) {
      setScanData(draft.data);
      setImagePreview(draft.imagePreview);
      setStep("edit");
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    let file = files[0];

    // Convert HEIC to JPEG for compatibility
    if (file.type === "image/heic" || file.type === "image/heif") {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });
      file = new File(
        [converted as Blob],
        file.name.replace(/\.heic$/i, ".jpeg"),
        { type: "image/jpeg" },
      );
    }
    setInputFile(file);
    setScanError(null);
    const base64 = await fileToBase64(file);
    setImagePreview(base64);
  };

  const handleConfirmUpload = withDelay(async () => {
    if (!inputFile) return;
    setLoading(true);
    const data = await handleFileUpload(inputFile);
    const text = data?.data.text;
    if (text) {
      setRawResult(text);
    }
    setLoading(false);
  });

  const handleReplaceImage = withDelay(() => {
    setInputFile(null);
    setImagePreview(null);
    setRawResult("");
    setScanError(null);
  });

  const processedResult = useMemo(() => {
    if (rawResult) return parseTautaScan(rawResult);
  }, [rawResult]);

  // When scan result is ready, validate then move to edit step
  useEffect(() => {
    if (!processedResult) return;
    const emptyCount = countEmptyRequiredFields(
      processedResult as Record<string, any>,
    );
    if (emptyCount >= EMPTY_FIELDS_THRESHOLD) {
      setScanError(
        `This image doesn't look like a valid Tanita scan — ${emptyCount} fields couldn't be read. Please upload a clearer photo of the printout.`,
      );
      return;
    }
    setScanData(processedResult as ITautaScanData);
    setStep("edit");
  }, [processedResult]);

  if (step === "success") {
    return (
      <div className="flexCenter flex-col gap-4">
        <div className="cardWithShadow text-center flex flex-col gap-3 px-8 py-6">
          <p className="font-semibold">Scan saved!</p>
          <p className="text-sm opacity-60">
            Your body composition data has been recorded.
          </p>
        </div>
        <div className="flex gap-4">
          <Link className="standardButton" href={"/stats"}>
            Go to Stats
          </Link>
          <button
            className="standardButton bg-lime-200!"
            onClick={() => {
              setStep("scan");
              setInputFile(null);
              setImagePreview(null);
              setRawResult("");
              setScanData(null);
            }}
          >
            Scan another
          </button>
        </div>
      </div>
    );
  }

  if (step === "edit" && scanData) {
    return (
      <EditFormView
        imagePreview={imagePreview}
        initialData={scanData}
        currentUserId={currentUserId}
        onSuccess={() => {
          setInputFile(null);
          setImagePreview(null);
          setRawResult("");
          setScanData(null);
          setStep("success");
        }}
        onBack={() => {
          setStep("scan");
          setInputFile(null);
          setImagePreview(null);
          setRawResult("");
          setScanData(null);
        }}
      />
    );
  }

  // step === "scan"
  return (
    <ViewTransition>
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
              className="standardButton bg-lime-200!"
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
            <label
              className="standardButton cursor-pointer font-bold text-center w-50 h-50 text-5xl flexCenter"
              style={{ background: token.light.blueColor }}
            >
              Add File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )
        )}

        {loading && <span className="loading loading-spinner loading-md" />}

        {scanError && (
          <div className="cardWithShadow flex flex-col gap-3 text-center max-w-xs">
            <p className="text-sm font-semibold">⚠️ Couldn't read this image</p>
            <p className="text-sm opacity-60">{scanError}</p>
            <button
              className="standardButton bg-red-100!"
              onClick={handleReplaceImage}
            >
              Try a different image
            </button>
          </div>
        )}
      </div>
    </ViewTransition>
  );
};

export default ScannerView;
