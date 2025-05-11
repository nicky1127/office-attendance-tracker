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
          className="flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors mx-auto"
          aria-label="Reset month"
        >
          <Trash2 size={14} className="mr-1 text-gray-400" />
          <span>Reset {monthName}</span>
        </button>
      ) : (
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">
            Clear all marked days for {monthName}?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="text-xs py-1 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
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
