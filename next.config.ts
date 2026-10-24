import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API routes read the profile from disk at runtime; ship it with them.
  outputFileTracingIncludes: {
    "/api/**": ["./src/content/profile.md"],
  },
};

export default nextConfig;
