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
