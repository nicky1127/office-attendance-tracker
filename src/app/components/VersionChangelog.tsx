"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { getChangelogContent } from "@/utils/version";
import { ChangelogContent } from "@/changelogs/types";

interface VersionChangelogProps {
  currentVersion: string;
  onClose: () => void;
}

const VersionChangelog = ({
  currentVersion,
  onClose,
}: VersionChangelogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [changelogContent, setChangelogContent] =
    useState<ChangelogContent | null>(null);

  // Load changelog content and fade in animation
  useEffect(() => {
    const loadChangelog = async () => {
      const content = await getChangelogContent(currentVersion);
      setChangelogContent(content);
      setIsVisible(true);
    };

    loadChangelog();
  }, [currentVersion]);

  // Close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for fade out
  };

  if (!changelogContent) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white p-6 relative flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">What's New</h2>
              <p className="text-white/90 text-sm">Version {currentVersion}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-2">
            {changelogContent.title}
          </h3>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Key Features</h4>
            <div className="space-y-3">
              {changelogContent.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                  <div>
                    <h5 className="font-medium text-gray-800 text-sm">
                      {feature.title}
                    </h5>
                    <p className="text-gray-600 text-xs mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Improvements</h4>
            <ul className="space-y-3">
              {changelogContent.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-emerald-500 mr-3 mt-1 flex-shrink-0 text-lg leading-none">
                    •
                  </span>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {improvement}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-all hover:from-teal-700 hover:to-indigo-700"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionChangelog;
