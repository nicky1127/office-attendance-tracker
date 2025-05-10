# Office Tracker App

This is a responsive Next.js web application for tracking office attendance with a monthly calendar view. The app allows users to mark days they go to the office and calculates their monthly attendance rate.

## Features

- **Monthly Calendar Display**: Interactive calendar to view and mark attendance days
- **Attendance Rate Calculation**: Shows the percentage of weekdays spent in the office
- **Month/Year Selection**: Easy navigation between different months and years
- **Weekday Selection**: Option to mark specific weekdays (e.g., all Wednesdays)
- **Target Rate Indicator**: Shows how many more days are needed to reach the 40% minimum attendance rate
- **Mobile-Responsive Design**: Optimized UI for mobile devices with minimal scrolling

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS for styling
- date-fns for date manipulation
- Zustand for state management with persistence
- lucide-react for icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
office-tracker/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── Calendar.tsx
│   │       ├── AttendanceStats.tsx
│   │       ├── MonthYearPicker.tsx
│   │       └── WeekdaySelector.tsx
│   └── utils/
│       ├── attendanceStore.ts
│       └── dateUtils.ts
```

## How to Use

- Click on any weekday in the calendar to mark/unmark your attendance
- Use the month/year picker to navigate to different months
- Use the weekday selector to mark all occurrences of a specific weekday
- View your current attendance rate and how many more days you need to reach the 40% target
