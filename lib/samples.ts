/**
 * Sample figures for the feature visuals. Illustrative, labelled as such on
 * the page, and shaped like the real rollups so the charts read honestly.
 */

/** Entries per hour for one trading day, 09:00 to 21:00. */
export const hourlyEntries = [14, 22, 31, 58, 96, 88, 61, 54, 73, 121, 138, 92, 47] as const;
export const hourlyStart = 9;

/** Median dwell per section, in seconds. Section names are tenant configuration. */
export const dwellBySection = [
  { name: "Denim wall", median: 221, engaged: 0.61 },
  { name: "Entrance table", median: 148, engaged: 0.44 },
  { name: "Outerwear", median: 117, engaged: 0.38 },
  { name: "Accessories", median: 64, engaged: 0.21 },
  { name: "Sale rail", median: 22, engaged: 0.06 },
] as const;

/** Queue length per minute across half an hour, with a threshold of five. */
export const queueByMinute = [1, 1, 2, 2, 1, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 7, 6, 6, 4, 3, 3, 2, 2, 1, 1, 2, 1, 1, 0] as const;
export const queueThreshold = 5;

export const HEAT_COLS = 18;
export const HEAT_ROWS = 10;

/** Presence grid: a few gaussian blobs, normalised to 0..1. Deterministic. */
export function heatGrid(): number[] {
  const blobs = [
    { x: 3.2, y: 2.4, s: 2.3, w: 1 },
    { x: 9.5, y: 7.6, s: 2.9, w: 0.8 },
    { x: 14.6, y: 2.2, s: 1.7, w: 0.95 },
    { x: 8.6, y: 4.4, s: 1.3, w: 0.35 },
  ];
  const cells: number[] = [];
  for (let row = 0; row < HEAT_ROWS; row++) {
    for (let col = 0; col < HEAT_COLS; col++) {
      let v = 0;
      for (const b of blobs) {
        v += b.w * Math.exp(-((col - b.x) ** 2 + (row - b.y) ** 2) / (2 * b.s ** 2));
      }
      cells.push(Math.min(1, v));
    }
  }
  return cells;
}

export function formatDwell(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}
