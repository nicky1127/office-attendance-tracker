"use client";

import { memo, useMemo } from "react";
import {
  format,
  isToday,
  isWeekend,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { generateCalendarDays, isNonWorkingDay } from "@/utils/dateUtils";
import {
  isBankHoliday,
  getBankHolidaysBetweenDates,
} from "@/utils/bankHolidays";

const Calendar = () => {
  const { currentDate, attendedDays, toggleDay } = useAttendanceStore();

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  const calendarDays = generateCalendarDays(dateObj);

  // Weekday headers starting with Monday
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get bank holidays for the current month
  const bankHolidays = useMemo(() => {
    const monthStart = startOfMonth(dateObj);
    const monthEnd = endOfMonth(dateObj);
    return getBankHolidaysBetweenDates(monthStart, monthEnd);
  }, [dateObj]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 w-full max-w-md mx-auto">
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {/* Weekday headers */}
        {weekDays.map((day, index) => (
          <div
            key={`header-${index}`}
            className={`text-center text-xs sm:text-sm font-medium py-2 ${
              index === 5 || index === 6 ? "text-red-500" : "text-gray-600"
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
          const bankHolidayCheck = isBankHoliday(day);
          const { isHoliday, holidayName } = bankHolidayCheck;
          const isWeekendDay = isWeekend(day);
          const isNonWorking = isWeekendDay || isHoliday;

          // Determine classes based on various conditions
          let dayClasses =
            "relative flex items-center justify-center aspect-square text-sm sm:text-base rounded-full transition-all";

          // Base styling for different day states
          if (!isCurrentMonth) {
            dayClasses += " opacity-30";
          }

          // Sunday and Saturday for weekend styling
          const dayOfWeek = getDay(day);
          const isSundayOrSaturday = dayOfWeek === 0 || dayOfWeek === 6;

          if (isSundayOrSaturday) {
            dayClasses += " text-red-500";
          } else if (isHoliday) {
            dayClasses += " text-purple-500 bg-purple-50 opacity-80";
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
              className={`${dayClasses} ${
                isNonWorking ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !isNonWorking && toggleDay(dateStr)}
              title={isHoliday ? holidayName : undefined}
            >
              {format(day, "d")}
              {isHoliday && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 justify-center text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
          <span>Attended</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-50 border border-purple-500 mr-1"></div>
          <span>Bank Holiday</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full bg-white text-red-500 border border-gray-300 mr-1 flex items-center justify-center"
            style={{ fontSize: "6px" }}
          >
            S
          </div>
          <span>Weekend</span>
        </div>
      </div>

      {/* Bank Holidays for current month */}
      {bankHolidays.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Bank Holidays this month:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            {bankHolidays.map((holiday) => (
              <li key={holiday.date} className="flex items-center">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mr-2 text-xs">
                  {format(holiday.date, "d")}
                </span>
                <span>{holiday.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(Calendar);
