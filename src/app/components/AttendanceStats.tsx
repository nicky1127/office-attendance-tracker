"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { getPeriodDisplayString } from "@/utils/dateUtils";
import { Trash2, Calendar, CalendarDays } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";

// You can adjust these values to control the confetti
const CONFETTI_SETTINGS = {
  intensity: "high" as "low" | "medium" | "high" | "extreme",
  duration: 1500, // milliseconds
  // Alternatively, you can directly set particleCount
  // particleCount: 150
};

const AttendanceStats = () => {
  const {
    currentDate,
    periodLength,
    setPeriodLength,
    attendedDays,
    annualLeaveDays,
    sickLeaveDays,
    getAttendanceRate,
    getDaysNeededForMinRate,
    resetCurrentMonth,
    resetCurrentPeriod,
    getPeriodStats,
  } = useAttendanceStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wasAboveThreshold, setWasAboveThreshold] = useState(false);

  // Get period stats
  const periodStats = getPeriodStats();
  const attendanceRate = periodStats.attendanceRate;
  const formattedRate = (attendanceRate * 100).toFixed(0);
  const daysNeeded = getDaysNeededForMinRate(0.4); // Minimum 40% rate

  // Check if target has been achieved
  const targetAchieved = attendanceRate >= 0.4;

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Trigger confetti when target is newly achieved
  useEffect(() => {
    // Check if we've just crossed the threshold from below to above
    if (targetAchieved && !wasAboveThreshold) {
      setShowConfetti(true);

      // Reset the confetti flag after animation duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, CONFETTI_SETTINGS.duration + 500); // Add a small buffer

      return () => clearTimeout(timer);
    }

    // Update the threshold state for the next change
    setWasAboveThreshold(targetAchieved);
  }, [targetAchieved, wasAboveThreshold]);

  // Format month and year for monthly reset
  const monthYearStr = format(dateObj, "MMMM yyyy");

  // Get period display string
  const periodDisplayStr = getPeriodDisplayString(periodLength);

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
    <>
      <ConfettiCelebration
        trigger={showConfetti}
        intensity={CONFETTI_SETTINGS.intensity}
        duration={CONFETTI_SETTINGS.duration}
        // particleCount={CONFETTI_SETTINGS.particleCount}
      />

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-800">
              Office Attendance
            </h2>
            <p className="text-xs text-gray-500">
              {periodLength}-week period: {periodDisplayStr}
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mr-2">
            <button
              onClick={() => setPeriodLength(4)}
              className={`px-2 py-1 text-xs flex items-center space-x-1 ${
                periodLength === 4
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Calendar size={12} />
              <span className="hidden sm:inline">4w</span>
            </button>
            <button
              onClick={() => setPeriodLength(12)}
              className={`px-2 py-1 text-xs flex items-center space-x-1 ${
                periodLength === 12
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CalendarDays size={12} />
              <span className="hidden sm:inline">12w</span>
            </button>
          </div>

          {/* Reset button */}
          {!showResetConfirm ? (
            <button
              onClick={handleReset}
              className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Reset ${periodLength}-week period`}
            >
              <Trash2 size={14} className="flex-shrink-0" />
              <span className="ml-1 hidden sm:inline">Reset</span>
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
            <span className="text-sm text-gray-600">Attendance Rate</span>
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

        {/* Days count - using current period stats */}
        <div className="grid grid-cols-4 gap-2 text-center mb-3">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Attended</p>
            <p className="text-lg font-semibold text-blue-700">
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
              Working days in {periodLength}-week period excluding weekends,
              bank holidays, annual leave, and sick leave.
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
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-sm text-green-800 font-medium">
              ✓ Target attendance rate achieved
            </p>
          </div>
        )}

        {/* All days unavailable */}
        {periodStats.availableWorkdays === 0 &&
          periodStats.totalWorkdays > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-800 font-medium">
                All working days are marked as leave or sick
              </p>
            </div>
          )}

        {/* Period info */}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center">
          <p>
            Total workdays in {periodLength}-week period:{" "}
            {periodStats.totalWorkdays} | Window ends on{" "}
            {format(periodStats.periodDates.endDate, "EEEE, MMM d")}
          </p>
        </div>
      </div>
    </>
  );
};

export default AttendanceStats;
