"use client";
import dayjs from "dayjs";
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

  return (
    <div className="relative w-full">
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
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={computedMinDate}
        max={computedMaxDate}
        required
        aria-label={placeholder}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};
