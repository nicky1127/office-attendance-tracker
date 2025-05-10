"use client";

import { useState } from "react";
import { useAttendanceStore } from "@/utils/attendanceStore";

const WeekdaySelector = () => {
  const { markWeekday, selectedWeekday, resetWeekdaySelection } =
    useAttendanceStore();
  const [isOpen, setIsOpen] = useState(false);

  const weekdays = [
    { id: "monday", label: "Mondays" },
    { id: "tuesday", label: "Tuesdays" },
    { id: "wednesday", label: "Wednesdays" },
    { id: "thursday", label: "Thursdays" },
    { id: "friday", label: "Fridays" },
  ];

  const handleWeekdaySelect = (weekday: string | null) => {
    if (weekday === null) {
      resetWeekdaySelection();
    } else {
      markWeekday(weekday as any);
    }
    setIsOpen(false);
  };

  const getSelectedWeekdayLabel = () => {
    if (!selectedWeekday) return "Mark specific weekday";
    return `All ${
      selectedWeekday.charAt(0).toUpperCase() + selectedWeekday.slice(1)
    }s`;
  };

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white rounded-lg shadow-md p-3 text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span>{getSelectedWeekdayLabel()}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          <ul>
            {weekdays.map((weekday) => (
              <li key={weekday.id}>
                <button
                  onClick={() => handleWeekdaySelect(weekday.id)}
                  className={`w-full text-left p-3 hover:bg-gray-100 ${
                    selectedWeekday === weekday.id
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  Mark all {weekday.label}
                </button>
              </li>
            ))}
            {selectedWeekday && (
              <li>
                <button
                  onClick={() => handleWeekdaySelect(null)}
                  className="w-full text-left p-3 text-red-500 hover:bg-gray-100"
                >
                  Clear weekday selection
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WeekdaySelector;
