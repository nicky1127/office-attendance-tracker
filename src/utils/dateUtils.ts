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
} from "date-fns";

// Generate days for calendar view
export const generateCalendarDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const allDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);

  // Create empty slots for days before the first day of the month
  const prefixDays = Array.from({ length: startDay }, (_, i) => null);

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

// Count weekdays in month (excluding weekends)
export const countWeekdaysInMonth = (date: Date): number => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter out weekends
  return daysInMonth.filter((day) => !isWeekend(day)).length;
};
