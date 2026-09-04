"use client";

import { ITautaScanData } from "@/app/types/commonTypes";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import {
  processScanFile,
  uploadScanToStorage,
} from "@/app/utils/supabase/scanAction";
import Image from "next/image";
import { useEffect, useMemo, useState, ViewTransition } from "react";
import EditFormView, { loadDraftFromCookie } from "./editFormView";
import Link from "next/link";
import { token } from "@/app/theme";
import { AnimatedLoadingText } from "@/app/components/loading/AnimatedLoading";

// How many required fields can be empty before we consider the scan invalid
const EMPTY_FIELDS_THRESHOLD = 5;
const OPTIONAL_FIELDS = ["degreeOfObesity", "idealBodyWeight"];

type ScanProgressStage = "upload" | "processing" | "retrieving";

const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 60_000;
const PROCESSING_TIMEOUT_MS = 120_000;

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("The request timed out. Please try again.")),
        timeoutMs,
      );
    }),
  ]);

const prepareImageFile = async (file: File): Promise<File> => {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type.toLowerCase().includes("heic") ||
    file.type.toLowerCase().includes("heif") ||
    file.type === "";

  if (!isHeic) return file;

  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.8,
  });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  return new File(
    [convertedBlob],
    file.name.replace(/\.[^/.]+$/, ".jpg"),
    { type: "image/jpeg", lastModified: Date.now() },
  );
};

interface ScanProgressStep {
  id: ScanProgressStage;
  label: string;
  done: boolean;
  active: boolean;
}

const createDefaultProgressSteps = (): ScanProgressStep[] => [
  {
    id: "upload",
    label: "Uploading image to database",
    done: false,
    active: true,
  },
  {
    id: "processing",
    label: "Reading your scan with Google Doc AI",
    done: false,
    active: false,
  },
  {
    id: "retrieving",
    label: "Retrieving your results",
    done: false,
    active: false,
  },
];

const getProgressPercent = (steps: ScanProgressStep[]) => {
  const completed = steps.filter((step) => step.done).length;
  return Math.round((completed / steps.length) * 100);
};

