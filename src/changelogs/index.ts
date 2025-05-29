import { ChangelogData } from "./types";
import { v2_0_1 } from "./2.0.1";

// Registry of all changelog entries
export const changelogs: ChangelogData = {
  "2.0.1": v2_0_1,
  // Add future versions here:
  // "2.1.0": v2_1_0,
  // "3.0.0": v3_0_0,
};

// Get changelog for specific version
export const getChangelogForVersion = (version: string) => {
  return changelogs[version];
};

// Get all available changelog versions (sorted newest first)
export const getAvailableVersions = (): string[] => {
  return Object.keys(changelogs).sort((a, b) => {
    const aVersion = a.split(".").map(Number);
    const bVersion = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
      const aPart = aVersion[i] || 0;
      const bPart = bVersion[i] || 0;

      if (aPart !== bPart) {
        return bPart - aPart; // Descending order (newest first)
      }
    }

    return 0;
  });
};
