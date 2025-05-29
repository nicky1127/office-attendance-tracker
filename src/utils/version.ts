// src/utils/version.ts - Enhanced version utility
import packageJson from "../../package.json";

// Get current app version
export const getCurrentVersion = (): string => {
  return packageJson.version;
};

// Enhanced version comparison utility
export const isNewerVersion = (
  currentVersion: string,
  storedVersion: string | null | undefined
): boolean => {
  // If no stored version, it's a first-time user
  if (!storedVersion || storedVersion === "") {
    return true;
  }

  try {
    const current = currentVersion.split(".").map(Number);
    const stored = storedVersion.split(".").map(Number);

    // Compare each part of the version
    for (let i = 0; i < Math.max(current.length, stored.length); i++) {
      const currentPart = current[i] || 0;
      const storedPart = stored[i] || 0;

      if (currentPart > storedPart) return true;
      if (currentPart < storedPart) return false;
    }

    return false; // Versions are equal
  } catch (error) {
    console.warn("Error comparing versions:", error);
    // If there's an error parsing versions, assume it's newer to be safe
    return true;
  }
};

// Version validation utility
export const isValidVersion = (version: string): boolean => {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
};

// Get changelog content for version with better error handling
export const getChangelogContent = async (version: string) => {
  try {
    // Validate version format first
    if (!isValidVersion(version)) {
      console.warn(`Invalid version format: ${version}`);
      return null;
    }

    // Dynamic import of changelog file
    const changelog = await import(`../changelogs/${version}.tsx`);
    return changelog.default;
  } catch (error) {
    console.warn(`No changelog found for version ${version}:`, error);
    return null;
  }
};

// Version history utilities
export interface VersionHistory {
  version: string;
  seenAt: string; // ISO string
  changelogShown: boolean;
}

export const getVersionHistory = (): VersionHistory[] => {
  if (typeof window === "undefined") return [];

  try {
    const history = localStorage.getItem("version-history");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.warn("Error reading version history:", error);
    return [];
  }
};

export const addToVersionHistory = (
  version: string,
  changelogShown: boolean = false
) => {
  if (typeof window === "undefined") return;

  try {
    const history = getVersionHistory();
    const existingIndex = history.findIndex((h) => h.version === version);

    const versionEntry: VersionHistory = {
      version,
      seenAt: new Date().toISOString(),
      changelogShown,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = versionEntry;
    } else {
      // Add new entry
      history.push(versionEntry);
    }

    // Keep only last 10 versions to prevent localStorage bloat
    const trimmedHistory = history.slice(-10);
    localStorage.setItem("version-history", JSON.stringify(trimmedHistory));
  } catch (error) {
    console.warn("Error saving version history:", error);
  }
};

// Debug utilities for development
export const getVersionDebugInfo = () => {
  if (typeof window === "undefined") {
    return {
      currentVersion: getCurrentVersion(),
      history: [],
      localStorage: null,
    };
  }

  const currentVersion = getCurrentVersion();
  const history = getVersionHistory();

  return {
    currentVersion,
    history,
    localStorage: {
      lastSeenVersion: (() => {
        try {
          const stored = localStorage.getItem("office-attendance-storage");
          return stored ? JSON.parse(stored).state?.lastSeenVersion : null;
        } catch {
          return null;
        }
      })(),
    },
  };
};

// Force show changelog (useful for testing)
export const forceShowChangelog = () => {
  if (typeof window !== "undefined") {
    const storageKey = "office-attendance-storage";
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        if (parsedData.state) {
          parsedData.state.lastSeenVersion = "0.0.0"; // Set to old version
          localStorage.setItem(storageKey, JSON.stringify(parsedData));
          window.location.reload();
        }
      } catch (error) {
        console.warn("Error forcing changelog:", error);
      }
    }
  }
};
