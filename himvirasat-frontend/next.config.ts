import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile shared package source directly
  transpilePackages: ["@himvirasat/shared"],

  // Map .js import specifiers in TS files to .ts/.tsx extensions during development
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;