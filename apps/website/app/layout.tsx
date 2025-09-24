import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { DiscordAuthProvider } from "./components/DiscordAuthContext";
import { generateOGMetadata } from "../lib/og";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = generateOGMetadata({
  title: "SkyHelper",
  description:
    "SkyHelper is a comprehensive Discord bot designed for the Sky: Children of the Light community. Track daily events, spirit information, shards calendar, and more with real-time updates.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-900 text-white`}>
        <DiscordAuthProvider>
          <div className="min-h-screen bg-slate-900">
            <Header />
            <div className="pt-20">{children}</div>
            <Footer />
          </div>
        </DiscordAuthProvider>
      </body>
    </html>
  );
}
