import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const { DOCS_URL = "https://docs.skyhelper.xyz" } = process.env;

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "discord.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "skyhelper.xyz",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `${DOCS_URL}/:path*`,
      },
      {
        source: "/docs-static/_next/:path*",
        destination: `${DOCS_URL}/docs-static/_next/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
