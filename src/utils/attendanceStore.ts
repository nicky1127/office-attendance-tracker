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
import { isNonWorkingDay } from "./dateUtils";
import { isBankHoliday } from "./bankHolidays";

type WeekdayOption =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | null;

interface AttendanceState {
  // Current month and year
  currentDate: Date;
  // Days marked as attended
  attendedDays: Record<string, boolean>;
  // Days marked as annual leave
  annualLeaveDays: Record<string, boolean>;
  // Selected weekday option
  selectedWeekday: WeekdayOption;

  // Actions
  setCurrentDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  toggleDay: (dateStr: string) => void;
  toggleAnnualLeave: (dateStr: string) => void;
  markWeekday: (weekday: WeekdayOption) => void;
  resetCurrentMonth: () => void;

  // Calculations
  getAttendanceRate: () => number;
  getDaysNeededForMinRate: (minRate?: number) => number;
}

const isWeekdayFunc = (date: Date, weekday: WeekdayOption): boolean => {
  if (weekday === "monday") return isMonday(date);
  if (weekday === "tuesday") return isTuesday(date);
  if (weekday === "wednesday") return isWednesday(date);
  if (weekday === "thursday") return isThursday(date);
  if (weekday === "friday") return isFriday(date);
  return false;
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      attendedDays: {},
      annualLeaveDays: {},
      selectedWeekday: null,

      setCurrentDate: (date) => set({ currentDate: date }),

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

        const { attendedDays, annualLeaveDays } = get();

        // If the day is marked as annual leave, don't allow marking as attended
        if (annualLeaveDays[dateStr]) {
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

        const { annualLeaveDays, attendedDays } = get();

        // If day is already marked as annual leave, remove it
        if (annualLeaveDays[dateStr]) {
          const newAnnualLeaveDays = { ...annualLeaveDays };
          delete newAnnualLeaveDays[dateStr];
          set({ annualLeaveDays: newAnnualLeaveDays });
        } else {
          // Add as annual leave and remove from attended days if present
          const newAttendedDays = { ...attendedDays };
          if (newAttendedDays[dateStr]) {
            delete newAttendedDays[dateStr];
          }

          set({
            annualLeaveDays: {
              ...annualLeaveDays,
              [dateStr]: true,
            },
            attendedDays: newAttendedDays,
          });
        }
      },

      markWeekday: (weekday) => {
        if (!weekday) return;

        const { currentDate, attendedDays, annualLeaveDays } = get();
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

          // Get the date string to check for annual leave
          const dateStr = format(date, "yyyy-MM-dd");

          // Check if it's NOT an annual leave day
          const notAnnualLeave = !annualLeaveDays[dateStr];

          // Only include days that match all criteria
          return (
            isCorrectWeekday && notWeekend && notBankHoliday && notAnnualLeave
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
        const { currentDate, attendedDays, annualLeaveDays } = get();

        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        const yearMonth = format(dateObj, "yyyy-MM");

        // Filter out all days from the current month
        const newAttendedDays = { ...attendedDays };
        Object.keys(newAttendedDays).forEach((dateStr) => {
          if (dateStr.startsWith(yearMonth)) {
            delete newAttendedDays[dateStr];
          }
        });

        // Also clear annual leave days for the current month
        const newAnnualLeaveDays = { ...annualLeaveDays };
        Object.keys(newAnnualLeaveDays).forEach((dateStr) => {
          if (dateStr.startsWith(yearMonth)) {
            delete newAnnualLeaveDays[dateStr];
          }
        });

        set({
          attendedDays: newAttendedDays,
          annualLeaveDays: newAnnualLeaveDays,
        });
      },

      getAttendanceRate: () => {
        const { currentDate, attendedDays, annualLeaveDays } = get();
        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        const monthStart = startOfMonth(dateObj);
        const monthEnd = endOfMonth(dateObj);

        // Get all workdays in month (excluding weekends and bank holidays)
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        });
        const workdaysInMonth = daysInMonth.filter(
          (date) => !isNonWorkingDay(date)
        );

        // Get yearMonth string for filtering
        const yearMonth = format(dateObj, "yyyy-MM");

        // Get annual leave days in current month
        const annualLeaveDaysInMonth = Object.keys(annualLeaveDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        ).length;

        // Count attended days in current month
        const attendedDaysInMonth = Object.keys(attendedDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        ).length;

        // Calculate attendance rate (excluding annual leave days from the denominator)
        const availableWorkdays =
          workdaysInMonth.length - annualLeaveDaysInMonth;

        // Prevent division by zero and ensure we don't exceed 100%
        if (availableWorkdays === 0) return 1;
        return Math.min(1, attendedDaysInMonth / availableWorkdays);
      },

      getDaysNeededForMinRate: (minRate = 0.4) => {
        const { currentDate, attendedDays, annualLeaveDays } = get();
        // Ensure currentDate is a Date object
        const dateObj =
          currentDate instanceof Date ? currentDate : new Date(currentDate);
        const monthStart = startOfMonth(dateObj);
        const monthEnd = endOfMonth(dateObj);

        // Get all workdays in month (excluding weekends and bank holidays)
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        });
        const workdaysInMonth = daysInMonth.filter(
          (date) => !isNonWorkingDay(date)
        );

        // Get yearMonth string for filtering
        const yearMonth = format(dateObj, "yyyy-MM");

        // Filter annual leave days to only include those in the current month
        const annualLeaveDaysInMonthArr = Object.keys(annualLeaveDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        );

        const annualLeaveDaysInMonth = annualLeaveDaysInMonthArr.length;

        // Count attended days in current month
        const attendedDaysInMonth = Object.keys(attendedDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        ).length;

        // Calculate available workdays (excluding annual leave)
        const availableWorkdays =
          workdaysInMonth.length - annualLeaveDaysInMonth;

        if (availableWorkdays <= 0) return 0; // No available days to work with

        // Calculate total days needed to reach minimum rate
        const totalDaysNeeded = Math.ceil(availableWorkdays * minRate);

        // Calculate additional days needed
        const additionalDaysNeeded = Math.max(
          0,
          totalDaysNeeded - attendedDaysInMonth
        );

        // Make sure we don't exceed the available days
        return Math.min(
          additionalDaysNeeded,
          availableWorkdays - attendedDaysInMonth
        );
      },
    }),
    {
      name: "office-attendance-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Convert currentDate back to a Date object when rehydrating from storage
        if (state && typeof state.currentDate === "string") {
          state.currentDate = new Date(state.currentDate);
        }
      },
    }
  )
);
