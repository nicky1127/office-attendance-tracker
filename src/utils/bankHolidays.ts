import {
  format,
  getYear,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

// Bank holidays data for England
// Source: https://www.gov.uk/bank-holidays
// Note: This is hard-coded for 2024 and 2025. In a production app,
// you'd typically fetch this from an API.
export const englandBankHolidays = {
  // 2024 Bank Holidays
  "2024": [
    { title: "New Year's Day", date: "2024-01-01" },
    { title: "Good Friday", date: "2024-03-29" },
    { title: "Easter Monday", date: "2024-04-01" },
    { title: "Early May Bank Holiday", date: "2024-05-06" },
    { title: "Spring Bank Holiday", date: "2024-05-27" },
    { title: "Summer Bank Holiday", date: "2024-08-26" },
    { title: "Christmas Day", date: "2024-12-25" },
    { title: "Boxing Day", date: "2024-12-26" },
  ],
  // 2025 Bank Holidays
  "2025": [
    { title: "New Year's Day", date: "2025-01-01" },
    { title: "Good Friday", date: "2025-04-18" },
    { title: "Easter Monday", date: "2025-04-21" },
    { title: "Early May Bank Holiday", date: "2025-05-05" },
    { title: "Spring Bank Holiday", date: "2025-05-26" },
    { title: "Summer Bank Holiday", date: "2025-08-25" },
    { title: "Christmas Day", date: "2025-12-25" },
    { title: "Boxing Day", date: "2025-12-26" },
  ],
};

// Check if a date is a bank holiday in England
export const isBankHoliday = (
  date: Date
): { isHoliday: boolean; holidayName?: string } => {
  const normalizedDate = startOfDay(date);
  const dateStr = format(normalizedDate, "yyyy-MM-dd");
  const year = getYear(normalizedDate).toString();

  // If we don't have data for this year, return false
  //@ts-ignore
  if (!englandBankHolidays[year]) {
    return { isHoliday: false };
  }
  //@ts-ignore
  const holiday = englandBankHolidays[year].find(
    //@ts-ignore
    (holiday) => holiday.date === dateStr
  );

  if (holiday) {
    return { isHoliday: true, holidayName: holiday.title };
  }

  return { isHoliday: false };
};

// Get all bank holidays for a specific year
export const getBankHolidaysForYear = (year: number | string) => {
  const yearStr = year.toString();
  //@ts-ignore
  return englandBankHolidays[yearStr] || [];
};

// Get all bank holidays between two dates
export const getBankHolidaysBetweenDates = (startDate: Date, endDate: Date) => {
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);

  const holidays = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearHolidays = getBankHolidaysForYear(year);

    for (const holiday of yearHolidays) {
      const holidayDate = parseISO(holiday.date);

      if (isWithinInterval(holidayDate, { start: startDate, end: endDate })) {
        holidays.push({
          ...holiday,
          date: holidayDate,
        });
      }
    }
  }

  return holidays;
};
