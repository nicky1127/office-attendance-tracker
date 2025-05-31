import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  addMonths,
  getDay,
  isWeekend,
  parseISO,
  getDaysInMonth,
} from "date-fns";
import {
  isNonWorkingDay,
  countWorkdaysInPeriod,
  getPeriodDateStrings,
  isDateInCurrentPeriod,
  getCurrentPeriod,
  PeriodLength,
} from "./dateUtils";
import { isBankHoliday } from "./bankHolidays";

type WeekdayOption =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | null;

interface PlannerState {
  // Current month and year (for calendar display)
  currentDate: Date;
  // Custom "today" date for planning scenarios
  plannerToday: Date;
  // Period length (4 or 12 weeks)
  periodLength: PeriodLength;
  // Days marked as attended
  attendedDays: Record<string, boolean>;
  // Days marked as annual leave
  annualLeaveDays: Record<string, boolean>;
  // Days marked as sick leave
  sickLeaveDays: Record<string, boolean>;
  // Selected weekday option
  selectedWeekday: WeekdayOption;

  // Actions
  setCurrentDate: (date: Date) => void;
  setPlannerToday: (date: Date) => void;
  setPeriodLength: (weeks: PeriodLength) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  toggleDay: (dateStr: string) => void;
  toggleAnnualLeave: (dateStr: string) => void;
  toggleSickLeave: (dateStr: string) => void;
  markWeekday: (weekday: WeekdayOption) => void;
  resetCurrentMonth: () => void;
  resetCurrentPeriod: () => void;

  // Calculations (based on current period length and planner today)
  getAttendanceRate: () => number;
  getDaysNeededForMinRate: (minRate?: number) => number;
  getPeriodStats: () => {
    totalWorkdays: number;
    attendedDays: number;
    annualLeaveDays: number;
    sickLeaveDays: number;
    availableWorkdays: number;
    attendanceRate: number;
    periodDates: { startDate: Date; endDate: Date };
    weeks: PeriodLength;
  };

  // Planner-specific period calculations
  getPlannerPeriodDateStrings: () => string[];
  getPlannerCurrentPeriod: () => {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    weeks: PeriodLength;
  };
}

