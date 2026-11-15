"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { inView, lineRise, stagger } from "./variants";

type Props = {
  /** Each entry is one masked line. */
  lines: readonly ReactNode[];
  className?: string;
  lineClassName?: string | ((index: number) => string);
  /** Animate on mount instead of when scrolled into view. */
  onLoad?: boolean;
  delay?: number;
  each?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
};

/**
 * Staggered line reveal. Every line sits in its own overflow mask and rises
 * from below it, so the type appears to be pushed up through a slot.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  onLoad = false,
  delay = 0,
  each = 0.09,
  as = "div",
}: Props) {
  const Tag = motion[as];
  const trigger = onLoad ? { animate: "shown" } : { whileInView: "shown", viewport: inView };

  return (
    <Tag className={className} variants={stagger(each, delay)} initial="hidden" {...trigger}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className={`block origin-bottom-left will-change-transform ${
              typeof lineClassName === "function" ? lineClassName(i) : (lineClassName ?? "")
            }`}
            variants={lineRise}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