const ScanProgressChecklist = ({ steps }: { steps: ScanProgressStep[] }) => {
  const progress = getProgressPercent(steps);

  return (
    <div className="cardWithShadow w-full max-w-md px-4 py-4">
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: token.light.primaryColor,
          }}
        />
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {steps.map((step) => {
          const icon = step.done ? "✓" : step.active ? "●" : "○";
          const isActive = step.active && !step.done;

          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                isActive ? "font-semibold" : "opacity-70"
              }`}
            >
              <span className="min-w-4 text-base">{icon}</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

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
  handleFileUpload: (file: File) => Promise<any>;
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
  const [progressSteps, setProgressSteps] = useState<ScanProgressStep[]>(
    createDefaultProgressSteps(),
  );
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  // On mount: restore draft from cookie if one exists
  useEffect(() => {
    const draft = loadDraftFromCookie();
    if (draft) {
      setScanData(draft.data);
      setImagePreview(draft.imagePreview);
      setStep("edit");
    }
  }, []);

  // Shared reset used by "replace image", "back from edit", and "scan another"
  const resetScanState = () => {
    setInputFile(null);
    setImagePreview(null);
    setRawResult("");
    setScanError(null);
    setLoading(false);
    setProgressSteps(createDefaultProgressSteps());
    setProgressMessage(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const file = await prepareImageFile(files[0]);
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("This image is larger than 9 MB. Please choose a smaller image.");
      }

      setInputFile(file);
      setScanError(null);
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
    } catch (error: any) {
      setInputFile(null);
      setImagePreview(null);
      setScanError(error?.message ?? "We could not prepare this image. Please try another file.");
    }
  };

  const handleConfirmUpload = withDelay(async () => {
    if (!inputFile) return;

    setLoading(true);
    setScanError(null);
    setProgressSteps(createDefaultProgressSteps());
    setProgressMessage("Preparing your scan...");

    try {
      const uploadResult = await withTimeout(
        uploadScanToStorage(inputFile),
        UPLOAD_TIMEOUT_MS,
      );
      if (!uploadResult.success || !uploadResult.filePath) {
        throw new Error(
          uploadResult.error ??
            "We could not upload your scan image. Please try again.",
        );
      }

      setProgressSteps((prev) =>
        prev.map((step) =>
          step.id === "upload"
            ? { ...step, done: true, active: false }
            : step.id === "processing"
              ? { ...step, active: true }
              : step,
        ),
      );
      setProgressMessage("Reading your scan with Google AI...");

      const data = await withTimeout(
        processScanFile(
          uploadResult.filePath,
          uploadResult.mimeType ?? inputFile.type,
        ),
        PROCESSING_TIMEOUT_MS,
      );
      const text = data?.data?.text;

      if (!text) {
        throw new Error(
          "We could not read this scan. Please try a clearer image.",
        );
      }

      setProgressSteps((prev) =>
        prev.map((step) =>
          step.id === "processing"
            ? { ...step, done: true, active: false }
            : step.id === "retrieving"
              ? { ...step, active: true }
              : step,
        ),
      );
      setProgressMessage("Collecting your scan details...");
      setRawResult(text);
    } catch (error: any) {
      console.error("Scan upload failed:", error);
      setScanError(error?.message ?? "We could not upload your scan. Please try again.");
      setProgressSteps((prev) =>
        prev.map((step) => ({ ...step, active: false })),
      );
    } finally {
      setLoading(false);
    }
  });

  const handleReplaceImage = withDelay(resetScanState);

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
        `This image doesn't look like a valid Tanita scan: ${emptyCount} fields couldn't be read. Please upload a clearer photo of the printout.`,
      );
      setProgressSteps((prev) =>
        prev.map((step) =>
          step.id === "retrieving" ? { ...step, active: false } : step,
        ),
      );
      setLoading(false);
      return;
    }

    setProgressSteps((prev) =>
      prev.map((step) =>
        step.id === "retrieving"
          ? { ...step, done: true, active: false }
          : step,
      ),
    );
    setProgressMessage("Scan is ready to review.");
    setScanData(processedResult as ITautaScanData);
    setLoading(false);
    setStep("edit");
  }, [processedResult]);

  const handleScanAnother = () => {
    setStep("scan");
    resetScanState();
    setScanData(null);
  };

  if (step === "success") {
    return (
      <div className="flexCenter min-h-[70vh] flex-col gap-4">
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
            className="standardButton "
            style={{ background: token.light.primaryColor }}
            onClick={handleScanAnother}
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
          resetScanState();
          setScanData(null);
          setStep("success");
        }}
        onBack={() => {
          setStep("scan");
          resetScanState();
        }}
      />
    );
  }

  // step === "scan"
  return (
    <ViewTransition>
      <div className="flexCenter min-h-[70vh] w-full flex-col gap-6">
        {imagePreview && (
          <Image
            alt="scan_preview_image"
            width={200}
            height={200}
            src={imagePreview}
            className="standardBorder"
          />
        )}

        {loading ? (
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md" />
            </div>
            {/* {progressMessage && (
              <p className="text-sm opacity-60">{progressMessage}</p>
            )} */}
            <AnimatedLoadingText
              messages={[
                "Squeezing your fats...",
                "Gripping your muscles...",
                "Checking your water levels...",
                "Measuring your head width...",
                "Feeding ducks...",
              ]}
              interval={5000}
            />
            <ScanProgressChecklist steps={progressSteps} />
          </div>
        ) : inputFile ? (
          <div className="flexCenter gap-4">
            <button
              className="standardButton "
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
          <label className="standardButton cursor-pointer font-bold flexCenter">
            Add File
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

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
