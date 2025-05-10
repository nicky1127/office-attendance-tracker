"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { Trash2 } from "lucide-react";

const ResetButton = () => {
  const { currentDate, resetCurrentMonth } = useAttendanceStore();
  const [showConfirm, setShowConfirm] = useState(false);

  // Ensure currentDate is a Date object
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);
  const monthName = format(dateObj, "MMMM yyyy");

  const handleReset = () => {
    if (showConfirm) {
      resetCurrentMonth();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="relative">
      {!showConfirm ? (
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-4 py-3 w-full shadow-sm transition-colors"
          aria-label="Reset month"
        >
          <Trash2 size={16} />
          <span>Reset {monthName}</span>
        </button>
      ) : (
        <div className="flex flex-col space-y-2">
          <p className="text-center text-sm text-gray-700 mb-1">
            Clear all marked days for {monthName}?
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetButton;
