import { useRouter } from "next/router";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { Counter } from "./components/counters";
const BaseUrl = "https://docs.skyhelper.xyz";
import CollapsibleGallery from "./components/CollapsibleGallery";
import Spoiler from "./components/Spoiler";

/**
 * Hide command option description that is common for many commands, so we inject it as a jsx element that we can use everywhere
 * without defining it every time
 */
const BASE_HIDE = () => <>hides the response from others (makes it ephemeral, that only you can see)</>;

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
  docsRepositoryBase: "https://github.com/imnaiyar/SkyHelper/tree/main/docs",
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
        <meta property="og:title" content={frontMatter.title || "SkyHelper Docs"} />
        <link rel="icon" type="image/png" href="/boticon.svg" />

        <meta property="og:type" content="website" />
        <meta property="og:description" content={frontMatter.description || "SkyHelper Docs"} />
        <meta
          property="og:image"
          content={
            "/api/dynamic-banner?" +
            "mainTitle=" +
            (frontMatter.title || "Home") +
            "&path=" +
            asPath +
            (frontMatter.description ? `&description=${frontMatter.description}` : "")
          }
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={BaseUrl.replace(/(https?:\/\/|www\.)/, "")} />
        <meta property="twitter:url" content={url} />
        <meta name="twitter:title" content={frontMatter.title || "SkyHelper Docs"} />
        <meta name="twitter:description" content={frontMatter.description || "SkyHelper Docs"} />
        <meta
          name="twitter:image"
          content={
            "/api/dynamic-banner?" +
            "mainTitle=" +
            (frontMatter.title || "Home") +
            "&path=" +
            asPath +
            (frontMatter.description ? `&description=${frontMatter.description}` : "")
          }
        />
      </>
    );
  },
  components: {
    Counter,
    BASE_HIDE,
    CollapsibleGallery,
    Spoiler,
  },
  sidebar: {
    toggleButton: true,
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
  },
  toc: {
    backToTop: true,
  },
};

export default config;
