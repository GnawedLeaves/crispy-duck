"use client";

import { token } from "@/app/theme";
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
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    if (value && value.includes("-")) {
      const parts = value.split("-");
      setYear(parts[0] || "");
      setMonth(parts[1] || "");
      setDay(parts[2] || "");
    } else if (!value) {
      setYear("");
      setMonth("");
      setDay("");
    }
  }, [value]);

  const handleSelectChange = (
    newYear: string,
    newMonth: string,
    newDay: string,
  ) => {
    if (newYear && newMonth && newDay) {
      onChange(`${newYear}-${newMonth}-${newDay}`);
    } else {
      onChange("");
    }
  };

  // Generate Year range
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

  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31;
    const days = new Date(y ? parseInt(y) : 2000, parseInt(m), 0).getDate();
    return days;
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  return (
    <div className="flex flex-col gap-1 w-full  ">
      {/* <span className="text-sm font-semibold opacity-70 px-1">Birthday</span> */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Month Selector */}
        <select
          className={`select select-bordered w-full ${className}`}
          style={{ background: token.light.background }}
          value={month}
          onChange={(e) => {
            const nextMonth = e.target.value;
            setMonth(nextMonth);
            handleSelectChange(year, nextMonth, day);
          }}
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
          style={{ background: token.light.background }}
          value={day}
          onChange={(e) => {
            const nextDay = e.target.value;
            setDay(nextDay);
            handleSelectChange(year, month, nextDay);
          }}
          required
          disabled={!month}
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
          style={{ background: token.light.background }}
          value={year}
          onChange={(e) => {
            const nextYear = e.target.value;
            setYear(nextYear);
            handleSelectChange(nextYear, month, day);
          }}
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
