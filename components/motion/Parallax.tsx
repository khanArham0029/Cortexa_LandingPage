"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { SPRING_SCROLL } from "./variants";

type Props = {
  children: ReactNode;
  className?: string;
  /** Total travel in pixels across the element's pass through the viewport. Negative moves against scroll. */
  travel?: number;
};

/** Scroll-linked drift, smoothed through a heavy spring so it lags the wheel. */
export function Parallax({ children, className, travel = -80 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [-travel / 2, travel / 2]);
  const y = useSpring(raw, SPRING_SCROLL);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
