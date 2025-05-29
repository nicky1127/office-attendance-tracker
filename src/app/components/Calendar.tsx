"use client";

import { memo, useMemo, useState } from "react";
import {
  format,
  isToday,
  isWeekend,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
  subDays,
  getDate,
} from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { generateCalendarDays, isNonWorkingDay } from "@/utils/dateUtils";
import {
  isBankHoliday,
  getBankHolidaysBetweenDates,
} from "@/utils/bankHolidays";
import {
  Briefcase,
  Palmtree,
  SunMedium,
  Heart,
  Thermometer,
} from "lucide-react";

const Calendar = () => {
  const {
    currentDate,
    attendedDays,
    annualLeaveDays,
    sickLeaveDays,
    toggleDay,
    toggleAnnualLeave,
    toggleSickLeave,
  } = useAttendanceStore();

  // Mode state: 'attend', 'leave', or 'sick'
  const [mode, setMode] = useState<"attend" | "leave" | "sick">("attend");

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

  // Generate dates for blank slots (previous and next month dates)
  const calendarDaysWithDates = useMemo(() => {
    const monthStart = startOfMonth(dateObj);
    const monthEnd = endOfMonth(dateObj);

    // Get the day of the week for the first day of the month
    const startDay = getDay(monthStart);
    const mondayAdjustedStartDay = startDay === 0 ? 6 : startDay - 1;

    // Calculate previous month dates for empty slots
    const prevMonthDates = [];
    for (let i = mondayAdjustedStartDay - 1; i >= 0; i--) {
      prevMonthDates.push(subDays(monthStart, i + 1));
    }

    // Get all days in current month
    const currentMonthDates = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

    // Calculate next month dates to fill the grid (if needed)
    const totalSlotsUsed = prevMonthDates.length + currentMonthDates.length;
    const remainingSlots = 42 - totalSlotsUsed; // 6 rows × 7 days = 42 slots
    const nextMonthDates = [];
    for (let i = 1; i <= remainingSlots && remainingSlots <= 14; i++) {
      nextMonthDates.push(addDays(monthEnd, i));
    }

    return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
  }, [dateObj]);

  // Handle day click based on current mode
  const handleDayClick = (dateStr: string, isNonWorking: boolean) => {
    if (isNonWorking) return; // Don't allow clicking on non-working days

    if (mode === "attend") {
      toggleDay(dateStr);
    } else if (mode === "leave") {
      toggleAnnualLeave(dateStr);
    } else if (mode === "sick") {
      toggleSickLeave(dateStr);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 w-full max-w-md mx-auto">
      {/* Mode toggle buttons */}
      <div className="flex mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setMode("attend")}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "attend"
              ? "bg-gradient-to-r from-teal-600 to-emerald-400 text-white"
              : "bg-white text-gray-700 hover:bg-emerald-50"
          }`}
        >
          <Briefcase
            size={14}
            className={mode === "attend" ? "text-white" : "text-emerald-700"}
          />
          <span className="hidden sm:inline">Mark Attendance</span>
          <span className="sm:hidden">Attend</span>
        </button>
        <button
          onClick={() => setMode("leave")}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "leave"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
              : "bg-white text-gray-700 hover:bg-orange-50"
          }`}
        >
          <div className="relative">
            <Palmtree
              size={14}
              className={mode === "leave" ? "text-white" : "text-amber-700"}
            />
            <SunMedium
              size={8}
              className={`absolute -top-1 -right-1 ${
                mode === "leave" ? "text-yellow-300" : "text-amber-500"
              }`}
            />
          </div>
          <span className="hidden sm:inline">Mark Holiday</span>
          <span className="sm:hidden">Holiday</span>
        </button>
        <button
          onClick={() => setMode("sick")}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "sick"
              ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
              : "bg-white text-gray-700 hover:bg-red-50"
          }`}
        >
          <div className="relative">
            <Heart
              size={14}
              className={mode === "sick" ? "text-white" : "text-red-700"}
            />
            <Thermometer
              size={8}
              className={`absolute -top-1 -right-1 ${
                mode === "sick" ? "text-red-200" : "text-red-500"
              }`}
            />
          </div>
          <span className="hidden sm:inline">Mark Sick</span>
          <span className="sm:hidden">Sick</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
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
        {calendarDaysWithDates.map((day, index) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isAttended = !!attendedDays[dateStr];
          const isLeave = !!annualLeaveDays[dateStr];
          const isSick = !!sickLeaveDays[dateStr];
          const isCurrentMonth = isSameMonth(day, dateObj);
          const bankHolidayCheck = isBankHoliday(day);
          const { isHoliday, holidayName } = bankHolidayCheck;
          const isWeekendDay = isWeekend(day);
          const isNonWorking = isWeekendDay || isHoliday;
          const isTodayDate = isToday(day);
          const dayNumber = getDate(day);

          // Check if this is the first day of a month (for month indicator)
          const isFirstOfMonth = dayNumber === 1;

          // Determine classes based on various conditions
          let dayClasses =
            "relative flex items-center justify-center aspect-square text-sm sm:text-base rounded-full transition-all";

          // Base styling for different day states
          if (!isCurrentMonth) {
            dayClasses += " opacity-40 text-gray-400";
          }

          // Sunday and Saturday for weekend styling
          const dayOfWeek = getDay(day);
          const isSundayOrSaturday = dayOfWeek === 0 || dayOfWeek === 6;

          if (isCurrentMonth) {
            if (isSundayOrSaturday) {
              dayClasses += " text-red-500";
            } else if (isHoliday) {
              dayClasses += " text-purple-500 bg-purple-50 opacity-80";
            } else if (isSick) {
              dayClasses += " bg-red-100 text-red-800";
            } else if (isLeave) {
              dayClasses += " bg-amber-100 text-amber-800";
            } else if (isAttended) {
              dayClasses += " bg-emerald-500 text-white";
            } else {
              dayClasses += " bg-white hover:bg-emerald-100 text-gray-700";
            }
          } else {
            // For non-current month dates, just show as muted
            if (isSundayOrSaturday) {
              dayClasses += " text-red-300";
            }
          }

          // Add outline for today
          if (isTodayDate) {
            dayClasses += " ring-2 ring-blue-500";
          }

          return (
            <div
              key={dateStr}
              className={`${dayClasses} ${
                isNonWorking || !isCurrentMonth
                  ? "cursor-default"
                  : "cursor-pointer"
              }`}
              onClick={() =>
                isCurrentMonth && handleDayClick(dateStr, isNonWorking)
              }
              title={
                isHoliday
                  ? holidayName
                  : isSick
                  ? "Sick Leave"
                  : isLeave
                  ? "Annual Leave"
                  : !isCurrentMonth
                  ? format(day, "MMM d, yyyy")
                  : undefined
              }
            >
              {/* Day number with optional month indicator */}
              <div className="flex flex-col items-center justify-center">
                {isFirstOfMonth && (
                  <span className="text-xs text-gray-500 leading-none mb-0.5">
                    {format(day, "MMM")}
                  </span>
                )}
                <span className="leading-none">{dayNumber}</span>
              </div>

              {/* Status indicators */}
              {isCurrentMonth && isHoliday && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
              {isCurrentMonth && isLeave && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full"></span>
              )}
              {isCurrentMonth && isSick && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 justify-center text-xs text-gray-600">
        {/* First row: Status of days */}
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
          <span>Attended</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-500 mr-1"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-500 mr-1"></div>
          <span>Sick Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-50 border border-purple-500 mr-1"></div>
          <span>Bank Holiday</span>
        </div>

        {/* Second row: Day types and indicators */}
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full bg-white text-red-500 border border-gray-300 mr-1 flex items-center justify-center"
            style={{ fontSize: "6px" }}
          >
            S
          </div>
          <span>Weekend</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 border border-gray-400 mr-1 text-gray-600 flex items-center justify-center text-xs">
            1
          </div>
          <span>Month Start</span>
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
