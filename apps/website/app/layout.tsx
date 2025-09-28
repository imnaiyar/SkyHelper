import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import { DiscordAuthProvider } from "./components/auth/DiscordAuthContext";
import { NotificationProvider } from "./components/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import PWARegister from "./components/ui/PWARegister";
import OfflineIndicator from "./components/ui/OfflineIndicator";
import FloatingStarsBackground from "./components/ui/FloatingStarsBackground";
import { generateOGMetadata } from "../lib/og";
import { AuthUser } from "./lib/auth/types";
import { cookies } from "next/headers";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = (await cookies()).toString();
  const data = (await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/user", { headers: { Cookie: c } }).then((r) =>
    r.json(),
  )) as AuthUser | { error: string }; // get initial user
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" type="image/png" href="/icons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="SkyHelper" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-900 text-white`}>
        <FloatingStarsBackground />
        <NotificationProvider>
          <DiscordAuthProvider user={"id" in data ? data : undefined}>
            <div className="min-h-screen p-4 relative z-10">
              <Header />
              <div className="pt-18">{children}</div>
              <NotificationContainer />
              <PWARegister />
              <OfflineIndicator />
            </div>

            <Footer />
          </DiscordAuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
