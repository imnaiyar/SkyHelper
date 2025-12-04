"use client";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { ReactNode } from "react";
interface CollapsibleProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Collapsible({ title, children, className = "" }: CollapsibleProps) {
  return (
    <Accordions className={className} orientation="horizontal" type="single">
      <Accordion title={title ?? "Placeholder"}>{children}</Accordion>
    </Accordions>
  );
}
