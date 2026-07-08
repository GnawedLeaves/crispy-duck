"use client";

import { ITautaScanData } from "@/app/types/commonTypes";
import { uploadScanData } from "@/app/utils/supabase/scanAction";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { withDelay } from "@/app/utils/common";
import { NativeBirthdayPicker } from "@/app/components/birthdayPicker/NativeBirthdayPicker";
import dayjs from "dayjs";
import { token } from "@/app/theme";

const COOKIE_KEY = "tauta_scan_draft";
const IMAGE_STORAGE_KEY = "tauta_scan_image";

export interface DraftCookiePayload {
  data: ITautaScanData;
  imagePreview: string | null;
}

const FIELD_LABELS: Record<keyof ITautaScanData, string> = {
  scanDate: "Scan Date",
  scanTime: "Scan Time",
  weight: "Weight (kg)",
  clothesWeight: "Clothes Weight (kg)",
  fatPercentage: "Body Fat (%)",
  fatMass: "Fat Mass (kg)",
  ffm: "Fat-Free Mass (kg)",
  muscleMass: "Muscle Mass (kg)",
  tbw: "Total Body Water (L)",
  tbwPercent: "TBW (%)",
  boneMass: "Bone Mass (kg)",
  bmr: "BMR (kcal)",
  metabolicAge: "Metabolic Age",
  visceralFatRating: "Visceral Fat Rating",
  bmi: "BMI",
  degreeOfObesity: "Degree of Obesity (%)",
  idealBodyWeight: "Ideal Body Weight (kg)",
};

// Fields that are optional (nullable in DB)
const OPTIONAL_FIELDS: Array<keyof ITautaScanData> = [
  "degreeOfObesity",
  "idealBodyWeight",
];

interface EditFormViewProps {
  initialData: ITautaScanData;
  currentUserId: string;
  onSuccess: () => void;
  onBack: () => void;
  imagePreview: string | null;
}

// Scan data goes in a cookie (readable server-side if ever needed)
// Image goes in sessionStorage — base64 strings are too large for cookies
const saveDraftToCookie = (
  data: ITautaScanData,
  imagePreview: string | null,
) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(data))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  if (imagePreview) {
    sessionStorage.setItem(IMAGE_STORAGE_KEY, imagePreview);
  } else {
    sessionStorage.removeItem(IMAGE_STORAGE_KEY);
  }
};

const clearDraftCookie = () => {
  document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  sessionStorage.removeItem(IMAGE_STORAGE_KEY);
};

