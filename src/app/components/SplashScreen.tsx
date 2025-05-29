"use client";

import { useState, useEffect } from "react";
import AppIcon from "./AppIcon";
import { getCurrentVersion } from "@/utils/version";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number; // Minimum time to show splash (ms)
}

const SplashScreen = ({
  onComplete,
  minDisplayTime = 2000,
}: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [isVisible, setIsVisible] = useState(true);

  const currentVersion = getCurrentVersion();

  const loadingSteps = [
    { text: "Loading...", duration: 300 },
    { text: "Initializing app...", duration: 400 },
    { text: "Loading attendance data...", duration: 500 },
    { text: "Checking for updates...", duration: 400 },
    { text: "Ready!", duration: 300 },
  ];

  useEffect(() => {
    let currentStep = 0;
    let totalProgress = 0;
    const stepIncrement = 100 / loadingSteps.length;

    const runLoadingSequence = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingText(step.text);

        // Animate progress for this step
        const progressTimer = setInterval(() => {
          totalProgress += 2;
          setProgress(
            Math.min(totalProgress, (currentStep + 1) * stepIncrement)
          );
        }, step.duration / 10);

        setTimeout(() => {
          clearInterval(progressTimer);
          setProgress((currentStep + 1) * stepIncrement);
          currentStep++;
          runLoadingSequence();
        }, step.duration);
      } else {
        // Loading complete, wait for minimum display time
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 300); // Wait for fade out animation
        }, Math.max(0, minDisplayTime - Date.now() + startTime));
      }
    };

    const startTime = Date.now();
    runLoadingSequence();
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* App Icon with Animation */}
      <div className="mb-8">
        <div className="relative">
          <AppIcon size={120} className="drop-shadow-lg" />

          {/* Pulse Animation Ring */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-teal-600 to-indigo-600 rounded-full"></div>
          </div>

          {/* Rotating Ring */}
          <div className="absolute inset-0 animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-teal-500 border-r-indigo-500 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      {/* App Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Office Attendance Tracker
        </h1>
        <p className="text-gray-600 text-lg">Track your office days</p>
        <p className="text-xs text-gray-400 mt-2 font-mono">
          v{currentVersion}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center min-h-[2rem]">
        <p className="text-gray-600 animate-pulse">{loadingText}</p>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full opacity-30 animate-float-${
              (i % 3) + 1
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
