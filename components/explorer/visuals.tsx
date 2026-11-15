"use client";

import { motion } from "motion/react";
import type { FeatureVisual } from "@/lib/content";
import {
  HEAT_COLS,
  HEAT_ROWS,
  dwellBySection,
  formatDwell,
  heatGrid,
  hourlyEntries,
  hourlyStart,
  queueByMinute,
  queueThreshold,
} from "@/lib/samples";
import { EASE_HEAVY, EASE_SETTLE } from "../motion/variants";

/**
 * One drawn figure per feature. These are charts, not icons: each is the
 * shape of the data the feature actually produces. They animate once, when
 * scrolled into view, and every mark has weight on the way in.
 */

const view = { once: true, margin: "0px 0px -20% 0px" } as const;

function Footfall() {
  const max = Math.max(...hourlyEntries);
  const peak = hourlyEntries.indexOf(max as (typeof hourlyEntries)[number]);
  return (
    <div className="flex h-full flex-col justify-end">
      <div className="flex h-[78%] items-end gap-[1.2%]">
        {hourlyEntries.map((value, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
            {i === peak && (
              <motion.span
                className="data absolute inset-x-0 text-center text-[clamp(0.7rem,1.1vw,1rem)] text-signal"
                style={{ bottom: `calc(${(value / max) * 100}% + 0.5rem)` }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={view}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                {value}
              </motion.span>
            )}
            <motion.div
              className={`origin-bottom ${i === peak ? "bg-signal" : "bg-paper"}`}
              style={{ height: `${(value / max) * 100}%` }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={view}
              transition={{ duration: 1.1, delay: 0.15 + i * 0.055, ease: EASE_HEAVY }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-[1.2%] border-t border-paper/30 pt-2">
        {hourlyEntries.map((_, i) => (
          <span key={i} className="data flex-1 text-center text-[0.6rem] text-paper/50 md:text-[0.7rem]">
            {String(hourlyStart + i).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

function Dwell() {
  const max = Math.max(...dwellBySection.map((s) => s.median));
  return (
    <div className="flex flex-col gap-[clamp(0.6rem,1.6vw,1.4rem)]">
      {dwellBySection.map((section, i) => (
        <div key={section.name} className="grid grid-cols-[minmax(6.5rem,24%)_1fr_auto] items-center gap-x-4">
          <span className="label truncate text-ink/70">{section.name}</span>
          <div className="relative h-[clamp(1.1rem,2.6vw,2.4rem)]">
            <motion.div
              className={`absolute inset-y-0 left-0 origin-left ${i === 0 ? "bg-signal" : "bg-ink"}`}
              style={{ width: `${(section.median / max) * 100}%` }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={view}
              transition={{ duration: 1.25, delay: 0.1 + i * 0.1, ease: EASE_HEAVY }}
            />
            {/* Engaged-visit share, as a notch on the bar's own scale. */}
            <span
              aria-hidden
              className="absolute -inset-y-1 w-px bg-ink/40"
              style={{ left: `${section.engaged * 100}%` }}
            />
          </div>
          <span className="data w-[4.5rem] text-right text-[0.8rem] md:text-[0.95rem]">{formatDwell(section.median)}</span>
        </div>
      ))}
      <p className="label mt-1 text-ink/45">Bar: median dwell — notch: engaged-visit share</p>
    </div>
  );
}

function Queue() {
  const W = 600;
  const H = 300;
  const max = 9;
  const stepX = W / queueByMinute.length;
  const y = (v: number) => H - (v / max) * H;
  let d = `M 0 ${y(queueByMinute[0])}`;
  queueByMinute.forEach((v, i) => {
    d += ` L ${i * stepX} ${y(v)} L ${(i + 1) * stepX} ${y(v)}`;
  });
  const breach = queueByMinute.findIndex((v) => v > queueThreshold);
  const alertAt = breach + 3;

  return (
    <div className="relative h-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
        {[0, 3, 6, 9].map((v) => (
          <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} stroke="#1a1a1a" strokeOpacity="0.18" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2={W} y1={y(queueThreshold)} y2={y(queueThreshold)} stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
        <motion.rect
          x={breach * stepX}
          y={0}
          width={(alertAt - breach) * stepX}
          height={H}
          fill="#1a1a1a"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.14 }}
          viewport={view}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="4"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={view}
          transition={{ duration: 2.2, ease: EASE_HEAVY }}
        />
        <motion.line
          x1={alertAt * stepX}
          x2={alertAt * stepX}
          y1={0}
          y2={H}
          stroke="#f4f4f0"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={view}
          transition={{ delay: 1.7, duration: 0.7, ease: EASE_SETTLE }}
        />
      </svg>
      <span className="label absolute right-0 text-ink" style={{ top: `calc(${(1 - queueThreshold / max) * 100}% - 1.3rem)` }}>
        threshold {queueThreshold}
      </span>
      <motion.span
        className="label absolute top-0 bg-paper px-2 py-1 text-ink"
        style={{ left: `calc(${(alertAt / queueByMinute.length) * 100}% + 0.5rem)` }}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={view}
        transition={{ delay: 2.1, duration: 0.7, ease: EASE_SETTLE }}
      >
        over 5 for 3 min → alert sent
      </motion.span>
    </div>
  );
}

function Heatmap() {
  const cells = heatGrid();
  return (
    <div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${HEAT_COLS}, minmax(0, 1fr))` }}>
        {cells.map((value, i) => {
          const col = i % HEAT_COLS;
          const row = Math.floor(i / HEAT_COLS);
          return (
            <motion.div
              key={i}
              className="aspect-square bg-signal"
              initial={{ opacity: 0.04, scale: 0.4 }}
              whileInView={{ opacity: 0.06 + value * 0.94, scale: 1 }}
              viewport={view}
              transition={{ duration: 0.9, delay: (col + row) * 0.035, ease: EASE_SETTLE }}
            />
          );
        })}
      </div>
      <div className="label mt-4 flex justify-between text-paper/50">
        <span>
          {HEAT_COLS} × {HEAT_ROWS} cells
        </span>
        <span>presence seconds / hour</span>
      </div>
    </div>
  );
}

function Alerts() {
  const rule = [
    ["rule", "queue_over_length"],
    ["when", "queue.length > 5 for 3 min"],
    ["and", "zone.type = queue"],
    ["cooldown", "15 min"],
    ["escalate", "2nd breach → owner"],
    ["channel", "whatsapp"],
  ] as const;
  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr] md:gap-10">
      <dl className="data text-[0.74rem] md:text-[0.86rem]">
        {rule.map(([key, value], i) => (
          <motion.div
            key={key}
            className="flex gap-4 border-t border-ink/20 py-2 last:border-b"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={view}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE_SETTLE }}
          >
            <dt className="w-[5.5rem] shrink-0 text-ink/50">{key}</dt>
            <dd>{value}</dd>
          </motion.div>
        ))}
      </dl>
      <motion.div
        className="relative bg-ink p-5 text-paper md:p-7"
        initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={view}
        transition={{ duration: 1.2, delay: 0.7, ease: EASE_HEAVY }}
      >
        <span aria-hidden className="absolute -top-2 -left-2 block size-4 bg-signal" />
        <p className="label flex justify-between text-paper/55">
          <span>Message · delivered</span>
          <span>14:32</span>
        </p>
        <p className="mt-4 text-[1.05rem] leading-snug font-semibold tracking-[-0.02em] md:text-[1.35rem]">
          Counter queue has been over 5 people for 3 minutes. Counter is unattended.
        </p>
        <p className="accent mt-4 text-[1.05rem] text-paper/70">Next message no sooner than 14:47.</p>
      </motion.div>
    </div>
  );
}

/** A figure the weekly insight quoted and the database confirmed. */
function Checked({ children }: { children: string }) {
  return <span className="data border-b-2 border-signal text-[0.82em] text-paper">{children}</span>;
}

function Insight() {
  return (
    <div>
      <motion.p
        className="font-serif text-[clamp(1.25rem,2.5vw,2.5rem)] leading-[1.18] tracking-[-0.01em] text-paper/90"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={view}
        transition={{ duration: 1.2, ease: EASE_SETTLE }}
      >
        Saturday carried the week: <Checked>1,284</Checked> entries, peaking at <Checked>18:00</Checked>. Median dwell
        at the denim wall rose to <Checked>3m 41s</Checked>. The sale rail stayed cold for the{" "}
        <Checked>4th</Checked> day running; nobody stops there. Move it or stop paying for the floor.
      </motion.p>
      <motion.p
        className="label mt-6 flex flex-wrap gap-x-6 gap-y-1 text-paper/55"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={view}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <span>
          <span className="text-signal">4 / 4</span> quoted figures match the rollups
        </span>
        <span>Source: aggregates only</span>
      </motion.p>
    </div>
  );
}

const figures: Record<FeatureVisual, () => React.JSX.Element> = {
  footfall: Footfall,
  dwell: Dwell,
  queue: Queue,
  heatmap: Heatmap,
  alerts: Alerts,
  insight: Insight,
};

export function FeatureFigure({ kind }: { kind: FeatureVisual }) {
  const Figure = figures[kind];
  return <Figure />;
}
