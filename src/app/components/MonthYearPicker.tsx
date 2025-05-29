"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  getYear,
  getMonth,
  isSameMonth,
  setMonth,
  setYear,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
} from "lucide-react";
import { useAttendanceStore } from "@/utils/attendanceStore";

const MonthYearPicker = () => {
  const { currentDate, setCurrentDate, nextMonth, prevMonth } =
    useAttendanceStore();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Months array for the dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Current year for showing year selection range
  const currentYear = getYear(dateObj);
  const today = new Date();
  const actualCurrentYear = getYear(today);

  // Generate years: previous year, current year, next year
  const years = [
    actualCurrentYear - 1,
    actualCurrentYear,
    actualCurrentYear + 1,
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(dateObj);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setIsPickerOpen(false);
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    const newDate = new Date(dateObj);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setIsPickerOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full text-gray-600"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="flex items-center space-x-2 font-medium text-gray-800 transition-colors"
        >
          <span>{format(dateObj, "MMMM yyyy")}</span>
          <CalendarIcon size={18} />
        </button>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full text-gray-600"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month and Year Picker Dropdown */}
      {isPickerOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {months.map((month, index) => {
              // Check if this is the current calendar month (today's month)
              const today = new Date();
              const isCurrentMonth =
                index === today.getMonth() &&
                currentYear === today.getFullYear();

              const isSelected = index === getMonth(dateObj);

              // Simple styling without attendance-based coloring
              let buttonClass = "text-sm p-2 rounded relative ";

              if (isSelected) {
                buttonClass += "bg-blue-500 text-white ";
              } else {
                buttonClass += "text-gray-700 ";
              }

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-center">
                    <span>{month}</span>
                    {/* Show calendar icon for current month ONLY if it's not selected */}
                    {isCurrentMonth && !isSelected && (
                      <CalendarDays size={14} className="ml-1 text-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Simple divider between month and year sections */}
          <div className="border-t border-gray-200 my-3"></div>

          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`text-sm p-2 rounded ${
                  year === dateObj.getFullYear()
                    ? "bg-blue-500 text-white"
                    : "text-gray-700"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
