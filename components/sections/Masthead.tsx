"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { nav, site } from "@/lib/site";
import { EASE_HEAVY, EASE_SETTLE } from "../motion/variants";
import { PilotButton } from "../motion/PilotButton";

/** Fixed masthead. Slides away going down the page and returns going up. */
export function Masthead() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [raised, setRaised] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > previous);
    setRaised(y > 24);
  });

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 bg-paper transition-[border-color] duration-500 ${raised ? "rule-b" : "border-b border-transparent"}`}
      initial={{ y: "-100%" }}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.8, ease: hidden ? EASE_HEAVY : EASE_SETTLE }}
    >
      <div className="sheet items-center py-3">
        <a href="#top" className="col-span-5 flex items-baseline gap-3 md:col-span-3">
          <span className="display text-[1.35rem] !leading-none">Cortexa</span>
          <span className="accent hidden text-[1.05rem] text-ink/60 sm:inline">edge analytics</span>
        </a>

        <nav aria-label="Sections" className="col-span-6 hidden items-center gap-7 md:flex">
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} className="label group relative py-1 text-ink/70 transition-colors duration-300 hover:text-ink">
              <span className="mr-1.5 text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
              <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-ink transition-transform duration-500 ease-heavy group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="col-span-7 flex justify-end md:col-span-3">
          <PilotButton href={site.pilotHref} label="Book a pilot" />
        </div>
      </div>
    </motion.header>
  );
}
