import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { linkOptions } from "./layout.shared";
/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <img
          src="https://skyhelper.xyz/assets/img/boticon.png"
          alt="SkyHelper"
          width="24"
          height="24"
          style={{ borderRadius: "4px" }}
        />
        SkyHelper
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  ...linkOptions(),
};
