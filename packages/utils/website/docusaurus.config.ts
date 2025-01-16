import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { join } from "node:path"
const config: Config = {
  title: 'SkyUtils',
  tagline: 'Documentation for utility package for SkyHelper Bot',
  url: 'https://utils.skyhelper.xyz',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://skyhelper.xyz/assets/img/boticon.png',
  organizationName: 'SkyHelper',
  projectName: 'https://github.com/imnaiyar/utils', 
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  themes:[],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@imnaiyar/typedoc-docusaurus-plugin',
      {
        projectRoot: join(__dirname, "../"),
        packages: ["."],
        typedocOptions: {
          tsconfig: '../tsconfig.json',
          includeVersion: true,
          excludePrivate: true,
          excludeExternals: true,
          excludeNotDocumented: false,
          disableSources: false,
        },
      },
    ],
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: 'https://skyhelper.xyz/assets/img/boticon.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json', 
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: 'rgb(37, 194, 160)',
          },
        ],
      },
    ]
  ],


  themeConfig: {
    image: 'https://skyhelper.xyz/assets/img/boticon.png',
    navbar: {
      title: 'SkyHelper Utils',
      logo: {
        alt: 'SkyHelper',
        src: 'https://skyhelper.xyz/assets/img/boticon.png',
      },
      items: [
        {
          to: "/api",
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/imnaiyar/utils',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation',
              to: '/api',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.com/invite/2rjCRKZsBb',
            },
            {
              label: 'SkyHelper',
              href: 'https://skyhelper.xyz',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/imnaiyar/utils',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://skyhelper.xyz">SkyHelper</a>`,
    },
    prism: {
      defaultLanguage: "typescript",
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
