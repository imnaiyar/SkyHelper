"use client";
import { useEffect, useState } from "react";
import { BotOffIcon } from "lucide-react";

export default function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      aria-live="polite"
      className="flex flex-row gap-2"
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        zIndex: 9999,
      }}
    >
      <BotOffIcon />
      Offline
    </div>
  );
}
