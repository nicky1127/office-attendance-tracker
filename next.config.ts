import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Improve hydration stability
  experimental: {
    // This can help with hydration issues
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // Ensure consistent rendering between server and client
  compiler: {
    // Remove console.logs in production to avoid hydration differences
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
