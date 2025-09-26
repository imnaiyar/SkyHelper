import { Metadata } from "next";

interface OGConfig {
  title: string;
  description?: string;
  pathname?: string;
}

export function generateOGMetadata({ title, description: desc, pathname = "" }: OGConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skyhelper.xyz";
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  const description =
    desc ||
    "SkyHelper is a comprehensive Discord bot designed for the Sky: Children of the Light community. Track daily events, spirit information, shards calendar, and more with real-time updates.";
  const url = baseUrl + pathname;
  // Add parameters to OG image URL
  ogImageUrl.searchParams.set("title", title);
  ogImageUrl.searchParams.set("description", description);
  ogImageUrl.searchParams.set("pathname", pathname || "/");

  return {
    title,
    description,
    keywords: [
      "Sky Children of the Light",
      "Discord Bot",
      "SkyHelper",
      "Gaming",
      "Community",
      "Events",
      "Spirits",
      "Sky: CoTL",
      "Sky",
    ],
    openGraph: {
      title,
      description:
        "Enhance your Sky experience with SkyHelper - the ultimate Discord bot for tracking events, spirits, and seasonal content.",
      url,
      siteName: "SkyHelper",
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl.toString()],
      creator: "Naiyar (NyR)",
      site: "@skyhelper_bot",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
