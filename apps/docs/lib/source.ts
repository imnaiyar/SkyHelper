import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";
import { createElement } from "react";

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  icon(icon) {
    if (!icon) {
      return undefined;
    }

    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }

    return undefined;
  },
  // it assigns a URL to your pages
  baseUrl: "/guide",
  source: docs.toFumadocsSource(),
  pageTree: {
    attachFile,
  },
});

export const openapi = createOpenAPI();
