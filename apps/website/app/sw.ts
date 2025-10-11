import type { PrecacheEntry } from "serwist";
import { NetworkFirst, ExpirationPlugin, CacheFirst } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const servist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: /^https:\/\/cdn\.discordapp\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "discord-cdn-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 2 * 24 * 60 * 60, // 2 days
          }),
        ],
      }),
    },
    {
      matcher: ({ url }: { url: URL }) => {
        return url.pathname.startsWith("/api/commands");
      },
      handler: new NetworkFirst({
        cacheName: "api-commands-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 5 * 60, // 5 minutes
          }),
        ],
      }),
    },
    {
      matcher: ({ url }: { url: URL }) => {
        return url.pathname === "/commands";
      },
      handler: new NetworkFirst({
        cacheName: "commands-page-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 5,
            maxAgeSeconds: 60 * 60, // 1 hour
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: { request: Request }) => {
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
  ],
});

servist.addEventListeners();
