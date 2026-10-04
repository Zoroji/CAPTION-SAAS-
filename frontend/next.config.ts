import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    Python_Backend: process.env.Python_Backend || process.env.NEXT_PUBLIC_PYTHON_BACKEND || "",
  },
};

export default nextConfig;
