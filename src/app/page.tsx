"use client";

import { useState, useEffect } from "react";
import MonthYearPicker from "./components/MonthYearPicker";
import Calendar from "./components/Calendar";
import AttendanceStats from "./components/AttendanceStats";
import WeekdaySelector from "./components/WeekdaySelector";
import AnnualLeaveSummary from "./components/AnnualLeaveSummary";
import AppIcon from "./components/AppIcon";
import { useAttendanceStore } from "@/utils/attendanceStore";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration issues with persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <div className="flex flex-col items-center">
            <AppIcon size={64} className="mb-3 drop-shadow-md" />
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              Office Attendance Tracker
            </h1>
            <p className="text-gray-600 mt-1">Track my days in the office</p>
          </div>
        </header>

        <div className="space-y-4">
          <MonthYearPicker />
          <AttendanceStats />
          <AnnualLeaveSummary />
          <WeekdaySelector />
          <Calendar />

          <div className="pt-4 text-center text-xs text-gray-500">
            <p>Tap on days to mark office attendance</p>
            <p>Target: Minimum 40% office attendance rate</p>
          </div>
        </div>
      </div>
    </main>
  );
}
