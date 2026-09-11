"use client";

import { AnimatedLoadingText } from "@/app/components/loading/AnimatedLoading";
import { token } from "@/app/theme";
import { ITautaScanData } from "@/app/types/commonTypes";
import { parseTautaScan, withDelay } from "@/app/utils/common";
import { getScanImageUrl } from "@/app/utils/supabase/scanAction";
import {
  mapScanRowToScanData,
  TanitaScanRow,
} from "@/app/utils/supabase/scanTypes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, ViewTransition } from "react";
import EditFormView, { loadDraftFromCookie } from "./editFormView";
import ScanHistoryList from "./scanHistoryList";

// How many required fields can be empty before we consider the scan invalid
const EMPTY_FIELDS_THRESHOLD = 5;
const OPTIONAL_FIELDS = ["degreeOfObesity", "idealBodyWeight"];

type ScanProgressStage = "upload" | "processing" | "retrieving";

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
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${isActive ? "font-semibold" : "opacity-70"
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

// Convert File to raw base64 string (without the data:xxx prefix)
const fileToRawBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
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
type MainTab = "add" | "history";

const ScannerView = ({ handleFileUpload, currentUserId }: ScannerViewProps) => {
  const [activeTab, setActiveTab] = useState<MainTab>("add");
  const [editingScan, setEditingScan] = useState<TanitaScanRow | null>(null);
  const [editingScanImageUrl, setEditingScanImageUrl] = useState<
    string | null
  >(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [scrollToScanId, setScrollToScanId] = useState<string | null>(null);
  const [step, setStep] = useState<ViewStep>("scan");
  const [imagePreview, setImagePreview] = useState<string | null>(null); // base64
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [rawResult, setRawResult] = useState<string>("");
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null,
  );
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
    setUploadedImagePath(null);
    setScanError(null);
    setLoading(false);
    setProgressSteps(createDefaultProgressSteps());
    setProgressMessage(null);
  };

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
    setScanError(null);
    setProgressSteps(createDefaultProgressSteps());
    setProgressMessage("Preparing your scan...");

    try {
      // Step 1: Convert file to base64 on client
      const base64 = await fileToRawBase64(inputFile);

      // Step 2: Send as JSON (fixes iOS Safari + Vercel FormData bug)
      const apiResponse = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          base64,
          fileName: inputFile.name,
          mimeType: inputFile.type || "image/jpeg",
        }),
      });

      if (!apiResponse.ok) {
        let errorMsg = `Server error: ${apiResponse.status}`;
        try {
          const errorData = await apiResponse.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
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

      const data = await apiResponse.json();
      const text = data?.data?.text;

      if (!text) {
        throw new Error(
          data?.error ??
          "We could not read this scan. Please try a clearer image.",
        );
      }

      setUploadedImagePath(data?.filePath ?? null);

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
      setScanError(
        error?.message ?? "We could not upload your scan. Please try again.",
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

  // Fetch a signed URL for the existing scan's image so it can be shown for
  // reference while editing (the "scans" storage bucket is private).
  useEffect(() => {
    if (!editingScan?.scan_image_id) {
      setEditingScanImageUrl(null);
      return;
    }
    let cancelled = false;
    getScanImageUrl(editingScan.scan_image_id).then((url) => {
      if (!cancelled) setEditingScanImageUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [editingScan]);

  if (editingScan) {
    return (
      <EditFormView
        imagePreview={editingScanImageUrl}
        scanId={editingScan.id}
        initialData={mapScanRowToScanData(editingScan)}
        currentUserId={currentUserId}
        onSuccess={() => {
          setScrollToScanId(editingScan.id);
          setEditingScan(null);
          setHistoryRefreshKey((prev) => prev + 1);
        }}
        onBack={() => {
          setScrollToScanId(editingScan.id);
          setEditingScan(null);
        }}
      />
    );
  }

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
        scanImageId={uploadedImagePath}
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
      <div className="flexCenter w-full flex-col gap-6">
        <div className="flex gap-2 w-full max-w-lg">
          <button
            className={
              activeTab === "add" ? "standardButtonPressed flex-1" : "standardButton flex-1"
            }
            style={{
              background:
                activeTab === "add"
                  ? token.light.primaryColor
                  : token.light.background,
            }}
            onClick={() => setActiveTab("add")}
          >
            Add Scan
          </button>
          <button
            className={
              activeTab === "history" ? "standardButtonPressed flex-1" : "standardButton flex-1"
            }
            style={{
              background:
                activeTab === "history"
                  ? token.light.primaryColor
                  : token.light.background,
            }}
            onClick={() => setActiveTab("history")}
          >
            Past Scans
          </button>
        </div>

        {activeTab === "history" ? (
          <ScanHistoryList
            currentUserId={currentUserId}
            refreshKey={historyRefreshKey}
            onEditScan={setEditingScan}
            scrollToScanId={scrollToScanId}
            onScrolledToScan={() => setScrollToScanId(null)}
          />
        ) : (
          <div className="flexCenter min-h-[60vh] w-full flex-col gap-6">
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
                  accept="image/*"
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
        )}
      </div>
    </ViewTransition>
  );
};

export default ScannerView;