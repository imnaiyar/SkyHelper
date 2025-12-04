import { ReactNode } from "react";
import Collapsible from "./collapsible";

export function Card({
  className = "",
  children,
  height = 200,
  width = 200,
}: {
  className?: string;
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <div
      className={"rounded-lg p-2 transition-shadow items-center hover:shadow-md flex justify-center" + ` ${className}`}
      style={{
        backgroundColor: "var(--color-fd-surface, var(--color-fd-background))",
        border: "1px solid var(--color-fd-border, rgba(0,0,0,0.06))",
        height,
        width,
      }}
    >
      {children}
    </div>
  );
}
