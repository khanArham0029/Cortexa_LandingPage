import type { Transition, Variants } from "motion/react";

/**
 * The motion vocabulary for the whole site. Nothing bounces: springs are
 * critically damped or heavier, and tweens use two curves only.
 */

/** Slow in, slow out. For things that slide a long way. */
export const EASE_HEAVY = [0.76, 0, 0.24, 1] as const;
/** Fast out of the gate, long settle. For things that arrive. */
export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;

/** Mass well above default and damping past critical: follows, never wobbles. */
export const SPRING_HEAVY = { type: "spring", stiffness: 110, damping: 26, mass: 1.6 } as const;
export const SPRING_MAGNET = { stiffness: 140, damping: 18, mass: 0.9 } as const;
export const SPRING_SCROLL = { stiffness: 90, damping: 30, mass: 1.2, restDelta: 0.0005 } as const;

export const settle = (duration = 1.1, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_SETTLE,
});

/** Parent that staggers its children. */
export const stagger = (each = 0.085, delayChildren = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: each, delayChildren } },
});

/** A line of type rising out of a hard mask. */
export const lineRise: Variants = {
  hidden: { y: "112%", rotate: 2.5 },
  shown: { y: "0%", rotate: 0, transition: { duration: 1.25, ease: EASE_SETTLE } },
};

/** Small copy: short travel, opacity only at the very start. */
export const fadeUp: Variants = {
  hidden: { y: 22, opacity: 0 },
  shown: { y: 0, opacity: 1, transition: { duration: 0.95, ease: EASE_SETTLE } },
};

/** Hairline rules draw from the left. */
export const ruleDraw: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 1.4, ease: EASE_HEAVY } },
};

/** A block wiped open from its bottom edge. */
export const wipeUp: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  shown: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease: EASE_HEAVY } },
};

/** Default viewport trigger: fire once, slightly before the element is centred. */
export const inView = { once: true, margin: "0px 0px -12% 0px" } as const;
