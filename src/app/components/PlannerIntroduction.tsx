"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

const PlannerIntroduction = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Info size={18} className="text-blue-600" />
          <h2 className="text-lg font-medium text-blue-800">
            How to use Planner
          </h2>
        </div>
        <button className="text-blue-500 hover:text-blue-700 transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            How to use the Planner:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1.5">
            <li>
              • <strong>Set Planner Today:</strong> Use "Mark Today" mode to set
              any working day as your reference "today"
            </li>
            <li>
              • <strong>Period Window:</strong> Choose 4-week or 12-week periods
              ending on the most recent Friday
            </li>
            <li>
              • <strong>Plan Ahead:</strong> Mark future attendance, holidays,
              and sick days
            </li>
            <li>
              • <strong>Live Updates:</strong> See how different scenarios
              affect your attendance rate
            </li>
            <li>
              • <strong>Visual Feedback:</strong> Dimmed dates are outside your
              current period window
            </li>
            <li>
              • <strong>Reset:</strong> Use "Reset to Today" to return to the
              actual current date
            </li>
          </ul>
          <div className="mt-3 pt-2 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Tip:</strong> The blue ring shows your current "planner
              today" date. All calculations are based on periods ending on the
              most recent Friday relative to this date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerIntroduction;
