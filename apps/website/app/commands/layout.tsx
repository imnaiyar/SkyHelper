import { generateOGMetadata } from "@/lib/og";
import { Metadata } from "next";

export const metadata: Metadata = generateOGMetadata({
  title: "Commands | SkyHelper",
  description: "Learn about all the commands offered by SkyHelper",
  pathname: "/commands",
});

export default function CommandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
