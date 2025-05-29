import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  parse,
  isToday,
  isSameMonth,
  isWeekend,
  addDays,
  subDays,
  isFriday,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

// Generate days for calendar view with Monday as the first day of the week
export const generateCalendarDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const allDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  // Convert to Monday-based index (0 = Monday, 6 = Sunday)
  const startDay = getDay(monthStart);
  const mondayAdjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  // Create empty slots for days before the first day of the month
  const prefixDays = Array.from(
    { length: mondayAdjustedStartDay },
    (_, i) => null
  );

  // Combine prefix days and actual days
  return [...prefixDays, ...allDaysInMonth];
};

// Get month name and year as a formatted string
export const getMonthYearString = (date: Date): string => {
  return format(date, "MMMM yyyy");
};

// Parse date string into Date object
export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, "yyyy-MM-dd", new Date());
};

// Format date to string
export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Get weekday name
export const getWeekdayName = (date: Date): string => {
  return format(date, "EEEE");
};

// Check if date is today
export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

// Check if date is in current month
export const isDateInCurrentMonth = (
  date: Date,
  currentDate: Date
): boolean => {
  return isSameMonth(date, currentDate);
};

// Import the bank holiday utility
import { isBankHoliday } from "./bankHolidays";

// Check if a date is a non-working day (weekend or bank holiday)
export const isNonWorkingDay = (date: Date): boolean => {
  // Check if it's a weekend
  const isWeekendDay = isWeekend(date);

  // Check if it's a bank holiday
  const { isHoliday } = isBankHoliday(date);

  // Return true if it's either a weekend or a bank holiday
  return isWeekendDay || isHoliday;
};

// Count weekdays in month (excluding weekends and bank holidays)
export const countWorkdaysInMonth = (date: Date): number => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter out weekends and bank holidays
  return daysInMonth.filter((day) => !isNonWorkingDay(day)).length;
};

// Type for period length
export type PeriodLength = 4 | 12;

// Get the end date for the period (last Friday or today if today is Friday)
export const getPeriodEndDate = (referenceDate: Date = new Date()): Date => {
  const today = new Date();

  // If today is Friday, use today as the end date
  if (isFriday(today)) {
    return today;
  }

  // Otherwise, find the most recent Friday
  let currentDate = new Date(today);
  while (!isFriday(currentDate)) {
    currentDate = subDays(currentDate, 1);
  }

  return currentDate;
};

// Get the start date for the period (exactly N weeks before the end date)
export const getPeriodStartDate = (
  weeks: PeriodLength,
  endDate?: Date
): Date => {
  const end = endDate || getPeriodEndDate();

  // Calculate days back: (weeks * 7) - 1 to get exactly N weeks
  const daysBack = weeks * 7 - 1;
  const startDate = subDays(end, daysBack);

  return startDate;
};

// Get the current period dates
export const getCurrentPeriod = (weeks: PeriodLength) => {
  const endDate = getPeriodEndDate();
  const startDate = getPeriodStartDate(weeks, endDate);

  return {
    startDate,
    endDate,
    totalDays:
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1,
    weeks,
  };
};

// Count workdays in the period (excluding weekends and bank holidays)
export const countWorkdaysInPeriod = (weeks: PeriodLength): number => {
  const { startDate, endDate } = getCurrentPeriod(weeks);
  const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter out weekends and bank holidays
  return daysInPeriod.filter((day) => !isNonWorkingDay(day)).length;
};

// Get all dates in the current period as strings
export const getPeriodDateStrings = (weeks: PeriodLength): string[] => {
  const { startDate, endDate } = getCurrentPeriod(weeks);
  const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });

  return daysInPeriod.map((day) => format(day, "yyyy-MM-dd"));
};

// Check if a date string is within the current period
export const isDateInCurrentPeriod = (
  dateStr: string,
  weeks: PeriodLength
): boolean => {
  const { startDate, endDate } = getCurrentPeriod(weeks);
  const date = parseDate(dateStr);

  return date >= startDate && date <= endDate;
};

// Get formatted period string for display
export const getPeriodDisplayString = (weeks: PeriodLength): string => {
  const { startDate, endDate } = getCurrentPeriod(weeks);

  const startStr = format(startDate, "MMM d");
  const endStr = format(endDate, "MMM d, yyyy");

  return `${startStr} - ${endStr}`;
};

// Legacy functions for backward compatibility (4-week specific)
export const getFourWeekPeriodEndDate = getPeriodEndDate;
export const getFourWeekPeriodStartDate = (endDate?: Date) =>
  getPeriodStartDate(4, endDate);
export const getCurrentFourWeekPeriod = () => getCurrentPeriod(4);
export const countWorkdaysInFourWeekPeriod = () => countWorkdaysInPeriod(4);
export const getFourWeekPeriodDateStrings = () => getPeriodDateStrings(4);
export const isDateInCurrentFourWeekPeriod = (dateStr: string) =>
  isDateInCurrentPeriod(dateStr, 4);
export const getFourWeekPeriodDisplayString = () => getPeriodDisplayString(4);
