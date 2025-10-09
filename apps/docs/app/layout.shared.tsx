import { DISCORD_SERVER } from "@/lib/constants";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BiSupport } from "react-icons/bi";
import { CgWebsite } from "react-icons/cg";

export function linkOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/imnaiyar/skyhelper",
    links: [
      {
        text: "Website",
        url: "https://skyhelper.xyz",
        icon: <CgWebsite />,
      },
      {
        text: "Support",
        url: DISCORD_SERVER,
        external: true,
        icon: <BiSupport />,
      },
    ],
  };
}
