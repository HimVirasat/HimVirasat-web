"use client";

import type { CSSProperties } from "react";

import { useReveal } from "@/hooks/use-reveal";

/**
 * Scroll-reveal wrapper. Children stay server-rendered; this only toggles
 * data attributes consumed by the reveal CSS in globals.css.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "section" | "li" | "span";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      data-reveal
      data-revealed={revealed}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
