"use client";

import { useState } from "react";
import { Menu, X, Calendar, PlannerIcon } from "lucide-react";
import AppIcon from "./AppIcon";

interface AppBarProps {
  currentPage: "tracker" | "planner";
  onPageChange: (page: "tracker" | "planner") => void;
}

const AppBar = ({ currentPage, onPageChange }: AppBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePageSelect = (page: "tracker" | "planner") => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* App Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Menu Panel */}
          <div
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
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
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {/* Tracker Option */}
              <button
                onClick={() => handlePageSelect("tracker")}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                  currentPage === "tracker"
                    ? "bg-blue-50 border-2 border-blue-200"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    currentPage === "tracker" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Calendar
                    size={20}
                    className={
                      currentPage === "tracker"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-medium ${
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
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>

              {/* Planner Option */}
              <button
                onClick={() => handlePageSelect("planner")}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                  currentPage === "planner"
                    ? "bg-purple-50 border-2 border-purple-200"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    currentPage === "planner" ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={
                      currentPage === "planner"
                        ? "text-purple-600"
                        : "text-gray-600"
                    }
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
                    className={`font-medium ${
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
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
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
