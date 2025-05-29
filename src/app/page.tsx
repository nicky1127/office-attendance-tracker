"use client";

import { useState, useEffect } from "react";
import MonthYearPicker from "./components/MonthYearPicker";
import Calendar from "./components/Calendar";
import AttendanceStats from "./components/AttendanceStats";
import WeekdaySelector from "./components/WeekdaySelector";
import LeaveSummary from "./components/LeaveSummary";
import AppIcon from "./components/AppIcon";
import VersionChangelog from "./components/VersionChangelog";
import SplashScreen from "./components/SplashScreen";
import { useAttendanceStore } from "@/utils/attendanceStore";
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

  const { periodLength, lastSeenVersion, setLastSeenVersion } =
    useAttendanceStore();

  // Get current version from package.json
  const currentVersion = getCurrentVersion();

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Manually hydrate the store when component mounts
  useEffect(() => {
    if (isHydrated) {
      // Force store hydration
      useAttendanceStore.persist.rehydrate();
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

      // Validate current version format
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
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <div className="flex flex-col items-center">
            <AppIcon size={64} className="mb-3 drop-shadow-md" />
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              Office Attendance Tracker
            </h1>
            <p className="text-gray-600 mt-1">Track my days in the office </p>
          </div>
        </header>

        <div className="space-y-4">
          <MonthYearPicker />
          <AttendanceStats />
          <LeaveSummary />
          <WeekdaySelector />
          <Calendar />

          <div className="pt-4 text-center text-xs text-gray-500">
            <p className="text-xs text-gray-400 font-mono mb-2">
              v{currentVersion}
              {typeof window !== "undefined" &&
                process.env.NODE_ENV === "development" && (
                  <span className="ml-2 text-orange-500">(dev)</span>
                )}
            </p>
            <p>Tap on days to mark office attendance</p>
            <p>Target: Minimum 40% office attendance rate</p>
            <p className="mt-1 text-gray-400">
              Rate calculated over rolling {periodLength}-week periods ending on
              Fridays
            </p>
            <p className="mt-3 text-xs text-gray-400">
              © 2025 Nicky Lai. All rights reserved.
            </p>
          </div>
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
