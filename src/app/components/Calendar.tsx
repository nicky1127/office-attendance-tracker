"use client";

import { memo } from "react";
import { format, isToday, isWeekend, isSameMonth } from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { generateCalendarDays } from "@/utils/dateUtils";

const Calendar = () => {
  const { currentDate, attendedDays, toggleDay } = useAttendanceStore();

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  const calendarDays = generateCalendarDays(dateObj);

  // Weekday headers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 w-full max-w-md mx-auto">
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekDays.map((day, index) => (
          <div
            key={`header-${index}`}
            className={`text-center text-xs sm:text-sm font-medium py-2 ${
              index === 0 || index === 6 ? "text-red-500" : "text-gray-600"
            }`}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          // Handle empty slots (null days)
          if (day === null) {
            return <div key={`empty-${index}`} className="p-1"></div>;
          }

          const dateStr = format(day, "yyyy-MM-dd");
          const isAttended = !!attendedDays[dateStr];
          const isCurrentMonth = isSameMonth(day, dateObj);

          // Determine classes based on various conditions
          let dayClasses =
            "flex items-center justify-center cursor-pointer aspect-square text-sm sm:text-base rounded-full transition-all";

          // Base styling for different day states
          if (!isCurrentMonth) {
            dayClasses += " opacity-30";
          }

          if (isWeekend(day)) {
            dayClasses += " text-red-500";
          } else if (isAttended) {
            dayClasses += " bg-emerald-500 text-white";
          } else {
            dayClasses += " bg-white hover:bg-emerald-100 text-gray-700";
          }

          // Add outline for today
          if (isToday(day)) {
            dayClasses += " ring-2 ring-blue-500";
          }

          return (
            <div
              key={dateStr}
              className={dayClasses}
              onClick={() => !isWeekend(day) && toggleDay(dateStr)}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(Calendar);
