/**
 * A miniature of the edge box's counting logic, for the hero visual.
 *
 * Pure: no React, no DOM, no clock. Time is passed in. People are points on
 * a unit floor (0..1 on both axes, y grows toward the door). The only things
 * that leave this module are per-minute aggregates, which is the point.
 */

export type Point = { x: number; y: number };

export type Zone = {
  key: "a" | "b" | "queue";
  label: string;
  polygon: readonly Point[];
};

export type Person = {
  pos: Point;
  path: Point[];
  speed: number;
  state: "walking" | "dwelling" | "queued" | "leaving";
  wait: number;
  visited: number;
  /** Seconds since this point last crossed the line; drives the flash. */
  crossedAgo: number;
};

export type MinuteEvent = {
  minute: number;
  entries: number;
  exits: number;
  occupancy: number;
  queue: number;
};

export type Sim = {
  people: Person[];
  queue: Person[];
  rand: () => number;
  clock: number;
  spawnIn: number;
  totals: { entries: number; exits: number };
  bucket: { entries: number; exits: number };
  minute: number;
};

/** One simulated minute lasts this many real seconds. */
export const MINUTE_SECONDS = 3.2;
/** 14:00 UTC, in minutes since midnight. */
export const START_MINUTE = 14 * 60;

export const LINE_Y = 0.8;
export const DOOR = { left: 0.38, right: 0.62 } as const;
export const COUNTER = { x: 0.7, y: 0.1, w: 0.22, h: 0.07 } as const;

export const ZONES: readonly Zone[] = [
  {
    key: "a",
    label: "Section A",
    polygon: [
      { x: 0.07, y: 0.1 },
      { x: 0.4, y: 0.1 },
      { x: 0.34, y: 0.4 },
      { x: 0.07, y: 0.36 },
    ],
  },
  {
    key: "b",
    label: "Section B",
    polygon: [
      { x: 0.08, y: 0.5 },
      { x: 0.3, y: 0.47 },
      { x: 0.33, y: 0.7 },
      { x: 0.08, y: 0.7 },
    ],
  },
  {
    key: "queue",
    label: "Queue",
    polygon: [
      { x: 0.76, y: 0.2 },
      { x: 0.88, y: 0.2 },
      { x: 0.88, y: 0.62 },
      { x: 0.76, y: 0.62 },
    ],
  },
];

const HALL: Point = { x: 0.5, y: 0.66 };
const OUTSIDE_Y = 1.1;
const MAX_PEOPLE = 26;

