"use client";

import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";
interface Base {
  direction: Direction;
  size?: number;
  btn?: boolean;
}
type ExtraProps = {
  btn: true;
  onClick?: () => void;
  className?: string;
};

const paths: Record<
  Direction,
  {
    top: string;
    bottom: string;
  }
> = {
  up: {
    top: "M6 15L12 9",
    bottom: "M18 15L12 9",
  },
  down: {
    top: "M6 9L12 15",
    bottom: "M18 9L12 15",
  },
  left: {
    top: "M15 6L9 12",
    bottom: "M15 18L9 12",
  },
  right: {
    top: "M9 6L15 12",
    bottom: "M9 18L15 12",
  },
};

export default function ChevronMorph({ direction, btn = false, size = 24, onClick, className = "" }: ExtraProps & Base) {
  const rendered = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <motion.path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{
          d: paths[direction].top,
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
      />

      <motion.path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{
          d: paths[direction].bottom,
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </svg>
  );

  return btn ? (
    <button onClick={onClick} className={`flex h-10 w-10 items-center justify-center ${className}`}>
      {rendered}
    </button>
  ) : (
    rendered
  );
}
