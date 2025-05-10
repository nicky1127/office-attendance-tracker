"use client";

import { useState, useEffect } from "react";

interface ViewportDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useViewport = (): ViewportDimensions => {
  // Default to desktop size initially (prevents hydration mismatch)
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    // Update dimensions on mount
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Set initial dimensions
    updateViewport();

    // Listen for window resize events
    window.addEventListener("resize", updateViewport);

    // Cleanup
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
};
