"use client";

import { useState } from "react";
import { format } from "date-fns";
import { usePlannerStore } from "@/utils/plannerStore";
import { Trash2, Calendar as CalendarIcon, CalendarDays } from "lucide-react";

const PlannerAttendanceStats = () => {
  const {
    plannerToday,
    periodLength,
    setPeriodLength,
    getPeriodStats,
    getDaysNeededForMinRate,
    resetCurrentPeriod,
  } = usePlannerStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Get period stats
  const periodStats = getPeriodStats();
  const attendanceRate = periodStats.attendanceRate;
  const formattedRate = (attendanceRate * 100).toFixed(0);
  const daysNeeded = getDaysNeededForMinRate(0.4);

  // Check if target has been achieved
  const targetAchieved = attendanceRate >= 0.4;

  // Ensure plannerToday is a Date object
  const plannerTodayObj =
    plannerToday instanceof Date ? plannerToday : new Date(plannerToday);

  // Handle reset
  const handleReset = () => {
    if (showResetConfirm) {
      resetCurrentPeriod();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-purple-800">
            Planner Attendance
          </h2>
          <p className="text-xs text-purple-500">
            {periodLength}-week period from:{" "}
            {format(plannerTodayObj, "MMM d, yyyy")}
          </p>
        </div>

        {/* Reset button */}
        {!showResetConfirm ? (
          <button
            onClick={handleReset}
            className="flex items-center text-xs text-purple-400 hover:text-purple-600 transition-colors"
            aria-label={`Reset ${periodLength}-week period`}
          >
            <Trash2 size={16} className="flex-shrink-0" />
            <span className="ml-1">Reset</span>
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

      {/* Period Toggle - Full Width Row */}
      <div className="mb-4">
        <div className="flex border border-purple-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setPeriodLength(4)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              periodLength === 4
                ? "bg-purple-500 text-white"
                : "bg-white text-purple-600 hover:bg-purple-50"
            }`}
          >
            <CalendarIcon size={16} />
            <span>4 Weeks</span>
          </button>
          <button
            onClick={() => setPeriodLength(12)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              periodLength === 12
                ? "bg-purple-500 text-white"
                : "bg-white text-purple-600 hover:bg-purple-50"
            }`}
          >
            <CalendarDays size={16} />
            <span>12 Weeks</span>
          </button>
        </div>
      </div>

      {/* Rate display */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Attendance Rate</span>
          <span className="text-sm font-medium">{formattedRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${
              attendanceRate >= 0.4
                ? "bg-purple-500"
                : attendanceRate >= 0.3
                ? "bg-yellow-500"
                : "bg-red-500"
            } h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, Number(formattedRate))}%` }}
          ></div>
        </div>
      </div>

      {/* Days count */}
      <div className="grid grid-cols-4 gap-2 text-center mb-3">
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Attended</p>
          <p className="text-lg font-semibold text-purple-700">
            {periodStats.attendedDays}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Holiday</p>
          <p className="text-lg font-semibold text-amber-700">
            {periodStats.annualLeaveDays}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Sick</p>
          <p className="text-lg font-semibold text-red-700">
            {periodStats.sickLeaveDays}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 relative group">
          <p className="text-xs text-gray-600">Available</p>
          <p className="text-lg font-semibold text-purple-700">
            {periodStats.availableWorkdays}
          </p>
          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -top-16 left-1/2 transform -translate-x-1/2 z-10">
            Working days in {periodLength}-week period excluding weekends, bank
            holidays, annual leave, and sick leave.
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Days needed to reach 40% */}
      {attendanceRate < 0.4 && periodStats.availableWorkdays > 0 && (
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
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-sm text-purple-800 font-medium">
            ✓ Target attendance rate achieved
          </p>
        </div>
      )}

      {/* All days unavailable */}
      {periodStats.availableWorkdays === 0 && periodStats.totalWorkdays > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-800 font-medium">
            All working days are marked as leave or sick
          </p>
        </div>
      )}
    </div>
  );
};

export default PlannerAttendanceStats;
