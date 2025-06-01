"use client";

interface AppFooterProps {
  currentVersion: string;
  currentPage: "tracker" | "planner";
  periodLength?: number;
}

const AppFooter = ({
  currentVersion,
  currentPage,
  periodLength,
}: AppFooterProps) => {
  return (
    <div className="pt-4 text-center text-xs text-gray-500">
      <p className="text-xs text-gray-400 font-mono mb-2">
        v{currentVersion}
        {currentPage === "planner" && " - Planner Mode"}
        {typeof window !== "undefined" &&
          process.env.NODE_ENV === "development" && (
            <span className="ml-2 text-orange-500">(dev)</span>
          )}
      </p>

      <p>Tap on days to mark office attendance</p>
      <p>Target: Minimum 40% office attendance rate</p>
      <p className="mt-1 text-gray-400">
        Rate calculated over rolling {periodLength || 4}-week periods ending on
        Fridays
      </p>

      <p className="mt-3 text-xs text-gray-400">
        © 2025 Nicky Lai. All rights reserved.
      </p>
    </div>
  );
};

export default AppFooter;
