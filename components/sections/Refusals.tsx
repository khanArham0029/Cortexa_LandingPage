"use client";

import { motion } from "motion/react";
import { refusals } from "@/lib/content";
import { EASE_HEAVY, EASE_SETTLE, inView, lineRise } from "../motion/variants";

/** The features that will never ship, each struck through as it arrives. */
export function Refusals() {
  return (
    <section id="refusals" className="pt-28 pb-28 md:pt-44 md:pb-44">
      <div className="sheet">
        <p className="label col-span-12 text-ink/60 md:col-span-2">§ 04 — Refusals</p>
        <p className="accent col-span-12 mt-4 max-w-[26ch] text-[1.9rem] md:col-span-6 md:mt-0 md:text-[clamp(1.9rem,2.9vw,3rem)]">
          The roadmap has a second column. These are the things on it that will never ship.
        </p>
      </div>

      <ul className="mt-14 md:mt-24">
        {refusals.map((item, i) => (
          <motion.li
            key={item.text}
            className="sheet items-baseline border-t border-ink/20 py-4 last:border-b md:py-5"
            initial="hidden"
            whileInView="shown"
            viewport={inView}
            transition={{ staggerChildren: 0.18 }}
          >
            <span className="data col-span-2 hidden text-sm text-ink/40 md:col-span-1 md:block">×{i + 1}</span>
            <div className="col-span-12 md:col-span-9">
              <span className="line-mask">
                <motion.span
                  className="display relative inline-block text-[clamp(2.1rem,6.9vw,8.25rem)] whitespace-nowrap"
                  variants={lineRise}
                >
                  {item.text}
                  <motion.span
                    aria-hidden
                    className="absolute -inset-x-[0.06em] top-[44%] block h-[0.12em] origin-left bg-signal"
                    variants={{
                      hidden: { scaleX: 0 },
                      shown: { scaleX: 1, transition: { duration: 1.1, delay: 0.55, ease: EASE_HEAVY } },
                    }}
                  />
                </motion.span>
              </span>
            </div>
            <motion.p
              className="accent col-span-12 mt-2 text-[1.2rem] text-ink/70 md:col-span-2 md:mt-0 md:text-right md:text-[1.25rem]"
              variants={{
                hidden: { opacity: 0, y: 14 },
                shown: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.9, ease: EASE_SETTLE } },
              }}
            >
              {item.note}
            </motion.p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
