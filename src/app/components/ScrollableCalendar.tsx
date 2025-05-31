"use client";

import { memo, useMemo, useState, useEffect, useRef, useCallback } from "react";
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
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { usePlannerStore } from "@/utils/plannerStore";
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
  Target,
} from "lucide-react";

const ScrollableCalendar = () => {
  const {
    plannerToday,
    attendedDays,
    annualLeaveDays,
    sickLeaveDays,
    toggleDay,
    toggleAnnualLeave,
    toggleSickLeave,
    periodLength,
    setPlannerToday,
    getPlannerPeriodDateStrings,
  } = usePlannerStore();

  // Mode state: 'attend', 'leave', or 'sick'
  const [mode, setMode] = useState<"attend" | "leave" | "sick">("attend");

  // Current viewing month - initialize to planner today's month
  const plannerTodayObj =
    plannerToday instanceof Date ? plannerToday : new Date(plannerToday);
  const [viewingMonth, setViewingMonth] = useState(
    startOfMonth(plannerTodayObj)
  );

  // Generated months (5 months: -2, -1, center, +1, +2 for better scrolling)
  const [monthsData, setMonthsData] = useState<any[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

  // Weekday headers starting with Monday
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get period date strings for checking if dates are in current period
  const periodDateStrings = useMemo(() => {
    return getPlannerPeriodDateStrings();
  }, [getPlannerPeriodDateStrings]);

  // Generate calendar data for 5 months
  const generateMonthsData = useCallback((centerMonth: Date) => {
    const months = [
      subMonths(centerMonth, 2),
      subMonths(centerMonth, 1),
      centerMonth,
      addMonths(centerMonth, 1),
      addMonths(centerMonth, 2),
    ];

    return months.map((month, index) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

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

      const allDates = [
        ...prevMonthDates,
        ...currentMonthDates,
        ...nextMonthDates,
      ];

      // Get bank holidays for this month
      const bankHolidays = getBankHolidaysBetweenDates(monthStart, monthEnd);

      return {
        month,
        monthStart,
        monthEnd,
        dates: allDates,
        bankHolidays,
        isCenter: index === 2, // Mark the center month (where planner today should be)
      };
    });
  }, []);

  // Initialize months data
  useEffect(() => {
    const centerMonth = startOfMonth(plannerTodayObj);
    setViewingMonth(centerMonth);
    setMonthsData(generateMonthsData(centerMonth));
  }, [plannerTodayObj, generateMonthsData]);

  // Auto-scroll to planner today on initial load
  useEffect(() => {
    if (
      monthsData.length > 0 &&
      scrollContainerRef.current &&
      !hasInitiallyScrolled
    ) {
      const scrollToTarget = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Find the planner today element
        const plannerTodayStr = format(plannerTodayObj, "yyyy-MM-dd");
        const targetElement = container.querySelector(
          `[data-date="${plannerTodayStr}"]`
        );

        if (targetElement) {
          // Scroll to the target element with some offset to center it nicely
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const offset =
            targetRect.top -
            containerRect.top -
            containerRect.height / 2 +
            targetRect.height / 2;

          container.scrollTo({
            top: container.scrollTop + offset,
            behavior: "smooth",
          });
        } else {
          // Fallback: scroll to the center month
          const centerMonthElement = container.querySelector(
            '[data-month-center="true"]'
          );
          if (centerMonthElement) {
            centerMonthElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }

        setHasInitiallyScrolled(true);
      };

      // Small delay to ensure DOM is ready
      setTimeout(scrollToTarget, 100);
    }
  }, [monthsData, plannerTodayObj, hasInitiallyScrolled]);

  // Handle day click based on current mode
  const handleDayClick = (dateStr: string, isNonWorking: boolean) => {
    // In planner mode, allow clicking on any working day (past, present, or future)
    if (isNonWorking) return;

    if (mode === "attend") {
      toggleDay(dateStr);
    } else if (mode === "leave") {
      toggleAnnualLeave(dateStr);
    } else if (mode === "sick") {
      toggleSickLeave(dateStr);
    }
  };

  // Handle setting a new planner today date
  const handleSetPlannerToday = (dateStr: string, isNonWorking: boolean) => {
    if (isNonWorking) return; // Can't set a weekend or holiday as "today"

    const newPlannerToday = new Date(dateStr);
    setPlannerToday(newPlannerToday);

    // Reset the scroll flag so it will auto-scroll to the new planner today
    setHasInitiallyScrolled(false);
  };

  // Helper function to get status colors for any day
  const getDayStatusClasses = (
    dateStr: string,
    isCurrentMonth: boolean,
    isWeekendDay: boolean,
    isHoliday: boolean,
    isPlannerTodayDate: boolean,
    isInPeriod: boolean
  ) => {
    const isAttended = !!attendedDays[dateStr];
    const isLeave = !!annualLeaveDays[dateStr];
    const isSick = !!sickLeaveDays[dateStr];
    const isNonWorking = isWeekendDay || isHoliday;

    let baseClasses =
      "relative flex items-center justify-center aspect-square text-sm rounded-full transition-all";

    // Apply dimming to ALL dates outside the tracking period
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
      } else {
        // In planner mode, all working days have normal styling with hover effects
        baseClasses += " bg-white hover:bg-emerald-100 text-gray-700";
      }
    }

    // Add styling for planner today - thick inset purple ring
    if (isPlannerTodayDate && isCurrentMonth) {
      baseClasses += " ring-inset ring-4 ring-purple-500";
    } else if (isPlannerTodayDate) {
      // Planner today in different month - subtle inset ring
      baseClasses += " ring-inset ring-2 ring-purple-300";
    }

    // Override opacity for planner today - always keep it at full visibility
    if (isPlannerTodayDate) {
      // Remove any opacity class and ensure planner today is always visible
      baseClasses = baseClasses.replace(" opacity-50", "");
    }

    return baseClasses;
  };

  // Handle scroll to load more months
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;

    setIsScrolling(true);

    // Clear scrolling state after a delay
    clearTimeout((window as any).scrollingTimeout);
    (window as any).scrollingTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Load more months when near the bottom
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      setViewingMonth((prev) => addMonths(prev, 1));
    }

    // Load more months when near the top
    if (scrollTop <= 200) {
      setViewingMonth((prev) => subMonths(prev, 1));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-md mx-auto">
      {/* Planner Today Selector */}
      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Target size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Planner "Today"
            </span>
          </div>
          <button
            onClick={() => setPlannerToday(new Date())}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            Reset to Today
          </button>
        </div>
        <p className="text-xs text-purple-600">
          Current: {format(plannerTodayObj, "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-xs text-purple-500 mt-1">
          Double-click any working day to set as new "today" for planning
        </p>
      </div>

      {/* Mode toggle buttons */}
      <div className="flex mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setMode("attend")}
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

        <div className="w-px bg-gray-200"></div>

        <button
          onClick={() => setMode("leave")}
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

        <div className="w-px bg-gray-200"></div>

        <button
          onClick={() => setMode("sick")}
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

      {/* Static weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={`header-${index}`}
            className={`text-center text-xs sm:text-sm font-medium py-2 sticky top-0 bg-white z-10 ${
              index === 5 || index === 6 ? "text-red-500" : "text-gray-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable calendar dates */}
      <div
        ref={scrollContainerRef}
        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-gray-100"
        onScroll={handleScroll}
      >
        {monthsData.map((monthData, monthIndex) => (
          <div
            key={`month-${monthIndex}-${format(monthData.month, "yyyy-MM")}`}
            className="mb-4"
            data-month-center={monthData.isCenter ? "true" : undefined}
          >
            {/* Month header */}
            <div className="text-center py-2 mb-2 bg-gray-50 rounded-lg sticky top-0 z-20">
              <h3 className="text-sm font-medium text-gray-700">
                {format(monthData.month, "MMMM yyyy")}
                {monthData.isCenter && (
                  <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </h3>
            </div>

            {/* Calendar grid for this month */}
            <div className="grid grid-cols-7 gap-1">
              {monthData.dates.map((day: Date, index: number) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isAttended = !!attendedDays[dateStr];
                const isLeave = !!annualLeaveDays[dateStr];
                const isSick = !!sickLeaveDays[dateStr];
                const isCurrentMonth = isSameMonth(day, monthData.month);
                const bankHolidayCheck = isBankHoliday(day);
                const { isHoliday, holidayName } = bankHolidayCheck;
                const isWeekendDay = isWeekend(day);
                const isNonWorking = isWeekendDay || isHoliday;
                const isPlannerTodayDate = isSameDay(day, plannerTodayObj);
                const dayNumber = getDate(day);

                // Check if this date is within the current period
                const isInPeriod = periodDateStrings.includes(dateStr);

                // Check if this is the first day of a month (for month indicator)
                const isFirstOfMonth = dayNumber === 1;

                // Get dynamic status-based classes
                const dayClasses = getDayStatusClasses(
                  dateStr,
                  isCurrentMonth,
                  isWeekendDay,
                  isHoliday,
                  isPlannerTodayDate,
                  isInPeriod
                );

                // Determine cursor style - working days are always clickable in planner mode
                const isClickable = !isNonWorking;
                const cursorClass = isClickable
                  ? "cursor-pointer"
                  : "cursor-default";

                // Enhanced tooltip for better user understanding
                const getTooltip = () => {
                  if (isHoliday) return holidayName;
                  if (isSick) return "Sick Leave";
                  if (isLeave) return "Annual Leave";
                  if (!isCurrentMonth) return format(day, "MMM d, yyyy");
                  if (isPlannerTodayDate) return "Planner Today";
                  if (isNonWorking) return "Weekend/Holiday";
                  return "Click to mark attendance • Double-click to set as planner today";
                };

                return (
                  <div
                    key={dateStr}
                    data-date={dateStr}
                    className={`${dayClasses} ${cursorClass} min-h-[2.5rem]`}
                    onClick={() => {
                      if (!isNonWorking) {
                        handleDayClick(dateStr, isNonWorking);
                      }
                    }}
                    onDoubleClick={() => {
                      if (!isNonWorking) {
                        handleSetPlannerToday(dateStr, isNonWorking);
                      }
                    }}
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

                    {/* Status indicators */}
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

                    {/* Planner today indicator */}
                    {isPlannerTodayDate && (
                      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isScrolling && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}
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
          <div className="w-3 h-3 rounded-full bg-white border-4 border-purple-500 mr-1"></div>
          <span>Planner Today</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ScrollableCalendar);
