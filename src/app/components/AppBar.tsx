"use client";

import { useState, useEffect } from "react";
import { Menu, X, Calendar, PlannerIcon } from "lucide-react";
import AppIcon from "./AppIcon";

interface AppBarProps {
  currentPage: "tracker" | "planner";
  onPageChange: (page: "tracker" | "planner") => void;
}

const AppBar = ({ currentPage, onPageChange }: AppBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsAnimating(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsAnimating(false);
      }, 300); // Match the animation duration
    } else {
      // Start opening animation
      setIsMenuOpen(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePageSelect = (page: "tracker" | "planner") => {
    onPageChange(page);
    // Close menu with animation
    setIsAnimating(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsAnimating(false);
    }, 300);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isMenuOpen && !isAnimating) {
        toggleMenu();
      }
    };

    if (isMenuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 100); // Small delay to prevent immediate closing
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isMenuOpen, isAnimating]);

  return (
    <>
      {/* App Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6 relative z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Center: App title with icon */}
          <div className="flex items-center space-x-2">
            <AppIcon size={24} />
            <h1 className="text-lg font-semibold text-gray-800">
              {currentPage === "tracker"
                ? "Attendance Tracker"
                : "Attendance Planner"}
            </h1>
          </div>

          {/* Right: Spacer to center the title */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* Slide-out Menu Overlay */}
      {isMenuOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isAnimating && !isMenuOpen ? "pointer-events-none" : ""
          }`}
        >
          {/* Background Overlay with fade animation */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
              isMenuOpen && !isAnimating ? "opacity-50" : "opacity-0"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAnimating) toggleMenu();
            }}
          />

          {/* Menu Panel with slide animation */}
          <div
            className={`absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
              isMenuOpen && !isAnimating ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <AppIcon size={32} />
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Office Tracker
                  </h2>
                  <p className="text-xs text-gray-500">Choose your mode</p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Menu Items with staggered animation */}
            <div className="p-4 space-y-2">
              {/* Tracker Option */}
              <div
                className={`transform transition-all duration-300 ease-out ${
                  isMenuOpen && !isAnimating
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? "100ms" : "0ms",
                }}
              >
                <button
                  onClick={() => handlePageSelect("tracker")}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ${
                    currentPage === "tracker"
                      ? "bg-blue-50 border-2 border-blue-200 transform scale-105"
                      : "hover:bg-gray-50 border-2 border-transparent hover:scale-102"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === "tracker" ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Calendar
                      size={20}
                      className={`transition-colors duration-200 ${
                        currentPage === "tracker"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <h3
                      className={`font-medium transition-colors duration-200 ${
                        currentPage === "tracker"
                          ? "text-blue-800"
                          : "text-gray-800"
                      }`}
                    >
                      Attendance Tracker
                    </h3>
                    <p className="text-sm text-gray-500">
                      Track your real office attendance
                    </p>
                  </div>
                  {currentPage === "tracker" && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              </div>

              {/* Planner Option */}
              <div
                className={`transform transition-all duration-300 ease-out ${
                  isMenuOpen && !isAnimating
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? "200ms" : "0ms",
                }}
              >
                <button
                  onClick={() => handlePageSelect("planner")}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ${
                    currentPage === "planner"
                      ? "bg-purple-50 border-2 border-purple-200 transform scale-105"
                      : "hover:bg-gray-50 border-2 border-transparent hover:scale-102"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === "planner"
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-colors duration-200 ${
                        currentPage === "planner"
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    >
                      <path
                        d="M8 2v3m8-3v3m-9 8h10M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="16" r="2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3
                      className={`font-medium transition-colors duration-200 ${
                        currentPage === "planner"
                          ? "text-purple-800"
                          : "text-gray-800"
                      }`}
                    >
                      Attendance Planner
                    </h3>
                    <p className="text-sm text-gray-500">
                      Plan future attendance scenarios
                    </p>
                  </div>
                  {currentPage === "planner" && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Menu Footer with slide-up animation */}
            <div
              className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50 transform transition-all duration-300 ease-out ${
                isMenuOpen && !isAnimating
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: isMenuOpen ? "300ms" : "0ms",
              }}
            >
              <p className="text-xs text-gray-500 text-center">
                Switch between tracking real attendance and planning future
                scenarios
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppBar;
