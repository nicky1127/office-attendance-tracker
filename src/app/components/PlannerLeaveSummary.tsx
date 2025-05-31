"use client";

import { useState } from "react";
import { format, getYear, isSameMonth, parseISO } from "date-fns";
import { usePlannerStore } from "@/utils/plannerStore";
import { ChevronDown, ChevronUp } from "lucide-react";

const PlannerLeaveSummary = () => {
  const { plannerToday, annualLeaveDays, sickLeaveDays } = usePlannerStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure plannerToday is a Date object
  const dateObj =
    plannerToday instanceof Date ? plannerToday : new Date(plannerToday);

  // Group leave days by month
  const leaveByMonth: Record<string, { annual: string[]; sick: string[] }> = {};

  // Process annual leave days
  Object.keys(annualLeaveDays).forEach((dateStr) => {
    const date = parseISO(dateStr);
    const monthYear = format(date, "MMMM yyyy");

    if (!leaveByMonth[monthYear]) {
      leaveByMonth[monthYear] = { annual: [], sick: [] };
    }

    leaveByMonth[monthYear].annual.push(dateStr);
  });

  // Process sick leave days
  Object.keys(sickLeaveDays).forEach((dateStr) => {
    const date = parseISO(dateStr);
    const monthYear = format(date, "MMMM yyyy");

    if (!leaveByMonth[monthYear]) {
      leaveByMonth[monthYear] = { annual: [], sick: [] };
    }

    leaveByMonth[monthYear].sick.push(dateStr);
  });

  // Sort months with the current month first
  const sortedMonths = Object.keys(leaveByMonth).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);

    // Current month comes first
    if (isSameMonth(dateA, dateObj) && !isSameMonth(dateB, dateObj)) return -1;
    if (!isSameMonth(dateA, dateObj) && isSameMonth(dateB, dateObj)) return 1;

    // Otherwise sort by date (newest first)
    return dateB.getTime() - dateA.getTime();
  });

  // Count total leave days
  const totalAnnualLeaveDays = Object.values(leaveByMonth).reduce(
    (total, month) => total + month.annual.length,
    0
  );

  const totalSickLeaveDays = Object.values(leaveByMonth).reduce(
    (total, month) => total + month.sick.length,
    0
  );

  const totalLeaveDays = totalAnnualLeaveDays + totalSickLeaveDays;

  if (totalLeaveDays === 0) {
    return null; // Don't show the component if there are no leave days
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-medium text-purple-800">
          Planner Leave Summary
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {totalAnnualLeaveDays > 0 && (
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                {totalAnnualLeaveDays} holiday
              </span>
            )}
            {totalSickLeaveDays > 0 && (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                {totalSickLeaveDays} sick
              </span>
            )}
          </div>
          <button className="text-purple-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {sortedMonths.map((month) => {
            const monthData = leaveByMonth[month];
            const hasAnnual = monthData.annual.length > 0;
            const hasSick = monthData.sick.length > 0;

            return (
              <div key={month} className="border-t pt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {month}
                </h3>

                {/* Annual Leave */}
                {hasAnnual && (
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-amber-700 mb-1">
                      Annual Leave ({monthData.annual.length} days)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {monthData.annual.sort().map((dateStr) => (
                        <div
                          key={`annual-${dateStr}`}
                          className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded flex items-center"
                        >
                          {format(parseISO(dateStr), "d MMM")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sick Leave */}
                {hasSick && (
                  <div>
                    <h4 className="text-xs font-medium text-red-700 mb-1">
                      Sick Leave ({monthData.sick.length} days)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {monthData.sick.sort().map((dateStr) => (
                        <div
                          key={`sick-${dateStr}`}
                          className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded flex items-center"
                        >
                          {format(parseISO(dateStr), "d MMM")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlannerLeaveSummary;