const isWeekdayFunc = (date: Date, weekday: WeekdayOption): boolean => {
  if (weekday === "monday") return isMonday(date);
  if (weekday === "tuesday") return isTuesday(date);
  if (weekday === "wednesday") return isWednesday(date);
  if (weekday === "thursday") return isThursday(date);
  if (weekday === "friday") return isFriday(date);
  return false;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      plannerToday: new Date(), // Default to actual today
      periodLength: 4, // Default to 4 weeks
      attendedDays: {},
      annualLeaveDays: {},
      sickLeaveDays: {},
      selectedWeekday: null,

      setCurrentDate: (date) => set({ currentDate: date }),

      setPlannerToday: (date) => set({ plannerToday: date }),

      setPeriodLength: (weeks) => set({ periodLength: weeks }),

      nextMonth: () => {
        const { currentDate } = get();
        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        set({ currentDate: addMonths(dateObj, 1) });
      },

      prevMonth: () => {
        const { currentDate } = get();
        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        set({ currentDate: addMonths(dateObj, -1) });
      },

      toggleDay: (dateStr) => {
        // Parse the date string to check if it's a non-working day
        const date = parseISO(dateStr);
        if (isNonWorkingDay(date)) {
          // Don't toggle non-working days (weekends or bank holidays)
          return;
        }

        const { attendedDays, annualLeaveDays, sickLeaveDays } = get();

        // If the day is marked as annual leave or sick leave, don't allow marking as attended
        if (annualLeaveDays[dateStr] || sickLeaveDays[dateStr]) {
          return;
        }

        // If day is already attended, remove it, otherwise add it
        if (attendedDays[dateStr]) {
          const newAttendedDays = { ...attendedDays };
          delete newAttendedDays[dateStr];
          set({ attendedDays: newAttendedDays });
        } else {
          set({
            attendedDays: {
              ...attendedDays,
              [dateStr]: true,
            },
          });
        }
      },

      toggleAnnualLeave: (dateStr) => {
        // Parse the date string to check if it's a non-working day
        const date = parseISO(dateStr);
        if (isNonWorkingDay(date)) {
          // Don't toggle non-working days (weekends or bank holidays)
          return;
        }

        const { annualLeaveDays, attendedDays, sickLeaveDays } = get();

        // If day is already marked as annual leave, remove it
        if (annualLeaveDays[dateStr]) {
          const newAnnualLeaveDays = { ...annualLeaveDays };
          delete newAnnualLeaveDays[dateStr];
          set({ annualLeaveDays: newAnnualLeaveDays });
        } else {
          // Add as annual leave and remove from attended days and sick leave if present
          const newAttendedDays = { ...attendedDays };
          const newSickLeaveDays = { ...sickLeaveDays };

          if (newAttendedDays[dateStr]) {
            delete newAttendedDays[dateStr];
          }
          if (newSickLeaveDays[dateStr]) {
            delete newSickLeaveDays[dateStr];
          }

          set({
            annualLeaveDays: {
              ...annualLeaveDays,
              [dateStr]: true,
            },
            attendedDays: newAttendedDays,
            sickLeaveDays: newSickLeaveDays,
          });
        }
      },

      toggleSickLeave: (dateStr) => {
        // Parse the date string to check if it's a non-working day
        const date = parseISO(dateStr);
        if (isNonWorkingDay(date)) {
          // Don't toggle non-working days (weekends or bank holidays)
          return;
        }

        const { sickLeaveDays, attendedDays, annualLeaveDays } = get();

        // If day is already marked as sick leave, remove it
        if (sickLeaveDays[dateStr]) {
          const newSickLeaveDays = { ...sickLeaveDays };
          delete newSickLeaveDays[dateStr];
          set({ sickLeaveDays: newSickLeaveDays });
        } else {
          // Add as sick leave and remove from attended days and annual leave if present
          const newAttendedDays = { ...attendedDays };
          const newAnnualLeaveDays = { ...annualLeaveDays };

          if (newAttendedDays[dateStr]) {
            delete newAttendedDays[dateStr];
          }
          if (newAnnualLeaveDays[dateStr]) {
            delete newAnnualLeaveDays[dateStr];
          }

          set({
            sickLeaveDays: {
              ...sickLeaveDays,
              [dateStr]: true,
            },
            attendedDays: newAttendedDays,
            annualLeaveDays: newAnnualLeaveDays,
          });
        }
      },

      markWeekday: (weekday) => {
        if (!weekday) return;

        const { currentDate, attendedDays, annualLeaveDays, sickLeaveDays } =
          get();
        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        const monthStart = startOfMonth(dateObj);
        const monthEnd = endOfMonth(dateObj);

        // Get all days in the month
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        });

        // Filter days to get only the specified weekday (not weekend or holiday)
        const weekdaysInMonth = daysInMonth.filter((date) => {
          // First check if it's the correct weekday
          const isCorrectWeekday = isWeekdayFunc(date, weekday);

          // Then check if it's NOT a weekend
          const notWeekend = !isWeekend(date);

          // Then check if it's NOT a bank holiday
          const bankHolidayCheck = isBankHoliday(date);
          const notBankHoliday = !bankHolidayCheck.isHoliday;

          // Get the date string to check for annual leave and sick leave
          const dateStr = format(date, "yyyy-MM-dd");

          // Check if it's NOT an annual leave or sick leave day
          const notAnnualLeave = !annualLeaveDays[dateStr];
          const notSickLeave = !sickLeaveDays[dateStr];

          // Only include days that match all criteria
          return (
            isCorrectWeekday &&
            notWeekend &&
            notBankHoliday &&
            notAnnualLeave &&
            notSickLeave
          );
        });

        // Mark all those days as attended
        const newAttendedDays = { ...attendedDays };

        weekdaysInMonth.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          newAttendedDays[dateStr] = true;
        });

        set({
          attendedDays: newAttendedDays,
          selectedWeekday: weekday,
        });
      },

      resetCurrentMonth: () => {
        const { currentDate, attendedDays, annualLeaveDays, sickLeaveDays } =
          get();

        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        const yearMonth = format(dateObj, "yyyy-MM");

        // Filter out all days from the current month
        const newAttendedDays = { ...attendedDays };
        const newAnnualLeaveDays = { ...annualLeaveDays };
        const newSickLeaveDays = { ...sickLeaveDays };

        Object.keys(newAttendedDays).forEach((dateStr) => {
          if (dateStr.startsWith(yearMonth)) {
            delete newAttendedDays[dateStr];
          }
        });

        Object.keys(newAnnualLeaveDays).forEach((dateStr) => {
          if (dateStr.startsWith(yearMonth)) {
            delete newAnnualLeaveDays[dateStr];
          }
        });

        Object.keys(newSickLeaveDays).forEach((dateStr) => {
          if (dateStr.startsWith(yearMonth)) {
            delete newSickLeaveDays[dateStr];
          }
        });

        set({
          attendedDays: newAttendedDays,
          annualLeaveDays: newAnnualLeaveDays,
          sickLeaveDays: newSickLeaveDays,
        });
      },

      resetCurrentPeriod: () => {
        const { attendedDays, annualLeaveDays, sickLeaveDays } = get();
        const periodDateStrings = get().getPlannerPeriodDateStrings();

        // Filter out all days from the current period
        const newAttendedDays = { ...attendedDays };
        const newAnnualLeaveDays = { ...annualLeaveDays };
        const newSickLeaveDays = { ...sickLeaveDays };

        periodDateStrings.forEach((dateStr) => {
          delete newAttendedDays[dateStr];
          delete newAnnualLeaveDays[dateStr];
          delete newSickLeaveDays[dateStr];
        });

        set({
          attendedDays: newAttendedDays,
          annualLeaveDays: newAnnualLeaveDays,
          sickLeaveDays: newSickLeaveDays,
        });
      },

      // Planner-specific period calculations that use plannerToday instead of actual today
      getPlannerCurrentPeriod: () => {
        const { plannerToday, periodLength } = get();
        const endDate = plannerToday;
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (periodLength * 7 - 1));

        return {
          startDate,
          endDate,
          totalDays:
            Math.floor(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1,
          weeks: periodLength,
        };
      },

      getPlannerPeriodDateStrings: () => {
        const { startDate, endDate } = get().getPlannerCurrentPeriod();
        const daysInPeriod = eachDayOfInterval({
          start: startDate,
          end: endDate,
        });
        return daysInPeriod.map((day) => format(day, "yyyy-MM-dd"));
      },

      getPeriodStats: () => {
        const { attendedDays, annualLeaveDays, sickLeaveDays, periodLength } =
          get();
        const periodDateStrings = get().getPlannerPeriodDateStrings();
        const { startDate, endDate } = get().getPlannerCurrentPeriod();

        // Count total workdays in the period using planner dates
        const daysInPeriod = eachDayOfInterval({
          start: startDate,
          end: endDate,
        });
        const totalWorkdays = daysInPeriod.filter(
          (day) => !isNonWorkingDay(day)
        ).length;

        // Count attended days in the period
        const attendedDaysCount = periodDateStrings.filter(
          (dateStr) => attendedDays[dateStr]
        ).length;

        // Count annual leave days in the period
        const annualLeaveDaysCount = periodDateStrings.filter(
          (dateStr) => annualLeaveDays[dateStr]
        ).length;

        // Count sick leave days in the period
        const sickLeaveDaysCount = periodDateStrings.filter(
          (dateStr) => sickLeaveDays[dateStr]
        ).length;

        // Calculate available workdays (excluding both annual leave and sick leave)
        const availableWorkdays =
          totalWorkdays - annualLeaveDaysCount - sickLeaveDaysCount;

        // Calculate attendance rate
        const attendanceRate =
          availableWorkdays > 0 ? attendedDaysCount / availableWorkdays : 0;

        return {
          totalWorkdays,
          attendedDays: attendedDaysCount,
          annualLeaveDays: annualLeaveDaysCount,
          sickLeaveDays: sickLeaveDaysCount,
          availableWorkdays,
          attendanceRate,
          periodDates: { startDate, endDate },
          weeks: periodLength,
        };
      },

      getAttendanceRate: () => {
        const stats = get().getPeriodStats();
        return Math.min(1, stats.attendanceRate);
      },

      getDaysNeededForMinRate: (minRate = 0.4) => {
        const stats = get().getPeriodStats();

        if (stats.availableWorkdays <= 0) return 0;

        // Calculate total days needed to reach minimum rate
        const totalDaysNeeded = Math.ceil(stats.availableWorkdays * minRate);

        // Calculate additional days needed
        const additionalDaysNeeded = Math.max(
          0,
          totalDaysNeeded - stats.attendedDays
        );

        // Make sure we don't exceed the available days
        return Math.min(
          additionalDaysNeeded,
          stats.availableWorkdays - stats.attendedDays
        );
      },
    }),
    {
      name: "office-planner-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,

      onRehydrateStorage: () => (state) => {
        console.log("Planner Store: Starting rehydration...");

        // Convert dates back to Date objects when rehydrating from storage
        if (state && typeof state.currentDate === "string") {
          state.currentDate = new Date(state.currentDate);
        }
        if (state && typeof state.plannerToday === "string") {
          state.plannerToday = new Date(state.plannerToday);
        }

        // Ensure periodLength has a default value
        if (state && !state.periodLength) {
          state.periodLength = 4;
        }

        console.log("Planner Store: Rehydration complete");
      },
    }
  )
);
