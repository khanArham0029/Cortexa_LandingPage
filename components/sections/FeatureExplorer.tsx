"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { features, type Feature } from "@/lib/content";
import { FeatureFigure } from "../explorer/visuals";
import { RevealLines } from "../motion/RevealLines";
import { EASE_HEAVY, EASE_SETTLE, SPRING_SCROLL, fadeUp, inView, stagger } from "../motion/variants";

/** Figures made of text size themselves; charts fill a fixed stage. */
const FLUID = new Set<Feature["key"]>(["alerts", "insight", "heatmap"]);

const tones = {
  ink: "bg-ink text-paper",
  signal: "bg-signal text-ink",
  paper: "bg-paper-deep text-ink border border-ink",
} as const;

function Block({ feature, index, onActive }: { feature: Feature; index: number; onActive: (index: number) => void }) {
  const ref = useRef<HTMLElement>(null);

  // A block is "active" while it straddles the middle band of the viewport.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onActive(index);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [index, onActive]);

  const muted = feature.tone === "ink" ? "text-paper/55" : "text-ink/60";

  return (
    <article ref={ref} id={`report-${feature.key}`} className="scroll-mt-24">
      <motion.div
        className={`${tones[feature.tone]} relative flex flex-col p-5 md:p-8`}
        initial={{ clipPath: "inset(12% 0% 0% 0%)", y: 60 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 1.3, ease: EASE_HEAVY }}
      >
        <div className={`label flex items-start justify-between gap-4 ${muted}`}>
          <span>
            {feature.no} / {String(features.length).padStart(2, "0")}
          </span>
          <span className="text-right">
            event: {feature.event}
            <br />
            sample data
          </span>
        </div>
        <div
          className={`my-7 flex flex-col justify-center md:my-10 ${
            FLUID.has(feature.key) ? "min-h-[clamp(15rem,46vh,28rem)]" : "h-[clamp(15rem,46vh,28rem)]"
          }`}
        >
          <FeatureFigure kind={feature.key} />
        </div>
        <h3 className="display-tight text-[clamp(1.7rem,3.5vw,3.6rem)]">{feature.name}</h3>
      </motion.div>

      <motion.div
        className="grid gap-x-[var(--gutter)] gap-y-6 pt-6 md:grid-cols-8 md:pt-8"
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="shown"
        viewport={inView}
      >
        <motion.p className="accent text-[1.6rem] md:col-span-8 md:text-[clamp(1.7rem,2.5vw,2.6rem)]" variants={fadeUp}>
          {feature.claim}
        </motion.p>
        <motion.p className="max-w-[48ch] text-[0.98rem] leading-relaxed text-ink/80 md:col-span-4" variants={fadeUp}>
          {feature.body}
        </motion.p>
        <motion.ul className="md:col-span-4" variants={fadeUp}>
          {feature.facts.map((fact) => (
            <li key={fact} className="label flex gap-3 border-t border-ink/20 py-2.5 text-ink/75 last:border-b">
              <span aria-hidden className="text-signal">
                ■
              </span>
              {fact}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </article>
  );
}

/**
 * Sticky-scroll explorer. The title, a running index and a progress rule pin
 * to the left column for the whole section while the feature blocks travel
 * past on the right. On small screens it collapses to a plain stack.
 */
export function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const column = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: column, offset: ["start 0.5", "end 0.5"] });
  const progress = useSpring(scrollYProgress, SPRING_SCROLL);
  const current = features[active]!;

  return (
    <section id="reports" className="sheet relative mt-28 md:mt-48">
      <div className="col-span-12 mb-10 h-px bg-ink md:mb-0" />

      {/* Pinned column */}
      <div className="col-span-12 md:col-span-4">
        <div className="flex flex-col md:sticky md:top-0 md:h-svh md:justify-between md:pt-24 md:pb-10">
          <div>
            <p className="label mb-6 text-ink/60">§ 02 — Reports</p>
            <RevealLines
              as="h2"
              className="display text-[clamp(3.5rem,6.5vw,7.75rem)] whitespace-nowrap"
              lines={["What", "the box", "reports."]}
              lineClassName={(i) => (i === 1 ? "pl-[0.7em]" : "")}
            />
            <p className="accent mt-6 max-w-[22ch] text-[1.4rem] text-ink/75 md:mt-7 md:[@media(max-height:820px)]:hidden">
              Six kinds of number. Each one is an event type with a schema.
            </p>
          </div>

          <div className="hidden md:block">
            <div className="flex items-end gap-4">
              <div className="data h-[1em] overflow-hidden text-[clamp(3.5rem,5.4vw,6.5rem)] leading-none font-medium tracking-[-0.06em]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={current.no}
                    className="block"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: EASE_HEAVY }}
                  >
                    {current.no}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="label pb-3 text-ink/50">/ {String(features.length).padStart(2, "0")}</span>
            </div>

            <div className="mt-5 grid grid-cols-[2px_1fr] gap-x-5">
              <div className="relative bg-ink/15">
                <motion.div className="absolute inset-0 origin-top bg-signal" style={{ scaleY: progress }} />
              </div>
              <ol>
                {features.map((feature, i) => (
                  <li key={feature.key}>
                    <a
                      href={`#report-${feature.key}`}
                      className="group flex items-baseline gap-3 py-1"
                      aria-current={i === active ? "true" : undefined}
                    >
                      <span className={`label transition-colors duration-500 ${i === active ? "text-signal" : "text-ink/35"}`}>
                        {feature.no}
                      </span>
                      <motion.span
                        className="display-tight text-[1.15rem]"
                        animate={{ x: i === active ? 10 : 0, opacity: i === active ? 1 : 0.38 }}
                        transition={{ duration: 0.7, ease: EASE_SETTLE }}
                      >
                        {feature.name}
                      </motion.span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling column */}
      <div ref={column} className="col-span-12 mt-12 space-y-20 md:col-span-8 md:mt-0 md:space-y-32 md:py-24">
        {features.map((feature, i) => (
          <Block key={feature.key} feature={feature} index={i} onActive={setActive} />
        ))}
      </div>
    </section>
  );
}
