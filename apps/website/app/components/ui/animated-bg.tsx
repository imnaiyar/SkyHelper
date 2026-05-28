"use client";

import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-900">
      {/* Base background */}
      <div className="absolute inset-0 bg-slate-900" />

      {/* Aurora */}
      <motion.div
        className="
          absolute
          left-1/2
          top-1/2
          h-[160vh]
          w-[160vw]
          -translate-x-1/2
          -translate-y-1/2
          opacity-40
          blur-[120px]
          will-change-transform
        "
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: `
            conic-gradient(
              from 180deg,
              rgba(59,130,246,0.15),
              rgba(99,102,241,0.12),
              rgba(168,85,247,0.15),
              rgba(14,165,233,0.12),
              rgba(59,130,246,0.15)
            )
          `,
        }}
      />

      {/* Top glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12), transparent 45%)",
        }}
      />

      {/* Left glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 0% 50%, rgba(168,85,247,0.08), transparent 40%)",
        }}
      />

      {/* Right glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 100% 50%, rgba(14,165,233,0.08), transparent 40%)",
        }}
      />

      {/* Noise */}
      <div
        className="
          absolute inset-0
          opacity-[0.03]
          bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]
        "
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.85)_100%)]" />
    </div>
  );
}