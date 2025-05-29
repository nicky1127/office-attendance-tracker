// Import version from package.json
import packageJson from "../../package.json";

// Get current app version
export const getCurrentVersion = (): string => {
  return packageJson.version;
};

// Version comparison utility
export const isNewerVersion = (
  currentVersion: string,
  storedVersion: string
): boolean => {
  if (!storedVersion) return true; // First time user

  const current = currentVersion.split(".").map(Number);
  const stored = storedVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(current.length, stored.length); i++) {
    const currentPart = current[i] || 0;
    const storedPart = stored[i] || 0;

    if (currentPart > storedPart) return true;
    if (currentPart < storedPart) return false;
  }

  return false; // Versions are equal
};

// Get changelog content for version
export const getChangelogContent = async (version: string) => {
  try {
    // Dynamic import of changelog file
    const changelog = await import(`../changelogs/${version}.ts`);
    return changelog.default;
  } catch (error) {
    console.warn(`No changelog found for version ${version}`);
    return null;
  }
};
