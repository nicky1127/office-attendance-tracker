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
  // Selected weekday option
  selectedWeekday: WeekdayOption;

  // Actions
  setCurrentDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  toggleDay: (dateStr: string) => void;
  markWeekday: (weekday: WeekdayOption) => void;
  resetWeekdaySelection: () => void;

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

        const { attendedDays } = get();

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

      markWeekday: (weekday) => {
        if (!weekday) return;

        const { currentDate, attendedDays } = get();
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

        // Filter days to get only the specified weekday and not weekend
        const weekdaysInMonth = daysInMonth.filter(
          (date) => isWeekdayFunc(date, weekday) && !isWeekend(date)
        );

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

      resetWeekdaySelection: () => {
        set({ selectedWeekday: null });
      },

      getAttendanceRate: () => {
        const { currentDate, attendedDays } = get();
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

        // Count attended days in current month
        const yearMonth = format(dateObj, "yyyy-MM");
        const attendedDaysInMonth = Object.keys(attendedDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        ).length;

        // Calculate attendance rate
        return workdaysInMonth.length === 0
          ? 0
          : attendedDaysInMonth / workdaysInMonth.length;
      },

      getDaysNeededForMinRate: (minRate = 0.4) => {
        const { currentDate, attendedDays } = get();
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

        // Count attended days in current month
        const yearMonth = format(dateObj, "yyyy-MM");
        const attendedDaysInMonth = Object.keys(attendedDays).filter(
          (dateStr) => dateStr.startsWith(yearMonth)
        ).length;

        // Calculate total days needed to reach minimum rate
        const totalDaysNeeded = Math.ceil(workdaysInMonth.length * minRate);

        // Calculate additional days needed
        const additionalDaysNeeded = Math.max(
          0,
          totalDaysNeeded - attendedDaysInMonth
        );

        return additionalDaysNeeded;
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
