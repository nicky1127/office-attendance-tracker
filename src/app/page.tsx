"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Calendar as CalendarIcon, CalendarDays } from "lucide-react";
import MonthYearPicker from "./components/MonthYearPicker";
import Calendar from "./components/Calendar";
import ScrollableCalendar from "./components/ScrollableCalendar";
import AttendanceStats from "./components/AttendanceStats";
import WeekdaySelector from "./components/WeekdaySelector";
import LeaveSummary from "./components/LeaveSummary";
import PlannerAttendanceStats from "./components/PlannerAttendanceStats";
import PlannerLeaveSummary from "./components/PlannerLeaveSummary";
import PlannerIntroduction from "./components/PlannerIntroduction";
import AppFooter from "./components/AppFooter";
import AppIcon from "./components/AppIcon";
import AppBar from "./components/AppBar";
import VersionChangelog from "./components/VersionChangelog";
import SplashScreen from "./components/SplashScreen";
import { useAttendanceStore } from "@/utils/attendanceStore";
import { usePlannerStore } from "@/utils/plannerStore";
import { useHydration } from "./hooks/useHydration";
import {
  getCurrentVersion,
  isNewerVersion,
  addToVersionHistory,
  getVersionDebugInfo,
  isValidVersion,
} from "@/utils/version";

export default function Home() {
  const isHydrated = useHydration();
  const [showSplash, setShowSplash] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogVersion, setChangelogVersion] = useState<string>("");
  const [versionCheckComplete, setVersionCheckComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState<"tracker" | "planner">(
    "tracker"
  );

  const { periodLength, lastSeenVersion, setLastSeenVersion } =
    useAttendanceStore();

  // Get current version from package.json
  const currentVersion = getCurrentVersion();

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Handle page navigation
  const handlePageChange = (page: "tracker" | "planner") => {
    setCurrentPage(page);
  };

  // Manually hydrate the stores when component mounts
  useEffect(() => {
    if (isHydrated) {
      // Force store hydration
      useAttendanceStore.persist.rehydrate();
      usePlannerStore.persist.rehydrate();
    }
  }, [isHydrated]);

  // Check for version updates only after hydration
  useEffect(() => {
    if (!isHydrated || versionCheckComplete) return;

    // Add a delay to ensure store is fully hydrated
    const checkVersionTimer = setTimeout(() => {
      console.log("Version check:", {
        currentVersion,
        lastSeenVersion,
        isNewer: isNewerVersion(currentVersion, lastSeenVersion),
        isValidCurrent: isValidVersion(currentVersion),
      });

      // Validate current version format first
      if (!isValidVersion(currentVersion)) {
        console.warn("Invalid current version format:", currentVersion);
        setVersionCheckComplete(true);
        return;
      }

      // Check if this is a newer version or first time user
      if (isNewerVersion(currentVersion, lastSeenVersion)) {
        console.log("Showing changelog for version:", currentVersion);
        setChangelogVersion(currentVersion);
        setShowChangelog(true);

        // Add to version history immediately when showing
        addToVersionHistory(currentVersion, true);
      } else {
        console.log("No changelog needed, versions match");
        // Still add to history for tracking purposes
        addToVersionHistory(currentVersion, false);
      }

      setVersionCheckComplete(true);
    }, 200); // Slightly longer delay for store hydration

    return () => clearTimeout(checkVersionTimer);
  }, [isHydrated, currentVersion, lastSeenVersion, versionCheckComplete]);

  // Handle changelog close
  const handleChangelogClose = () => {
    console.log(
      "Closing changelog and updating lastSeenVersion to:",
      changelogVersion
    );
    setShowChangelog(false);

    // Update the stored version
    setLastSeenVersion(changelogVersion);

    // Update version history to mark changelog as shown
    addToVersionHistory(changelogVersion, true);
  };

  // Debug function for development (only on client)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      (window as any).getVersionDebugInfo = getVersionDebugInfo;
      (window as any).forceShowChangelog = () => {
        const { forceShowChangelog } = require("@/utils/version");
        forceShowChangelog();
      };
    }
  }, [isHydrated]);

  // Show splash screen during hydration and initial loading
  if (!isHydrated || showSplash) {
    return (
      <SplashScreen onComplete={handleSplashComplete} minDisplayTime={0} />
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* App Bar */}
      <AppBar currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {currentPage === "tracker" ? (
            // Tracker Page
            <>
              <div className="space-y-4">
                <MonthYearPicker />
                <AttendanceStats />
                <LeaveSummary />
                <WeekdaySelector />
                <Calendar />

                <AppFooter
                  currentVersion={currentVersion}
                  currentPage={currentPage}
                  periodLength={periodLength}
                />
              </div>
            </>
          ) : (
            // Planner Page - Uses planner-specific components and scrollable calendar
            <>
              <div className="space-y-4">
                {/* Planner Introduction Component */}
                <PlannerIntroduction />

                {/* Use Planner-specific components */}
                <PlannerAttendanceStats />
                <PlannerLeaveSummary />
                <ScrollableCalendar />

                <AppFooter
                  currentVersion={currentVersion}
                  currentPage={currentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Version Changelog Popup - only show after hydration */}
      {showChangelog && changelogVersion && (
        <VersionChangelog
          currentVersion={changelogVersion}
          onClose={handleChangelogClose}
        />
      )}
    </main>
  );
}
