import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og"],
      disallow: "/api",
    },
    sitemap: "https://next.skyhelper.xyz/sitemap.xml",
    host: "https://next.skyhelper.xyz",
  };
}
