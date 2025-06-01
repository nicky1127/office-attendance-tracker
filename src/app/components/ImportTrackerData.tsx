"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { usePlannerStore } from "@/utils/plannerStore";

const ImportTrackerData = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Get tracker data
  const trackerAttendedDays = useAttendanceStore((state) => state.attendedDays);
  const trackerAnnualLeaveDays = useAttendanceStore(
    (state) => state.annualLeaveDays
  );
  const trackerSickLeaveDays = useAttendanceStore(
    (state) => state.sickLeaveDays
  );

  // Get planner actions
  const {
    attendedDays: plannerAttendedDays,
    annualLeaveDays: plannerAnnualLeaveDays,
    sickLeaveDays: plannerSickLeaveDays,
  } = usePlannerStore();

  const setPlannerAttendedDays = usePlannerStore((state) => state.attendedDays);
  const setPlannerAnnualLeaveDays = usePlannerStore(
    (state) => state.annualLeaveDays
  );
  const setPlannerSickLeaveDays = usePlannerStore(
    (state) => state.sickLeaveDays
  );

  // Count total tracker entries
  const trackerDataCount =
    Object.keys(trackerAttendedDays).length +
    Object.keys(trackerAnnualLeaveDays).length +
    Object.keys(trackerSickLeaveDays).length;

  // Count existing planner entries
  const plannerDataCount =
    Object.keys(plannerAttendedDays).length +
    Object.keys(plannerAnnualLeaveDays).length +
    Object.keys(plannerSickLeaveDays).length;

  const handleImport = async () => {
    setIsImporting(true);
    setShowConfirm(false);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Overwrite planner data with tracker data (complete replacement)
      usePlannerStore.setState({
        attendedDays: { ...trackerAttendedDays },
        annualLeaveDays: { ...trackerAnnualLeaveDays },
        sickLeaveDays: { ...trackerSickLeaveDays },
      });

      setImportComplete(true);

      // Reset success state after 3 seconds
      setTimeout(() => {
        setImportComplete(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to import tracker data:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleButtonClick = () => {
    if (plannerDataCount > 0) {
      setShowConfirm(true);
    } else {
      handleImport();
    }
  };

  if (trackerDataCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Download size={20} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-500">Import Tracker Data</h3>
            <p className="text-sm text-gray-400">
              No attendance data found in tracker mode
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      {!showConfirm ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                importComplete ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {importComplete ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Download size={20} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">
                {importComplete
                  ? "Data Imported Successfully!"
                  : "Import Tracker Data"}
              </h3>
              <p className="text-sm text-gray-600">
                {importComplete
                  ? `Replaced planner data with ${trackerDataCount} tracker records`
                  : `Replace planner data with ${trackerDataCount} tracker records`}
              </p>
            </div>
          </div>

          {!importComplete && (
            <button
              onClick={handleButtonClick}
              disabled={isImporting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isImporting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
              }`}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Import</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Download size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Confirm Data Import</h3>
              <p className="text-sm text-gray-600">
                You have {plannerDataCount} existing records in planner mode
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm text-amber-800 mb-3">
              Importing will <strong>replace all</strong> planner data with
              tracker data:
            </p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• All existing planner attendance records will be cleared</li>
              <li>• Tracker data will completely replace planner data</li>
              <li>• You can then modify dates to create planning scenarios</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Replace Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTrackerData;
