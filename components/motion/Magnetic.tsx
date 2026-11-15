"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { SPRING_MAGNET } from "./variants";

type Props = {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer offset the element travels. */
  strength?: number;
  /** The inner content travels further than the shell, for depth. */
  innerStrength?: number;
};

/**
 * Magnetic hover. The shell leans toward the pointer on a damped spring and
 * the label inside leans further, so the button feels like it has weight
 * rather than following the cursor one to one.
 */
export function Magnetic({ children, className, strength = 0.32, innerStrength = 0.18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_MAGNET);
  const sy = useSpring(y, SPRING_MAGNET);
  const ix = useTransform(sx, (v) => v * (innerStrength / strength));
  const iy = useTransform(sy, (v) => v * (innerStrength / strength));

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    x.set((event.clientX - (box.left + box.width / 2)) * strength);
    y.set((event.clientY - (box.top + box.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div style={{ x: ix, y: iy }}>{children}</motion.div>
    </motion.div>
  );
}
