"use client";

import { useState } from "react";
import { format, getYear, isSameMonth, parseISO } from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { ChevronDown, ChevronUp } from "lucide-react";

const AnnualLeaveSummary = () => {
  const { currentDate, annualLeaveDays } = useAttendanceStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Group leave days by month
  const leaveByMonth: Record<string, string[]> = {};

  Object.keys(annualLeaveDays).forEach((dateStr) => {
    const date = parseISO(dateStr);
    const monthYear = format(date, "MMMM yyyy");

    if (!leaveByMonth[monthYear]) {
      leaveByMonth[monthYear] = [];
    }

    leaveByMonth[monthYear].push(dateStr);
  });

  // Sort months with the current month first
  const sortedMonths = Object.keys(leaveByMonth).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);

    // Current month comes first
    if (isSameMonth(dateA, dateObj) && !isSameMonth(dateB, dateObj)) return -1;
    if (!isSameMonth(dateA, dateObj) && isSameMonth(dateB, dateObj)) return 1;

    // Otherwise sort by date (newest first)
    return dateB.getTime() - dateA.getTime();
  });

  // Count total annual leave days
  const totalLeaveDays = Object.values(leaveByMonth).reduce(
    (total, days) => total + days.length,
    0
  );

  if (totalLeaveDays === 0) {
    return null; // Don't show the component if there are no leave days
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-medium text-gray-800">
          Annual Leave Summary
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {totalLeaveDays} day{totalLeaveDays !== 1 ? "s" : ""}
          </span>
          <button className="text-gray-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {sortedMonths.map((month) => (
            <div key={month} className="border-t pt-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {month}
              </h3>
              <div className="flex flex-wrap gap-2">
                {leaveByMonth[month].sort().map((dateStr) => (
                  <div
                    key={dateStr}
                    className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded flex items-center"
                  >
                    {format(parseISO(dateStr), "d MMM")}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnualLeaveSummary;
