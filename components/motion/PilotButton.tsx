"use client";

import { motion } from "motion/react";
import { Magnetic } from "./Magnetic";
import { EASE_HEAVY } from "./variants";

type Props = {
  href: string;
  label: string;
  size?: "sm" | "lg";
  /** Colours for the resting state; hover always floods with the opposite. */
  tone?: "ink" | "signal" | "paper";
};

const tones = {
  ink: { rest: "bg-ink text-paper", flood: "bg-signal", hover: "group-hover:text-ink" },
  signal: { rest: "bg-signal text-ink", flood: "bg-ink", hover: "group-hover:text-paper" },
  paper: { rest: "bg-paper text-ink", flood: "bg-signal", hover: "group-hover:text-ink" },
} as const;

/**
 * The one call to action. Magnetic shell; on hover a slab of the opposite
 * colour rises from the bottom edge and the label rolls over to a duplicate.
 */
export function PilotButton({ href, label, size = "sm", tone = "ink" }: Props) {
  const t = tones[tone];
  const pad = size === "lg" ? "px-9 py-6 text-[1.05rem] md:px-12 md:py-8 md:text-xl" : "px-5 py-3 text-[0.8rem]";

  return (
    <Magnetic>
      <motion.a
        href={href}
        className={`group relative inline-flex items-center gap-4 overflow-hidden rounded-full ${t.rest} ${pad} font-display font-extrabold uppercase tracking-[-0.01em]`}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.35, ease: EASE_HEAVY }}
      >
        <span
          aria-hidden
          className={`absolute inset-0 origin-bottom translate-y-[101%] rounded-[50%_50%_0_0] ${t.flood} transition-[translate,border-radius] duration-700 ease-heavy group-hover:translate-y-0 group-hover:rounded-none`}
        />
        <span className={`relative block overflow-hidden transition-colors duration-500 ${t.hover}`}>
          <span className="block transition-transform duration-700 ease-heavy group-hover:-translate-y-full">
            {label}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block translate-y-full transition-transform duration-700 ease-heavy group-hover:translate-y-0"
          >
            {label}
          </span>
        </span>
        <span
          aria-hidden
          className={`relative block transition-[rotate,color] duration-700 ease-heavy group-hover:rotate-45 ${t.hover}`}
        >
          ↗
        </span>
      </motion.a>
    </Magnetic>
  );
}
