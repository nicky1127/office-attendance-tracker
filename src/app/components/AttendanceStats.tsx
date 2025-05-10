"use client";

import { format } from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { countWeekdaysInMonth } from "@/utils/dateUtils";

const AttendanceStats = () => {
  const {
    currentDate,
    attendedDays,
    getAttendanceRate,
    getDaysNeededForMinRate,
  } = useAttendanceStore();

  // Calculate stats
  const attendanceRate = getAttendanceRate();
  const formattedRate = (attendanceRate * 100).toFixed(0);
  const daysNeeded = getDaysNeededForMinRate(0.4); // Minimum 40% rate

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Count marked days in current month
  const monthStr = format(dateObj, "yyyy-MM");
  const markedDaysCount = Object.keys(attendedDays).filter((dateStr) =>
    dateStr.startsWith(monthStr)
  ).length;

  // Count total weekdays in month
  const totalWeekdays = countWeekdaysInMonth(dateObj);

  // Calculate progress bar width
  const progressWidth = `${Math.min(100, Number(formattedRate))}%`;

  // Determine progress bar color based on rate
  let progressColor = "bg-red-500";
  if (attendanceRate >= 0.4) {
    progressColor = "bg-green-500";
  } else if (attendanceRate >= 0.3) {
    progressColor = "bg-yellow-500";
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-800 mb-3">
        Office Attendance
      </h2>

      {/* Rate display */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Monthly Rate</span>
          <span className="text-sm font-medium">{formattedRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${progressColor} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>

      {/* Days count */}
      <div className="grid grid-cols-2 gap-3 text-center mb-3">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Marked Days</p>
          <p className="text-xl font-semibold text-blue-700">
            {markedDaysCount}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Weekdays</p>
          <p className="text-xl font-semibold text-purple-700">
            {totalWeekdays}
          </p>
        </div>
      </div>

      {/* Days needed to reach 40% */}
      {attendanceRate < 0.4 && (
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
    </div>
  );
};

export default AttendanceStats;
