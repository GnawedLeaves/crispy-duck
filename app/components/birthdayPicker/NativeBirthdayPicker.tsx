"use client";
import dayjs from "dayjs";
import { useRef } from "react";

interface NativeBirthdayPickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export const NativeBirthdayPicker = ({
  value,
  onChange,
  className,
  placeholder = "Select your birthday",
  minDate,
  maxDate,
}: NativeBirthdayPickerProps) => {
  // 1. Create a ref to access the actual DOM node of the input
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    return dayjs(dateString).format("DD MMM YYYY");
  };

  const today = new Date();
  const computedMaxDate = maxDate ?? today.toISOString().split("T")[0];
  const computedMinDate =
    minDate ??
    new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];

  // 2. Function to programmatically open the native date picker
  const handleOpenPicker = () => {
    if (inputRef.current && "showPicker" in inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (error) {
        // Fallback for older browsers: focus the input instead
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative w-full cursor-pointer" onClick={handleOpenPicker}>
      <div
        className={`signUpFormField w-full flex items-center truncate ${className || ""}`}
      >
        {value ? (
          <span>{formatDisplayDate(value)}</span>
        ) : (
          <span className="opacity-50">{placeholder}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={computedMinDate}
        max={computedMaxDate}
        required
        aria-label={placeholder}
        // 4. Also add it to the input directly as a fallback
        onClick={handleOpenPicker}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};
