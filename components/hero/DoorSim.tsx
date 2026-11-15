"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  COUNTER,
  DOOR,
  LINE_Y,
  ZONES,
  createSim,
  formatMinute,
  occupancy,
  queueLength,
  spawn,
  step,
  zoneCount,
  type MinuteEvent,
  type Sim,
} from "@/lib/sim";
import { EASE_SETTLE } from "../motion/variants";

const PAPER = "#f4f4f0";
const SIGNAL = "#ff4d00";
const LOG_ROWS = 5;

type Stats = { entries: number; exits: number; occupancy: number; queue: number };

function readStats(sim: Sim): Stats {
  return {
    entries: sim.totals.entries,
    exits: sim.totals.exits,
    occupancy: occupancy(sim),
    queue: queueLength(sim),
  };
}

function draw(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  w: number,
  h: number,
  cursor: { x: number; y: number } | null,
  family: string,
) {
  const pad = Math.max(14, w * 0.035);
  const fw = w - pad * 2;
  const fh = h - pad * 2;
  const X = (x: number) => pad + x * fw;
  const Y = (y: number) => pad + y * fh;
  const mono = `500 ${Math.max(9, Math.min(11, w / 60))}px ${family}`;

  ctx.clearRect(0, 0, w, h);

  // Survey grid.
  ctx.fillStyle = "rgba(244,244,240,0.16)";
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 16; j++) {
      ctx.fillRect(X(i / 24) - 0.5, Y(j / 16) - 0.5, 1, 1);
    }
  }

  // Walls, with a gap where the door is.
  ctx.strokeStyle = "rgba(244,244,240,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(X(DOOR.left), Y(1));
  ctx.lineTo(X(0), Y(1));
  ctx.lineTo(X(0), Y(0));
  ctx.lineTo(X(1), Y(0));
  ctx.lineTo(X(1), Y(1));
  ctx.lineTo(X(DOOR.right), Y(1));
  ctx.stroke();

  // Counter.
  ctx.fillStyle = "rgba(244,244,240,0.12)";
  ctx.fillRect(X(COUNTER.x), Y(COUNTER.y), COUNTER.w * fw, COUNTER.h * fh);
  ctx.font = mono;
  ctx.fillStyle = "rgba(244,244,240,0.6)";
  ctx.fillText("COUNTER", X(COUNTER.x), Y(COUNTER.y) - 6);

  // Zones: dashed polygons with a live head count. No names of anyone, ever.
  for (const zone of ZONES) {
    ctx.beginPath();
    zone.polygon.forEach((p, i) => (i === 0 ? ctx.moveTo(X(p.x), Y(p.y)) : ctx.lineTo(X(p.x), Y(p.y))));
    ctx.closePath();
    ctx.fillStyle = "rgba(244,244,240,0.045)";
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(244,244,240,0.5)";
    ctx.stroke();
    ctx.setLineDash([]);
    const anchor = zone.polygon.reduce((a, b) => (b.y > a.y || (b.y === a.y && b.x < a.x) ? b : a));
    ctx.fillStyle = "rgba(244,244,240,0.72)";
    ctx.fillText(`${zone.label.toUpperCase()}  ${String(zoneCount(sim, zone)).padStart(2, "0")}`, X(anchor.x), Y(anchor.y) + 15);
  }

  // The counting line.
  ctx.strokeStyle = SIGNAL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(DOOR.left - 0.07), Y(LINE_Y));
  ctx.lineTo(X(DOOR.right + 0.07), Y(LINE_Y));
  ctx.stroke();
  ctx.fillStyle = SIGNAL;
  ctx.fillText("LINE 01  IN ↑", X(DOOR.right + 0.085), Y(LINE_Y) + 4);
  ctx.fillStyle = "rgba(244,244,240,0.5)";
  ctx.fillText("DOOR", X(DOOR.left) + 6, Y(1) - 7);

  // People: a point and four brackets. That is everything the logic sees.
  for (const person of sim.people) {
    const px = X(person.pos.x);
    const py = Y(person.pos.y);
    const flash = person.crossedAgo < 0.7;
    const s = flash ? 9 + (0.7 - person.crossedAgo) * 14 : 7;
    const c = 3;
    ctx.strokeStyle = flash ? SIGNAL : PAPER;
    ctx.lineWidth = flash ? 2 : 1;
    ctx.beginPath();
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ] as const) {
      ctx.moveTo(px + sx * s, py + sy * (s - c));
      ctx.lineTo(px + sx * s, py + sy * s);
      ctx.lineTo(px + sx * (s - c), py + sy * s);
    }
    ctx.stroke();
    ctx.fillStyle = flash ? SIGNAL : PAPER;
    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
  }

  // Crosshair with floor coordinates.
  if (cursor) {
    const nx = (cursor.x - pad) / fw;
    const ny = (cursor.y - pad) / fh;
    ctx.strokeStyle = "rgba(244,244,240,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursor.x, 0);
    ctx.lineTo(cursor.x, h);
    ctx.moveTo(0, cursor.y);
    ctx.lineTo(w, cursor.y);
    ctx.stroke();
    ctx.fillStyle = PAPER;
    const text = `x ${nx.toFixed(3)}  y ${ny.toFixed(3)}`;
    const tx = cursor.x + 10 + ctx.measureText(text).width > w ? cursor.x - 10 - ctx.measureText(text).width : cursor.x + 10;
    ctx.fillText(text, tx, cursor.y < 24 ? cursor.y + 18 : cursor.y - 8);
  }
}