export const loadDraftFromCookie = (): DraftCookiePayload | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`));
  if (!match) return null;
  try {
    const data = JSON.parse(decodeURIComponent(match.split("=")[1]));
    const imagePreview = sessionStorage.getItem(IMAGE_STORAGE_KEY) ?? null;
    return { data, imagePreview };
  } catch {
    return null;
  }
};

// Try to infer which field caused a server error based on error message
const parseServerError = (
  errorMessage: string,
  formData: ITautaScanData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Common patterns: "numeric field overflow", "value too large", "out of range"
  if (
    errorMessage.toLowerCase().includes("numeric") ||
    errorMessage.toLowerCase().includes("overflow") ||
    errorMessage.toLowerCase().includes("out of range")
  ) {
    // Check which numeric fields have suspicious values and flag them
    const numericFields: Array<keyof ITautaScanData> = [
      "weight",
      "clothesWeight",
      "fatPercentage",
      "fatMass",
      "ffm",
      "muscleMass",
      "tbw",
      "tbwPercent",
      "boneMass",
      "bmr",
      "metabolicAge",
      "visceralFatRating",
      "bmi",
      "degreeOfObesity",
      "idealBodyWeight",
    ];

    numericFields.forEach((field) => {
      const value = formData[field];
      if (value !== null && value !== undefined && value !== "") {
        errors[field] = "Check value (may be too large or invalid)";
      }
    });

    if (Object.keys(errors).length === 0) {
      // Fallback if we can't identify specific field
      errors._server = errorMessage;
    }
  }

  // Invalid time/date errors
  if (
    errorMessage.toLowerCase().includes("invalid date") ||
    errorMessage.toLowerCase().includes("time")
  ) {
    errors.scanDate = "Check date format";
    errors.scanTime = "Check time format";
  }

  return errors;
};

// Validate form data and return errors
const validateFormData = (data: ITautaScanData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Check required fields
  const requiredFields: Array<keyof ITautaScanData> = Object.keys(
    FIELD_LABELS,
  ).filter(
    (key) => !OPTIONAL_FIELDS.includes(key as keyof ITautaScanData),
  ) as Array<keyof ITautaScanData>;

  requiredFields.forEach((field) => {
    const value = data[field];
    if (value === null || value === undefined || value === "") {
      errors[field] = "Required";
    }
  });

  // Validate time format specifically
  if (data.scanTime && data.scanTime !== "") {
    // Check if it's a valid HH:mm format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(String(data.scanTime))) {
      errors.scanTime = "Invalid time format (HH:mm)";
    }
  }

  // Validate date format
  if (data.scanDate && data.scanDate !== "") {
    if (!dayjs(String(data.scanDate), "YYYY-MM-DD", true).isValid()) {
      errors.scanDate = "Invalid date format (YYYY-MM-DD)";
    }
  }

  return errors;
};

const EditFormView = ({
  initialData,
  currentUserId,
  onSuccess,
  onBack,
  imagePreview,
}: EditFormViewProps) => {
  const rawDate = initialData?.scanDate;
  let formattedDate = "";

  if (rawDate) {
    const parsed = dayjs(rawDate);
    if (parsed.isValid()) {
      // Check if date is in the future, if so default to today
      const today = dayjs();
      if (parsed.isAfter(today, "day")) {
        formattedDate = today.format("YYYY-MM-DD");
      } else {
        formattedDate = parsed.format("YYYY-MM-DD");
      }
    }
  }

  const normalizedInitialData = {
    ...initialData,
    scanDate: formattedDate,
    scanTime: initialData.scanTime
      ? dayjs(initialData.scanTime).format("HH:mm")
      : "",
  };

  const [formData, setFormData] = useState<ITautaScanData>(
    normalizedInitialData,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // persist draft to cookie on every change (imagePreview stored in sessionStorage)
  useEffect(() => {
    saveDraftToCookie(formData, imagePreview);
  }, [formData, imagePreview]);

  const onBackClick = withDelay(() => {
    clearDraftCookie();
    onBack();
  });

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      setTimeout(() => {
        fieldRefs.current[firstErrorField]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    }
  };

  const handleChange = (key: keyof ITautaScanData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value === "" && OPTIONAL_FIELDS.includes(key) ? null : value,
    }));
  };

  const handleSubmit = withDelay(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      scrollToFirstError(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await uploadScanData(formData, currentUserId);
      if (dbError) {
        // Try to parse server error to identify problematic field
        const errorMessage = dbError.message;
        const fieldErrorMapping = parseServerError(errorMessage, formData);

        if (Object.keys(fieldErrorMapping).length > 0) {
          setFieldErrors(fieldErrorMapping);
          scrollToFirstError(fieldErrorMapping);
          setError(
            "Please check the highlighted fields and correct any issues.",
          );
        } else {
          setError(errorMessage ?? "Something went wrong. Please try again.");
        }
        return;
      }
      clearDraftCookie();
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  const fieldEntries = Object.entries(FIELD_LABELS) as [
    keyof ITautaScanData,
    string,
  ][];

  return (
    <div className="flexCenter flex-col gap-6 w-full max-w-lg mx-auto">
      <div>
        {imagePreview && (
          <Image
            alt="scan_preview_image"
            width={200}
            height={200}
            src={imagePreview}
            className="standardBorder"
          />
        )}
      </div>
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-1">Review your scan</h2>
        <p className="text-sm opacity-60">
          Check values before saving to profile.
          <br />
          You may leave and continue later.
        </p>
      </div>

      <div className="cardWithShadow w-full flex flex-col gap-3">
        {fieldEntries.map(([key, label]) => {
          const hasError = !!fieldErrors[key];
          return (
            <div
              key={key}
              ref={(el) => {
                if (el) fieldRefs.current[key] = el;
              }}
              className="flex flex-col gap-1"
            >
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${
                  hasError ? "text-red-500" : "opacity-60"
                }`}
              >
                {label}
                {OPTIONAL_FIELDS.includes(key) && (
                  <span className="ml-1 normal-case opacity-40">
                    (optional)
                  </span>
                )}
              </label>

              {key === "scanDate" ? (
                <div
                  className={hasError ? "border border-red-400 rounded-md" : ""}
                >
                  <NativeBirthdayPicker
                    value={formData.scanDate ? String(formData.scanDate) : ""}
                    onChange={(dateString) =>
                      handleChange("scanDate", dateString)
                    }
                    placeholder="Select scan date"
                  />
                </div>
              ) : key === "scanTime" ? (
                <input
                  type="time"
                  value={formData.scanTime ? String(formData.scanTime) : ""}
                  onChange={(e) => handleChange("scanTime", e.target.value)}
                  className={`signUpFormField text-sm bg-transparent outline-none ${
                    hasError ? "border-red-400" : ""
                  }`}
                />
              ) : (
                <input
                  type="number"
                  value={
                    formData[key] === null || formData[key] === undefined
                      ? ""
                      : String(formData[key])
                  }
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={OPTIONAL_FIELDS.includes(key) ? "—" : ""}
                  className={`signUpFormField text-sm w-full bg-transparent outline-none ${
                    hasError ? "border-red-400" : ""
                  }`}
                />
              )}

              {hasError && (
                <p className="text-xs text-red-500 mt-0.5">
                  {fieldErrors[key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flexCenter gap-4 w-full">
        <button
          className="standardButton flex-1"
          onClick={onBackClick}
          disabled={loading}
        >
          ← Back
        </button>
        <button
          className="standardButton flex-1"
          style={{ background: token.light.primaryColor }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Save scan"
          )}
        </button>
      </div>
    </div>
  );
};

export default EditFormView;
