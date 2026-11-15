"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Honours the operating system's reduced-motion setting for every animation. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
