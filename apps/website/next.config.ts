import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://skyhelper.xyz/**")],
  },
};

export default nextConfig;
