import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | SkyHelper",
    default: "SkyHelper - Your Sky: Children of the Light Companion Bot",
  },
  description: "SkyHelper is a feature-rich Discord bot designed to enhance your Sky: Children of the Light experience.",
  metadataBase: new URL("https://docs.skyhelper.xyz"),
  openGraph: {
    title: "SkyHelper Documentation",
    description: "SkyHelper is a feature-rich Discord bot designed to enhance your Sky: Children of the Light experience.",
    url: "https://docs.skyhelper.xyz",
    siteName: "SkyHelper",
    images: [
      {
        url: "https://skyhelper.xyz/assets/img/boticon.png",
        width: 400,
        height: 400,
        alt: "SkyHelper",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SkyHelper Documentation",
    description: "SkyHelper is a feature-rich Discord bot designed to enhance your Sky: Children of the Light experience.",
    images: ["https://skyhelper.xyz/assets/img/boticon.png"],
  },
  icons: {
    icon: "https://skyhelper.xyz/assets/img/boticon.png",
    apple: "https://skyhelper.xyz/assets/img/boticon.png",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
