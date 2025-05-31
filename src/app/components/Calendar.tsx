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
  isBefore,
  startOfDay,
} from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import {
  generateCalendarDays,
  isNonWorkingDay,
  getPeriodDateStrings,
} from "@/utils/dateUtils";
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
  Lock,
  Unlock,
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
    periodLength,
  } = useAttendanceStore();

  // Mode state: 'attend', 'leave', or 'sick'
  const [mode, setMode] = useState<"attend" | "leave" | "sick">("attend");

  // Amendment lock state - starts locked to prevent accidental changes
  const [isAmendmentLocked, setIsAmendmentLocked] = useState(true);

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  const calendarDays = generateCalendarDays(dateObj);

  // Weekday headers starting with Monday
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get period date strings for checking if dates are in current period
  const periodDateStrings = useMemo(() => {
    return getPeriodDateStrings(periodLength);
  }, [periodLength]);

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

  // Handle day click based on current mode - only for past dates and today (if it's a working day)
  const handleDayClick = (
    dateStr: string,
    isNonWorking: boolean,
    isPastOrTodayWorkingDay: boolean,
    isCurrentMonth: boolean
  ) => {
    // Check if amendments are locked
    if (isAmendmentLocked) {
      return; // Don't allow any changes when locked
    }

    // Only allow clicking on past dates and today (if today is a working day)
    // Future dates are not amendable
    if (!isPastOrTodayWorkingDay || isNonWorking) return;

    if (mode === "attend") {
      toggleDay(dateStr);
    } else if (mode === "leave") {
      toggleAnnualLeave(dateStr);
    } else if (mode === "sick") {
      toggleSickLeave(dateStr);
    }
  };

  // Helper function to determine if a date is from previous month
  const isPreviousMonth = (day: Date) => {
    const currentMonth = getDate(startOfMonth(dateObj));
    const dayMonth = getDate(startOfMonth(day));
    return (
      dayMonth < currentMonth || (dayMonth > currentMonth && getDate(day) > 15)
    ); // Handle year boundary
  };

  // Helper function to get status colors for any day (current month or not)
  const getDayStatusClasses = (
    dateStr: string,
    isCurrentMonth: boolean,
    isWeekendDay: boolean,
    isHoliday: boolean,
    isTodayDate: boolean,
    isPastDate: boolean,
    isPastOrTodayWorkingDay: boolean,
    isPrevMonth: boolean,
    isInPeriod: boolean
  ) => {
    const isAttended = !!attendedDays[dateStr];
    const isLeave = !!annualLeaveDays[dateStr];
    const isSick = !!sickLeaveDays[dateStr];
    const isNonWorking = isWeekendDay || isHoliday;
    const isFutureDate = !isPastDate && !isTodayDate;

    let baseClasses =
      "relative flex items-center justify-center aspect-square text-sm sm:text-base rounded-full transition-all";

    // Apply dimming to ALL dates outside the tracking period (both past and future)
    if (!isInPeriod) {
      baseClasses += " opacity-50";
    }

    if (!isCurrentMonth) {
      // For non-current month days
      if (isWeekendDay) {
        baseClasses += " text-red-500";
      } else if (isHoliday) {
        baseClasses += " text-purple-500 bg-purple-50";
      } else if (isSick) {
        baseClasses += " bg-red-100 text-red-800";
      } else if (isLeave) {
        baseClasses += " bg-amber-100 text-amber-800";
      } else if (isAttended) {
        baseClasses += " bg-emerald-500 text-white";
      } else {
        baseClasses += " text-gray-700";
      }
    } else {
      // Current month styling
      if (isWeekendDay) {
        baseClasses += " text-red-500";
      } else if (isHoliday) {
        baseClasses += " text-purple-500 bg-purple-50 opacity-80";
      } else if (isSick) {
        baseClasses += " bg-red-100 text-red-800";
      } else if (isLeave) {
        baseClasses += " bg-amber-100 text-amber-800";
      } else if (isAttended) {
        baseClasses += " bg-emerald-500 text-white";
      } else if (isFutureDate) {
        // Future dates - muted and non-interactive
        baseClasses += " bg-gray-50 text-gray-400";
      } else if (isPastOrTodayWorkingDay) {
        // Past dates and today (if working day) - normal styling with hover effects
        baseClasses += " bg-white hover:bg-emerald-100 text-gray-700";
      } else {
        // Today if it's a non-working day - special styling
        baseClasses += " bg-white text-gray-700";
      }
    }

    // Add styling for today - thick inset blue ring (but don't override opacity from period logic)
    if (isTodayDate && isCurrentMonth) {
      baseClasses += " ring-inset ring-4 ring-blue-500";
    } else if (isTodayDate) {
      // Today in different month - subtle inset ring
      baseClasses += " ring-inset ring-2 ring-blue-300";
    }

    // Override opacity for today - always keep it at full visibility
    if (isTodayDate) {
      // Remove any opacity class and ensure today is always visible
      baseClasses = baseClasses.replace(" opacity-50", "");
    }

    return baseClasses;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 w-full max-w-md mx-auto">
      {/* Amendment Lock Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          {isAmendmentLocked ? (
            <Lock size={16} className="text-red-600" />
          ) : (
            <Unlock size={16} className="text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {isAmendmentLocked ? "Amendments Locked" : "Amendments Unlocked"}
          </span>
        </div>
        <button
          onClick={() => setIsAmendmentLocked(!isAmendmentLocked)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            isAmendmentLocked
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isAmendmentLocked ? "Unlock" : "Lock"}
        </button>
      </div>

      {/* Mode toggle buttons */}
      <div
        className={`flex mb-4 border border-gray-200 rounded-lg overflow-hidden ${
          isAmendmentLocked ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <button
          onClick={() => setMode("attend")}
          disabled={isAmendmentLocked}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "attend"
              ? "bg-gradient-to-r from-teal-600 to-emerald-400 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          <Briefcase
            size={14}
            className={mode === "attend" ? "text-white" : "text-emerald-700"}
          />
          <span className="hidden sm:inline">Mark Attendance</span>
          <span className="sm:hidden">Attend</span>
        </button>

        {/* Separator */}
        <div className="w-px bg-gray-200"></div>

        <button
          onClick={() => setMode("leave")}
          disabled={isAmendmentLocked}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "leave"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
              : "bg-white text-gray-700"
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

        {/* Separator */}
        <div className="w-px bg-gray-200"></div>

        <button
          onClick={() => setMode("sick")}
          disabled={isAmendmentLocked}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
            mode === "sick"
              ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
              : "bg-white text-gray-700"
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

          // Check if this date is in the past (before today)
          const today = startOfDay(new Date());
          const dayDate = startOfDay(day);
          const isPastDate = isBefore(dayDate, today);
          const isFutureDate = !isPastDate && !isTodayDate;

          // Check if this date is from previous month
          const isPrevMonth =
            !isCurrentMonth && isBefore(day, startOfMonth(dateObj));

          // Check if this date is within the current period (4-week or 12-week)
          const isInPeriod = periodDateStrings.includes(dateStr);

          // Check if this date is amendable (past dates + today if it's a working day)
          const isPastOrTodayWorkingDay =
            isPastDate || (isTodayDate && !isNonWorking);

          // Check if this is the first day of a month (for month indicator)
          const isFirstOfMonth = dayNumber === 1;

          // Get dynamic status-based classes
          const dayClasses = getDayStatusClasses(
            dateStr,
            isCurrentMonth,
            isWeekendDay,
            isHoliday,
            isTodayDate,
            isPastDate,
            isPastOrTodayWorkingDay,
            isPrevMonth,
            isInPeriod
          );

          // Determine cursor style - past dates and today (if working day) are clickable, but only if unlocked
          const isClickable =
            isPastOrTodayWorkingDay && !isNonWorking && !isAmendmentLocked;
          const cursorClass = isClickable ? "cursor-pointer" : "cursor-default";

          // Enhanced tooltip for better user understanding
          const getTooltip = () => {
            if (isAmendmentLocked && isPastOrTodayWorkingDay && !isNonWorking) {
              return "Amendments are locked - unlock to make changes";
            }
            if (isHoliday) return holidayName;
            if (isSick) return "Sick Leave";
            if (isLeave) return "Annual Leave";
            if (!isCurrentMonth) return format(day, "MMM d, yyyy");
            if (isTodayDate && isNonWorking)
              return "Today (weekend/holiday - not amendable)";
            if (isTodayDate) return "Today (amendable)";
            if (isFutureDate) return "Future date (not amendable)";
            return undefined;
          };

          return (
            <div
              key={dateStr}
              className={`${dayClasses} ${cursorClass}`}
              onClick={() =>
                handleDayClick(
                  dateStr,
                  isNonWorking,
                  isPastOrTodayWorkingDay,
                  isCurrentMonth
                )
              }
              title={getTooltip()}
            >
              {/* Day number with optional month indicator */}
              <div className="flex flex-col items-center justify-center">
                {isFirstOfMonth && (
                  <span
                    className={`text-xs leading-none mb-0.5 ${
                      !isInPeriod
                        ? "text-gray-600 opacity-100"
                        : "text-gray-500"
                    }`}
                  >
                    {format(day, "MMM")}
                  </span>
                )}
                <span className="leading-none">{dayNumber}</span>
              </div>

              {/* Status indicators - show for both current and other months */}
              {isHoliday && (
                <span
                  className={`absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full ${
                    !isInPeriod ? "opacity-50" : ""
                  }`}
                ></span>
              )}
              {isLeave && (
                <span
                  className={`absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full ${
                    !isInPeriod ? "opacity-50" : ""
                  }`}
                ></span>
              )}
              {isSick && (
                <span
                  className={`absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full ${
                    !isInPeriod ? "opacity-50" : ""
                  }`}
                ></span>
              )}

              {/* Future date indicator */}
              {isFutureDate && isCurrentMonth && !isNonWorking && (
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-60"></span>
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
          <div className="w-3 h-3 rounded-full bg-white border-4 border-blue-500 mr-1"></div>
          <span>Today</span>
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