/** Small deterministic PRNG so the floor looks the same on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ray-casting point-in-polygon test: the same check a zone uses on a feet point. */
export function inPolygon(p: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function between(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

function pointInZone(rand: () => number, zone: Zone): Point {
  const xs = zone.polygon.map((p) => p.x);
  const ys = zone.polygon.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (let i = 0; i < 12; i++) {
    const p = { x: between(rand, x0 + 0.02, x1 - 0.02), y: between(rand, y0 + 0.02, y1 - 0.02) };
    if (inPolygon(p, zone.polygon)) return p;
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
}

function queueSlot(index: number): Point {
  return { x: 0.82, y: 0.25 + index * 0.055 };
}

function exitPath(rand: () => number): Point[] {
  const x = between(rand, DOOR.left + 0.04, DOOR.right - 0.04);
  return [{ x: between(rand, 0.44, 0.56), y: HALL.y }, { x, y: OUTSIDE_Y }];
}

/** Add one person outside the door, already walking in. */
export function spawn(sim: Sim, doorX?: number): void {
  if (sim.people.length >= MAX_PEOPLE) return;
  const { rand } = sim;
  const x = Math.min(DOOR.right - 0.03, Math.max(DOOR.left + 0.03, doorX ?? between(rand, DOOR.left + 0.04, DOOR.right - 0.04)));
  const first = rand() < 0.62 ? ZONES[0]! : ZONES[1]!;
  sim.people.push({
    pos: { x, y: OUTSIDE_Y },
    path: [{ x: between(rand, 0.44, 0.56), y: HALL.y }, pointInZone(rand, first)],
    speed: between(rand, 0.075, 0.115),
    state: "walking",
    wait: 0,
    visited: 0,
    crossedAgo: 99,
  });
}

function arrive(sim: Sim, person: Person): void {
  const { rand } = sim;
  if (person.state === "leaving") return;
  if (person.state === "queued") {
    // Only the head of the queue is being served; everyone else just stands.
    person.wait = sim.queue[0] === person ? between(rand, 3.5, 7) : Number.POSITIVE_INFINITY;
    return;
  }
  person.state = "dwelling";
  person.wait = between(rand, 2.5, 9);
}

function decide(sim: Sim, person: Person): void {
  const { rand } = sim;
  if (person.state === "queued") {
    sim.queue.shift();
    person.state = "leaving";
    person.path = exitPath(rand);
    return;
  }
  person.visited += 1;
  const roll = rand();
  if (person.visited < 2 && roll < 0.35) {
    const other = inPolygon(person.pos, ZONES[0]!.polygon) ? ZONES[1]! : ZONES[0]!;
    person.state = "walking";
    person.path = [pointInZone(rand, other)];
  } else if (roll < 0.8 && sim.queue.length < 7) {
    person.state = "queued";
    sim.queue.push(person);
    person.path = [{ x: 0.6, y: 0.5 }, queueSlot(sim.queue.length - 1)];
  } else {
    person.state = "leaving";
    person.path = exitPath(rand);
  }
}

/**
 * Advance the floor by `dt` seconds. Returns the minute event if a minute
 * boundary was crossed during this step, otherwise null.
 */
export function step(sim: Sim, dt: number): MinuteEvent | null {
  sim.clock += dt;

  sim.spawnIn -= dt;
  if (sim.spawnIn <= 0) {
    spawn(sim);
    if (sim.rand() < 0.3) spawn(sim);
    sim.spawnIn = between(sim.rand, 1.3, 3.6);
  }

  for (const person of sim.people) {
    person.crossedAgo += dt;
    const target = person.path[0];

    if (!target) {
      person.wait -= dt;
      if (person.wait <= 0) decide(sim, person);
      continue;
    }

    const dx = target.x - person.pos.x;
    const dy = target.y - person.pos.y;
    const dist = Math.hypot(dx, dy);
    const travel = person.speed * dt;
    const before = person.pos.y;

    if (dist <= travel) {
      person.pos = { ...target };
      person.path.shift();
      if (person.path.length === 0) arrive(sim, person);
    } else {
      person.pos = { x: person.pos.x + (dx / dist) * travel, y: person.pos.y + (dy / dist) * travel };
    }

    // The counting rule: one point, one line, one direction, once.
    const after = person.pos.y;
    if (before > LINE_Y && after <= LINE_Y) {
      sim.bucket.entries += 1;
      sim.totals.entries += 1;
      person.crossedAgo = 0;
    } else if (before <= LINE_Y && after > LINE_Y) {
      sim.bucket.exits += 1;
      sim.totals.exits += 1;
      person.crossedAgo = 0;
    }
  }

  // Close up the queue and start serving whoever is now at the front.
  sim.queue.forEach((person, index) => {
    const slot = queueSlot(index);
    const last = person.path[person.path.length - 1];
    if (last) {
      last.x = slot.x;
      last.y = slot.y;
    } else if (Math.abs(person.pos.y - slot.y) > 0.001) {
      person.path = [slot];
    } else if (index === 0 && person.wait === Number.POSITIVE_INFINITY) {
      person.wait = between(sim.rand, 3.5, 7);
    }
  });

  sim.people = sim.people.filter((p) => !(p.state === "leaving" && p.path.length === 0));

  const minute = START_MINUTE + Math.floor(sim.clock / MINUTE_SECONDS);
  if (minute === sim.minute) return null;

  // Minute boundary. Emit the aggregate; nothing about any individual survives.
  const event: MinuteEvent = {
    minute: sim.minute,
    entries: sim.bucket.entries,
    exits: sim.bucket.exits,
    occupancy: occupancy(sim),
    queue: queueLength(sim),
  };
  sim.bucket = { entries: 0, exits: 0 };
  sim.minute = minute;
  return event;
}

export function occupancy(sim: Sim): number {
  return Math.max(0, sim.totals.entries - sim.totals.exits);
}

export function queueLength(sim: Sim): number {
  const zone = ZONES[2]!;
  return sim.people.filter((p) => inPolygon(p.pos, zone.polygon)).length;
}

export function zoneCount(sim: Sim, zone: Zone): number {
  return sim.people.filter((p) => inPolygon(p.pos, zone.polygon)).length;
}

/** Build a floor and run it forward so the first frame is already busy. */
export function createSim(seed = 20260): { sim: Sim; history: MinuteEvent[] } {
  const sim: Sim = {
    people: [],
    queue: [],
    rand: mulberry32(seed),
    clock: 0,
    spawnIn: 0,
    totals: { entries: 0, exits: 0 },
    bucket: { entries: 0, exits: 0 },
    minute: START_MINUTE,
  };
  const history: MinuteEvent[] = [];
  const warmup = MINUTE_SECONDS * 16.4;
  for (let t = 0; t < warmup; t += 1 / 30) {
    const event = step(sim, 1 / 30);
    if (event) history.push(event);
  }
  return { sim, history };
}

/** Minutes since midnight to "14:07Z". Times are UTC end to end. */
export function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60) % 24;
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}Z`;
}
