"use client";
import { useToast } from "@/app/hooks/useToast";
import { useEffect } from "react";
import { Serwist } from "@serwist/window";

export default function PWARegister() {
  const { info } = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return; // do not register in dev mode

    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const serwist = new Serwist("/sw.js", {
            scope: "/",
            type: "classic",
          });

          // Listen for updates
          serwist.addEventListener("installed", (event) => {
            if (!event.isUpdate) return;

            info({
              title: "Content Outdated!",
              message: "Please refresh the page to get latest content",
              duration: -1,
            });
          });

          await serwist.register();
          console.log("Service worker registered with Serwist");
        } catch (err) {
          console.warn("SW registration failed:", err);
        }
      };

      register();
    }
  }, [info]);

  return null;
}
