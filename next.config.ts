import type { NextConfig } from "next";

const skipTypecheck = process.env.SKIP_TYPECHECK === "true";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: skipTypecheck,
  },
  eslint: {
    ignoreDuringBuilds: skipTypecheck,
  },
};

export default nextConfig;
