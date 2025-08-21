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
        external: true,
        icon: <CgWebsite />,
      },
      {
        text: "Support",
        url: "https://discord.com/invite/2rjCRKZsBb",
        external: true,
        icon: <BiSupport />,
      },
    ],
  };
}
