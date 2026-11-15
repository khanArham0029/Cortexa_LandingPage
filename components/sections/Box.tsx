"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { pipeline, specs } from "@/lib/content";
import { Parallax } from "../motion/Parallax";
import { RevealLines } from "../motion/RevealLines";
import { SPRING_SCROLL, fadeUp, inView, stagger } from "../motion/variants";

/** The hardware section, set as a datasheet on ink. */
export function Box() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.7", "end 0.6"] });
  const progress = useSpring(scrollYProgress, SPRING_SCROLL);

  return (
    <section id="box" className="relative mt-28 overflow-clip bg-ink pt-24 pb-28 text-paper md:mt-48 md:pt-36 md:pb-40">
      <div className="sheet items-end">
        <p className="label col-span-12 mb-6 text-paper/55">§ 03 — Hardware</p>
        <RevealLines
          as="h2"
          className="display col-span-12 text-mega md:col-span-9"
          lines={["The", "box."]}
          lineClassName={(i) => (i === 1 ? "pl-[0.55em] text-signal" : "")}
        />
        <Parallax travel={-70} className="col-span-12 mt-8 md:col-span-3 md:mt-0 md:pb-[2.5vw]">
          <p className="accent text-[1.5rem] text-paper/85 md:text-[1.7rem]">
            Unattended by design. If a part cannot recover it exits loudly and the supervisor restarts it. It does not
            retry in silence and it does not phone anyone&rsquo;s footage home.
          </p>
        </Parallax>
      </div>

      <div className="sheet mt-20 md:mt-32">
        {/* Pipeline: six stages down a rule that fills as you read. */}
        <div className="col-span-12 md:col-span-7">
          <p className="label mb-6 text-paper/55">Pipeline — one per camera, each in its own process</p>
          <div className="grid grid-cols-[2px_1fr] gap-x-5 md:gap-x-8">
            <div className="relative bg-paper/15">
              <motion.div className="absolute inset-0 origin-top bg-signal" style={{ scaleY: progress }} />
            </div>
            <motion.ol ref={list} variants={stagger(0.1)} initial="hidden" whileInView="shown" viewport={inView}>
              {pipeline.map((stage) => (
                <motion.li
                  key={stage.no}
                  className="grid grid-cols-[2.2rem_1fr] items-baseline gap-x-3 border-t rule-inverse py-6 last:border-b md:grid-cols-[3rem_1.1fr_1fr] md:gap-x-6 md:py-8"
                  variants={fadeUp}
                >
                  <span className="data text-sm text-signal">{stage.no}</span>
                  <h3 className="display-tight text-[clamp(1.6rem,3.1vw,3.2rem)]">{stage.name}</h3>
                  <div className="col-start-2 mt-3 md:col-start-3 md:mt-0">
                    <p className="text-[0.95rem] leading-relaxed text-paper/75">{stage.detail}</p>
                    <p className="label mt-2 text-paper/40">{stage.home}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>

        {/* Datasheet */}
        <div className="col-span-12 mt-20 md:col-span-4 md:col-start-9 md:mt-0">
          <div className="md:sticky md:top-28">
            <p className="label mb-6 text-paper/55">Datasheet</p>
            <motion.dl variants={stagger(0.045)} initial="hidden" whileInView="shown" viewport={inView}>
              {specs.map(([key, value]) => (
                <motion.div
                  key={key}
                  className="grid grid-cols-[38%_1fr] gap-x-4 border-t rule-inverse py-3 last:border-b"
                  variants={fadeUp}
                >
                  <dt className="label pt-0.5 text-paper/50">{key}</dt>
                  <dd className={`data text-[0.82rem] leading-snug ${value === "None" ? "text-signal" : "text-paper/90"}`}>
                    {value}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
            <p className="accent mt-8 text-[1.3rem] text-paper/70">
              The store&rsquo;s internet will drop. The count will not. Every event is written to disk before it is
              sent, and a resend changes nothing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
