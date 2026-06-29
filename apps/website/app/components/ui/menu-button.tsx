"use client";

import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClick: () => void;
};

/** Animated menu button that morphs between menu and cross icon */
export default function MenuButton({ open, onClick }: Props) {
  return (
    <button onClick={onClick} className="relative w-10 h-10 flex items-center justify-center text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Top */}
        <motion.path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            open
              ? {
                  d: "M6 18L18 6",
                }
              : {
                  d: "M4 7L20 7",
                }
          }
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

        {/* Middle */}
        <motion.path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            open
              ? {
                  opacity: 0,
                }
              : {
                  opacity: 1,
                }
          }
          d="M4 12L20 12"
          transition={{
            duration: 0.2,
          }}
        />

        {/* Bottom */}
        <motion.path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            open
              ? {
                  d: "M6 6L18 18",
                }
              : {
                  d: "M4 17L20 17",
                }
          }
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </svg>
    </button>
  );
}
