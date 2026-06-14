"use client";

import { useState, useEffect } from "react";

interface BirthdayPickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

export const BirthdayPicker = ({
  value,
  onChange,
  className,
}: BirthdayPickerProps) => {
  const initialYear = value ? value.split("-")[0] : "";
  const initialMonth = value ? value.split("-")[1] : "";
  const initialDay = value ? value.split("-")[2] : "";

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);

  // Generate Year range (Current Year down to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // Months list
  const months = [
    { value: "01", name: "January" },
    { value: "02", name: "February" },
    { value: "03", name: "March" },
    { value: "04", name: "April" },
    { value: "05", name: "May" },
    { value: "06", name: "June" },
    { value: "07", name: "July" },
    { value: "08", name: "August" },
    { value: "09", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  // Dynamically calculate days in selected month/year (handles leap years!)
  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31;
    const days = new Date(y ? parseInt(y) : 2000, parseInt(m), 0).getDate();
    return days;
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  // Whenever dropdown choices change, push the combined format back up to the form parent
  useEffect(() => {
    if (year && month && day) {
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange(""); // Keep empty if incomplete
    }
  }, [year, month, day, onChange]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-sm font-semibold opacity-70 px-1">Birthday</span>
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Month Selector */}
        <select
          className={`select select-bordered w-full ${className}`}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        >
          <option value="" disabled>
            Month
          </option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Day Selector */}
        <select
          className={`select select-bordered w-full ${className}`}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
          disabled={!month} // Block day choice until month is picked
        >
          <option value="" disabled>
            Day
          </option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          className={`select select-bordered w-full ${className}`}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="" disabled>
            Year
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