function Counter({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  const text = String(value).padStart(3, "0");
  return (
    <div className="flex items-end justify-between gap-3 border-t rule-inverse py-3 lg:block lg:py-4">
      <div className="label text-paper/55">{label}</div>
      <div
        className={`data overflow-hidden text-[2rem] leading-none font-medium lg:mt-2 lg:text-[clamp(2.25rem,3.4vw,3.75rem)] ${accent ? "text-signal" : "text-paper"}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="block"
            initial={{ y: "70%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-70%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_SETTLE }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The hero's raw data view: a top-down floor with a counting line across the
 * door. It runs the same rule the edge box does and prints the per-minute
 * event that would be uploaded. Click the floor to send someone in.
 */
export function DoorSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const [stats, setStats] = useState<Stats>({ entries: 0, exits: 0, occupancy: 0, queue: 0 });
  const [log, setLog] = useState<MinuteEvent[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { sim, history } = createSim();
    simRef.current = sim;
    setLog(history.slice(-LOG_ROWS));
    setStats(readStats(sim));

    // Canvas cannot resolve CSS variables in a font shorthand, so read the computed stack.
    const family = getComputedStyle(canvas).fontFamily;
    let width = 0;
    let height = 0;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let visible = true;
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    watcher.observe(canvas);

    let last = performance.now();
    let shown = readStats(sim);
    let frame = requestAnimationFrame(function loop(now) {
      frame = requestAnimationFrame(loop);
      // Clamp so a background tab does not fast-forward the floor on return.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;

      const event = step(sim, dt);
      if (event) setLog((rows) => [...rows, event].slice(-LOG_ROWS));

      const next = readStats(sim);
      if (
        next.entries !== shown.entries ||
        next.exits !== shown.exits ||
        next.occupancy !== shown.occupancy ||
        next.queue !== shown.queue
      ) {
        shown = next;
        setStats(next);
      }
      draw(ctx, sim, width, height, cursorRef.current, family);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      watcher.disconnect();
    };
  }, []);

  function locate(event: PointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top, width: box.width };
  }

  function sendSomeoneIn(doorX?: number) {
    if (simRef.current) spawn(simRef.current, doorX);
  }

  return (
    <div className="bg-ink text-paper">
      <div className="flex items-center justify-between gap-4 border-b rule-inverse px-4 py-3 md:px-5">
        <span className="label text-paper/70">
          Cam 01 <span className="text-paper/35">/</span> Entrance <span className="hidden text-paper/35 sm:inline">/</span>{" "}
          <span className="hidden sm:inline">Floor projection</span>
        </span>
        <span className="label flex items-center gap-2 text-signal">
          <span className="inline-block size-2 bg-signal" style={{ animation: "blink 1.4s steps(1) infinite" }} />
          Simulated feed
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_13.5rem]">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="block aspect-[4/3] w-full cursor-crosshair font-mono touch-manipulation sm:aspect-[16/10]"
            aria-label="Simulated top-down floor. Anonymous points cross a counting line at the door and are counted as entries and exits."
            role="img"
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") cursorRef.current = locate(e);
            }}
            onPointerLeave={() => {
              cursorRef.current = null;
            }}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              sendSomeoneIn((e.clientX - box.left) / box.width);
            }}
          />
          <button
            type="button"
            onClick={() => sendSomeoneIn()}
            className="label absolute right-3 bottom-3 border border-paper/40 bg-ink px-3 py-2 text-paper transition-colors duration-300 hover:border-signal hover:bg-signal hover:text-ink md:right-4 md:bottom-4"
          >
            + Send someone in
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-5 border-t rule-inverse px-4 pb-1 md:px-5 lg:block lg:border-t-0 lg:border-l lg:pb-0 [&>*:first-child]:border-t-0 max-lg:[&>*:nth-child(2)]:border-t-0">
          <Counter label="Entries" value={stats.entries} />
          <Counter label="Exits" value={stats.exits} />
          <Counter label="Occupancy" value={stats.occupancy} accent />
          <Counter label="In queue" value={stats.queue} />
        </div>
      </div>

      <div className="border-t rule-inverse px-4 py-4 md:px-5">
        <div className="label mb-3 flex justify-between text-paper/45">
          <span>uplink · what actually leaves the building</span>
          <span className="hidden sm:inline">schema_version 1</span>
        </div>
        <ol className="data min-h-[7.25rem] space-y-1.5 text-[0.7rem] leading-snug text-paper/85 sm:text-[0.78rem]" aria-live="off">
          <AnimatePresence initial={false} mode="popLayout">
            {log.map((event, i) => (
              <motion.li
                key={event.minute}
                layout
                className="flex gap-x-3 whitespace-nowrap"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: i === log.length - 1 ? 1 : 0.5, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_SETTLE }}
              >
                <span className="text-signal">{formatMinute(event.minute)}</span>
                <span className="hidden text-paper/50 md:inline">line_minute</span>
                <span className="truncate">
                  {"{ "}entries: {event.entries}, exits: {event.exits}, occupancy: {event.occupancy}, queue: {event.queue}
                  {" }"}
                </span>
                <span className="ml-auto hidden text-paper/40 sm:inline">ack 200</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}
