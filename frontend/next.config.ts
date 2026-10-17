import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  compiler: {
    // Remove console logs only in production
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false
  },
  allowedDevOrigins: ['192.168.240.147'],
};

export default nextConfig;
