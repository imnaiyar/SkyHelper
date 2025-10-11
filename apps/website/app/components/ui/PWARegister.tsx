"use client";
import { useToast } from "@/app/hooks/useToast";
import { useEffect } from "react";
import { Serwist, SerwistLifecycleEvent } from "@serwist/window";

export default function PWARegister() {
  const { info } = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return; // do not register in dev mode

    if (!("serviceWorker" in navigator)) return;

    const serwist = new Serwist("/sw.js", {
      scope: "/",
      type: "classic",
    });

    const confirmWait = (event: SerwistLifecycleEvent) => {
      if (!event.isUpdate) return;

      info({
        title: "Content Outdated!",
        message: "Please refresh the page to get latest content",
        duration: -1,
      });
    };
    serwist.addEventListener("installed", confirmWait);

    serwist.register().catch((err) => console.warn("SW Register Error", err));

    return () => {
      serwist.removeEventListener("installed", confirmWait);
    };
  }, []);

  return null;
}
