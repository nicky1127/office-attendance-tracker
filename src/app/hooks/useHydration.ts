"use client";

import { useState, useEffect } from "react";

/**
 * Hook to safely detect if component has hydrated on the client
 * Prevents hydration mismatches by ensuring server and client render the same initially
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect only runs on the client after hydration
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

/**
 * Hook for safely accessing client-only APIs like localStorage
 */
export const useClientOnly = <T>(clientValue: () => T, serverValue: T): T => {
  const [value, setValue] = useState<T>(serverValue);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      setValue(clientValue());
    }
  }, [isHydrated, clientValue]);

  return isHydrated ? value : serverValue;
};
