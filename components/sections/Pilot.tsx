"use client";

import { site } from "@/lib/site";
import { Parallax } from "../motion/Parallax";
import { PilotButton } from "../motion/PilotButton";
import { RevealLines } from "../motion/RevealLines";

/** The only ask on the page. */
export function Pilot() {
  return (
    <section id="pilot" className="relative overflow-clip border-y border-ink bg-signal py-24 text-ink md:py-36">
      <div className="sheet items-end">
        <p className="label col-span-12 mb-8">§ 05 — Pilot</p>
        <RevealLines
          as="h2"
          className="display col-span-12 text-giant"
          lines={["One store.", "One box.", "Your cameras."]}
          lineClassName={(i) => (i === 1 ? "md:pl-[2.1em]" : i === 2 ? "md:pl-[0.7em]" : "")}
        />
      </div>
      <div className="sheet mt-14 items-end md:mt-20">
        <Parallax travel={-40} className="col-span-12 md:col-span-5 md:col-start-2">
          <p className="accent text-[1.7rem] md:text-[clamp(1.7rem,2.4vw,2.6rem)]">
            We install it, count by hand beside it, and show you the measured error per camera. Then you decide, with
            a number.
          </p>
        </Parallax>
        <div className="col-span-12 mt-10 flex md:col-span-5 md:col-start-8 md:mt-0 md:justify-end">
          <PilotButton href={site.pilotHref} label="Book a pilot" size="lg" tone="ink" />
        </div>
      </div>
    </section>
  );
}
