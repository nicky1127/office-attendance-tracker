"use client";

import { format } from "date-fns";
import { useState } from "react";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { countWorkdaysInMonth } from "@/utils/dateUtils";
import { Trash2 } from "lucide-react";

const AttendanceStats = () => {
  const {
    currentDate,
    attendedDays,
    annualLeaveDays,
    getAttendanceRate,
    getDaysNeededForMinRate,
    resetCurrentMonth,
  } = useAttendanceStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate stats
  const attendanceRate = getAttendanceRate();
  const formattedRate = (attendanceRate * 100).toFixed(0);
  const daysNeeded = getDaysNeededForMinRate(0.4); // Minimum 40% rate

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Format month and year
  const monthYearStr = format(dateObj, "MMMM yyyy");

  // Count marked days in current month
  const monthStr = format(dateObj, "yyyy-MM");
  const markedDaysCount = Object.keys(attendedDays).filter((dateStr) =>
    dateStr.startsWith(monthStr)
  ).length;

  // Count annual leave days in current month
  const leaveDaysCount = Object.keys(annualLeaveDays).filter((dateStr) =>
    dateStr.startsWith(monthStr)
  ).length;

  // Count total workdays in month (excluding weekends and bank holidays)
  const totalWorkdays = countWorkdaysInMonth(dateObj);

  // Calculate available workdays (excluding annual leave)
  const availableWorkdays = totalWorkdays - leaveDaysCount;

  // Handle reset
  const handleReset = () => {
    if (showResetConfirm) {
      resetCurrentMonth();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-800">Office Attendance</h2>

        {/* Reset button */}
        {!showResetConfirm ? (
          <button
            onClick={handleReset}
            className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`Reset ${monthYearStr}`}
          >
            <Trash2 size={14} className="flex-shrink-0" />
            <div className="ml-1 mt-0.5">Reset {monthYearStr}</div>
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="text-red-500 hover:text-red-700"
            >
              Confirm
            </button>
          </div>
        )}
      </div>

      {/* Rate display */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Monthly Rate</span>
          <span className="text-sm font-medium">{formattedRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${
              attendanceRate >= 0.4
                ? "bg-green-500"
                : attendanceRate >= 0.3
                ? "bg-yellow-500"
                : "bg-red-500"
            } h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, Number(formattedRate))}%` }}
          ></div>
        </div>
      </div>

      {/* Days count */}
      <div className="grid grid-cols-3 gap-3 text-center mb-3">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Attended</p>
          <p className="text-xl font-semibold text-blue-700">
            {markedDaysCount}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Leave</p>
          <p className="text-xl font-semibold text-amber-700">
            {leaveDaysCount}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 relative group">
          <p className="text-xs text-gray-600">Available</p>
          <p className="text-xl font-semibold text-purple-700">
            {availableWorkdays}
          </p>
          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -top-16 left-1/2 transform -translate-x-1/2 z-10">
            Working days excluding weekends, bank holidays, and annual leave.
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Days needed to reach 40% */}
      {attendanceRate < 0.4 && availableWorkdays > 0 && (
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-sm text-amber-800">
            <span className="font-medium">
              {daysNeeded} more day{daysNeeded !== 1 ? "s" : ""}
            </span>{" "}
            needed to reach 40%
          </p>
        </div>
      )}

      {/* Target achieved */}
      {attendanceRate >= 0.4 && (
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800 font-medium">
            ✓ Target attendance rate achieved
          </p>
        </div>
      )}

      {/* All days on leave */}
      {availableWorkdays === 0 && totalWorkdays > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-800 font-medium">
            All working days are marked as leave
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceStats;
