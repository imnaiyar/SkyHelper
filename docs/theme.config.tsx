import { useRouter } from "next/router";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { InfoBox } from "./components/InfoBox";
import { WarningBox } from "./components/WarningBox";
import { Counter } from "./components/counters";
const BaseUrl = "http://localhost:8080";
const config: DocsThemeConfig = {
  logo: (
    <>
      <img src="/boticon.svg" height="30" width="30" style={{ marginRight: "6px" }} />
      <span>SkyHelper Docs</span>
    </>
  ),
  banner: {
    key: "6.0.0-release",
    text: (
      <a href="/changelogs" target="_blank">
        🎉 v6.0.0 is released. Read more →
      </a>
    ),
  },
  project: {
    link: "https://github.com/imnaiyar/skyhelper",
  },
  chat: {
    link: "https://discord.com/invite/2rjCRKZsBb",
  },
  docsRepositoryBase: "https://github.com/imnaiyar/SkyHelper/tree/translation/docs",
  footer: {
    text: "SkyHelper Docs",
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath === "/") {
      return {
        titleTemplate: "SkyHelper Docs",
      };
    }
    return {
      titleTemplate: "%s | SkyHelper",
    };
  },
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter();
    const { frontMatter } = useConfig();
    const url = BaseUrl + (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    return (
      <>
        <meta property="og:url" content={url} />
        <meta property="og:title" content={frontMatter.title || "SkyHelper"} />
        <link rel="icon" type="image/png" href="/boticon.svg" />
        <meta property="og:description" content={frontMatter.description || "SkyHelper Docs"} />
      </>
    );
  },
  components: {
    InfoBox,
    WarningBox,
    Counter,
  },
};

export default config;
