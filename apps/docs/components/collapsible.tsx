"use client";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { ReactNode } from "react";
interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapsible({ title, children, defaultOpen = false, className = "" }: CollapsibleProps) {
  return (
    <Accordions orientation="horizontal" type="single">
      <Accordion title={title ?? "Placeholder"}>{children}</Accordion>
    </Accordions>
  );
}
