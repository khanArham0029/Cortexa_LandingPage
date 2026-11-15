"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import { marqueeWords } from "@/lib/content";

const BASE_SPEED = 2.2; // percent of one track per second

function wrap(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/**
 * Typographic marquee driven by the scroll wheel. It idles slowly, speeds
 * up with scroll velocity, reverses when the page reverses, and leans into
 * the direction of travel. All of it through one heavily damped spring.
 */
export function Marquee() {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const direction = useRef(-1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 60, stiffness: 260, mass: 1.4 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-6, 0, 6], { clamp: false });
  const skewX = useTransform(velocity, [-2500, 0, 2500], [9, 0, -9]);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < -0.05) direction.current = 1;
    else if (b > 0.05) direction.current = -1;
    base.set(base.get() + direction.current * BASE_SPEED * (1 + Math.abs(b)) * (delta / 1000));
  });

  const track = [...marqueeWords, ...marqueeWords];

  return (
    <section aria-label="What Cortexa measures" className="overflow-hidden border-y border-ink bg-signal py-5 md:py-7">
      <motion.div className="flex w-max will-change-transform" style={{ x, skewX: reduce ? 0 : skewX }}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {track.map((word, i) => (
              <li key={`${word}-${i}`} className="flex items-center">
                <span
                  className={`display px-[0.22em] text-[clamp(3rem,9.5vw,10rem)] whitespace-nowrap ${i % 2 === 1 ? "outline-type" : "text-ink"}`}
                >
                  {word}
                </span>
                <span aria-hidden className="mx-[1.5vw] block size-[clamp(0.9rem,2.2vw,2.2rem)] shrink-0 bg-ink" />
              </li>
            ))}
          </ul>
        ))}
      </motion.div>
    </section>
  );
}
