"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/lib/site";
import { DoorSim } from "../hero/DoorSim";
import { PilotButton } from "../motion/PilotButton";
import { RevealLines } from "../motion/RevealLines";
import { EASE_HEAVY, SPRING_SCROLL, fadeUp, ruleDraw, stagger } from "../motion/variants";

const HEADLINE = "whitespace-nowrap text-[clamp(3.6rem,16.5vw,20.5rem)]";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, SPRING_SCROLL);

  // The two halves of the headline separate as the page moves: the first
  // drifts left and up, the second lags behind and slides right.
  const upperX = useTransform(progress, [0, 1], ["0%", "-7%"]);
  const lowerX = useTransform(progress, [0, 1], ["0%", "4%"]);
  const lowerY = useTransform(progress, [0, 1], [0, -36]);
  const panelY = useTransform(progress, [0, 1], [0, -70]);
  const drift = (style: Record<string, unknown>) => (reduce ? undefined : style);

  return (
    <section ref={ref} id="top" className="relative overflow-x-clip pt-[5.5rem] md:pt-28">
      {/* Dateline */}
      <motion.div className="sheet" variants={stagger(0.08, 0.15)} initial="hidden" animate="shown">
        <motion.div className="col-span-12 h-px origin-left bg-ink" variants={ruleDraw} />
        <motion.p className="label col-span-6 pt-3 text-ink/70 md:col-span-3" variants={fadeUp}>
          Retail video analytics
        </motion.p>
        <motion.p className="label col-span-3 hidden pt-3 text-ink/70 md:block" variants={fadeUp}>
          Edge box + multi-tenant cloud
        </motion.p>
        <motion.p className="label col-span-3 hidden pt-3 text-ink/70 md:block" variants={fadeUp}>
          Works on the cameras you own
        </motion.p>
        <motion.p className="label col-span-6 pt-3 text-right text-ink/70 md:col-span-3" variants={fadeUp}>
          Frames uploaded: <span className="text-signal">0</span>
        </motion.p>
      </motion.div>

      {/* Headline. Four lines, two alignments, one argument. */}
      <h1 className="sr-only">Count everyone. Know no one.</h1>
      <div aria-hidden className="relative z-10 mt-8 px-[var(--gutter)] md:mt-10">
        <motion.div style={drift({ x: upperX })}>
          <RevealLines
            onLoad
            delay={0.25}
            each={0.11}
            className={`display ${HEADLINE}`}
            lines={["Count", "Everyone."]}
          />
        </motion.div>

        <motion.div className="relative" style={drift({ x: lowerX, y: lowerY })}>
          <RevealLines
            onLoad
            delay={0.5}
            each={0.11}
            className={`display text-right ${HEADLINE}`}
            lineClassName={(i) => (i === 1 ? "text-signal" : "")}
            lines={["Know", "No one."]}
          />
          <motion.p
            className="accent absolute top-[0.12em] left-0 hidden max-w-[17ch] text-[clamp(1.4rem,2.6vw,3rem)] text-ink md:block"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.25, ease: EASE_HEAVY }}
          >
            (the cameras stay.
            <br />
            the footage does too.)
          </motion.p>
        </motion.div>
      </div>

      {/* Lede on the left, the live floor on the right, tucked under the headline. */}
      <div className="sheet relative mt-10 items-start pb-24 md:-mt-[1.1vw] md:pb-36">
        <motion.div
          className="col-span-12 md:col-span-4 md:pt-[7vw] lg:col-span-3"
          variants={stagger(0.1, 1.15)}
          initial="hidden"
          animate="shown"
        >
          <motion.p className="accent text-[1.7rem] md:text-[clamp(1.5rem,2.1vw,2.3rem)]" variants={fadeUp}>
            A box in the back room reads the cameras you already have and reports numbers.
          </motion.p>
          <motion.p className="mt-5 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink/75" variants={fadeUp}>
            Footfall, dwell, queue length and occupancy, once a minute, as plain events. No faces, no identities, no
            video in anybody&rsquo;s cloud. The dashboard, the alerts and the weekly report are built from counts and
            nothing else.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" variants={fadeUp}>
            <PilotButton href={site.pilotHref} label="Book a pilot" size="sm" tone="signal" />
            <a href="#reports" className="label group flex items-center gap-2 text-ink">
              <span className="border-b border-ink pb-0.5">See what it reports</span>
              <span className="transition-transform duration-500 ease-heavy group-hover:translate-y-1">↓</span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-span-12 mt-12 md:col-span-8 md:col-start-5 md:mt-0 lg:col-span-8 lg:col-start-5"
          style={drift({ y: panelY })}
        >
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.4, delay: 0.95, ease: EASE_HEAVY }}
          >
            <DoorSim />
          </motion.div>
          <p className="label mt-3 flex justify-between gap-4 text-ink/55">
            <span>Fig. 1 — One point, one line, one direction, once.</span>
            <span className="hidden text-right sm:inline">Click the floor.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
