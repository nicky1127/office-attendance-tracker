"use client";

import { useState, useEffect } from "react";
import MonthYearPicker from "./components/MonthYearPicker";
import Calendar from "./components/Calendar";
import AttendanceStats from "./components/AttendanceStats";
import WeekdaySelector from "./components/WeekdaySelector";
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
          <h1 className="text-2xl font-bold text-indigo-900">Office Tracker</h1>
          <p className="text-gray-600">Track your days in the office</p>
        </header>

        <div className="space-y-4">
          <MonthYearPicker />
          <AttendanceStats />
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
