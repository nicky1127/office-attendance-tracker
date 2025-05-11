"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getYear,
  getMonth,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  parseISO,
  setMonth,
  setYear,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { countWorkdaysInMonth } from "@/utils/dateUtils";

const MonthYearPicker = () => {
  const {
    currentDate,
    setCurrentDate,
    nextMonth,
    prevMonth,
    attendedDays,
    annualLeaveDays,
  } = useAttendanceStore();

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

  // Start from 2025 for year selection
  const startYear = 2025;

  // Generate years for selection (from 2025 to current year + 5)
  const endYear = Math.max(currentYear + 5, startYear + 10);
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  // Calculate monthly attendance rates for styling
  const monthlyAttendanceRates = useMemo(() => {
    const rates: Record<string, { rate: number; target: boolean }> = {};

    // Check rates for the current year and previous year
    const yearsToCheck = [currentYear, currentYear - 1];

    yearsToCheck.forEach((year) => {
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);
        const monthKey = format(monthDate, "yyyy-MM");

        // Get all workdays in this month
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        // Count worked days in this month
        const workedDaysCount = Object.keys(attendedDays).filter((dateStr) =>
          dateStr.startsWith(monthKey)
        ).length;

        // Count leave days in this month
        const leaveDaysCount = Object.keys(annualLeaveDays).filter((dateStr) =>
          dateStr.startsWith(monthKey)
        ).length;

        // Get total workdays excluding weekends and holidays
        const totalWorkdays = countWorkdaysInMonth(monthDate);

        // Calculate available workdays (excluding leave)
        const availableWorkdays = totalWorkdays - leaveDaysCount;

        // Calculate attendance rate
        let rate = 0;
        if (availableWorkdays > 0) {
          rate = workedDaysCount / availableWorkdays;
        }

        rates[monthKey] = {
          rate: rate,
          target: rate >= 0.4, // 40% target
        };
      }
    });

    return rates;
  }, [attendedDays, annualLeaveDays, currentYear]);

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
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="flex items-center space-x-2 font-medium text-gray-800 hover:text-blue-600 transition-colors"
        >
          <span>{format(dateObj, "MMMM yyyy")}</span>
          <CalendarIcon size={18} />
        </button>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
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
              const date = new Date(currentYear, index, 1);
              const monthKey = format(date, "yyyy-MM");
              const attendance = monthlyAttendanceRates[monthKey];

              // Check if this is the current calendar month (today's month)
              const today = new Date();
              const isCurrentMonth =
                index === today.getMonth() &&
                currentYear === today.getFullYear();

              const isPast =
                date < new Date() && !isSameMonth(date, new Date());
              const isSelected = index === getMonth(dateObj);

              // Determine styling based on attendance and selection status
              let buttonClass = "text-sm p-2 rounded relative ";

              if (isSelected) {
                buttonClass += "bg-blue-500 text-white ";
              } else if (isPast && attendance) {
                buttonClass += attendance.target
                  ? "hover:bg-green-100 border border-green-300 "
                  : "hover:bg-red-100 border border-red-300 ";
              } else {
                buttonClass += "hover:bg-gray-100 ";
              }

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-center">
                    <span>{month}</span>
                    {/* Show calendar icon for current month */}
                    {isCurrentMonth && (
                      <CalendarDays size={14} className="ml-1 text-blue-500" />
                    )}
                  </div>

                  {/* Show checkmark/X for past months with attendance data */}
                  {isPast && attendance && !isSelected && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1">
                      {attendance.target ? (
                        <CheckCircle
                          size={14}
                          className="text-green-500 fill-white"
                        />
                      ) : (
                        <XCircle
                          size={14}
                          className="text-red-500 fill-white"
                        />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Simple divider between month and year sections */}
          <div className="border-t border-gray-200 my-3"></div>

          <div className="grid grid-cols-4 gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`text-sm p-2 rounded ${
                  year === dateObj.getFullYear()
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
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
