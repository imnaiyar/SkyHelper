"use client";
import { useToast } from "@/app/hooks/useToast";
import { useEffect } from "react";

export default function PWARegister() {
  const { info } = useToast();
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return; // do not register in dev mode

    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          console.log("Service worker registered", reg);

          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                info({ title: "Content Outdated!", message: "Please refresh the page to get latest content", duration: -1 });
              }
            });
          });
        } catch (err) {
          console.warn("SW registration failed:", err);
        }
      };
      register();
    }
  }, []);

  return null;
}
