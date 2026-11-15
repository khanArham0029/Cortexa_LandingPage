"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { principles } from "@/lib/content";
import { Parallax } from "../motion/Parallax";
import { RevealLines } from "../motion/RevealLines";
import { fadeUp, inView, ruleDraw, stagger } from "../motion/variants";

const STATEMENT =
  "Every store has cameras. Almost none of them have a number. Cortexa turns the first into the second, and refuses to turn the store into a surveillance system on the way.".split(
    " ",
  );
const EMPHASIS = new Set(["number.", "refuses"]);

function Word({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 2.5 / total], [0.13, 1]);
  return (
    <motion.span style={{ opacity }} className={EMPHASIS.has(word) ? "accent text-[1.12em] !leading-none" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

export function Principles() {
  const statement = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: statement, offset: ["start 0.85", "end 0.45"] });

  return (
    <section id="index" className="relative pt-28 md:pt-44">
      {/* Statement: the words ink in as the reader scrolls through them. */}
      <div className="sheet">
        <p className="label col-span-12 mb-8 text-ink/60 md:col-span-2 md:mb-0 md:pt-3">§ 01 — Position</p>
        <p
          ref={statement}
          className="col-span-12 text-[clamp(1.9rem,4.7vw,5.25rem)] leading-[1.02] font-semibold tracking-[-0.045em] md:col-span-10"
        >
          {STATEMENT.map((word, i) => (
            <Word key={i} word={word} index={i} total={STATEMENT.length} progress={scrollYProgress} />
          ))}
        </p>
      </div>

      {/* The four rules, set as a ruled index rather than cards. */}
      <div className="sheet mt-28 md:mt-48">
        <RevealLines
          as="h2"
          className="display col-span-12 text-[clamp(2.4rem,8.6vw,10.5rem)] whitespace-nowrap"
          lines={["Four rules.", "No exceptions."]}
          lineClassName={(i) => (i === 1 ? "md:pl-[1.15em]" : "")}
        />
        <Parallax travel={-50} className="col-span-12 mt-8 md:col-span-4 md:col-start-9 md:mt-10">
          <p className="accent text-[1.45rem] text-ink/80 md:text-[1.6rem]">
            They are enforced in code review and in tests, which is the only place a principle has ever been enforced.
          </p>
        </Parallax>
      </div>

      <motion.ol className="mt-14 md:mt-20" variants={stagger(0.12)} initial="hidden" whileInView="shown" viewport={inView}>
        {principles.map((rule) => (
          <motion.li key={rule.no} className="group relative" variants={stagger(0.08)}>
            <motion.span aria-hidden className="absolute inset-x-[var(--gutter)] top-0 block h-px origin-left bg-ink" variants={ruleDraw} />
            {/* Hover floods the row from its bottom edge. */}
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-heavy group-hover:scale-y-100"
            />
            <div className="sheet relative items-baseline py-8 transition-colors duration-500 group-hover:text-paper md:py-11">
              <motion.span className="data col-span-2 text-sm text-ink/50 transition-colors duration-500 group-hover:text-signal md:col-span-1" variants={fadeUp}>
                {rule.no}
              </motion.span>
              <motion.h3
                className="display-tight col-span-10 text-[clamp(1.9rem,4.4vw,4.6rem)] transition-transform duration-700 ease-heavy group-hover:translate-x-[0.35em] md:col-span-5"
                variants={fadeUp}
              >
                {rule.title}
              </motion.h3>
              <motion.p className="col-span-10 col-start-3 mt-5 max-w-[46ch] text-[0.98rem] leading-relaxed opacity-80 md:col-span-4 md:col-start-7 md:mt-0" variants={fadeUp}>
                {rule.body}
              </motion.p>
              <motion.span className="label col-span-10 col-start-3 mt-5 text-signal md:col-span-2 md:col-start-11 md:mt-0 md:text-right" variants={fadeUp}>
                {rule.aside}
              </motion.span>
            </div>
          </motion.li>
        ))}
        <span aria-hidden className="mx-[var(--gutter)] block h-px bg-ink" />
      </motion.ol>
    </section>
  );
}
