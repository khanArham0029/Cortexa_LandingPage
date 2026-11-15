/** All page copy lives here so sections stay layout and motion only. */

export const principles = [
  {
    no: "01",
    title: "Pixels stay in the store.",
    body: "The box uploads counts. Never frames, never crops, never thumbnails. Stages four and five of the pipeline see box coordinates and timestamps. They could not leak an image if they tried.",
    aside: "0 frames uploaded",
  },
  {
    no: "02",
    title: "One contract. Nothing else.",
    body: "Edge and cloud agree on a versioned event schema and on nothing more. Either side can be rewritten without the other noticing. A removed field costs a new schema_version, and the old one keeps working while any box still speaks it.",
    aside: "schema_version: 1",
  },
  {
    no: "03",
    title: "Stores are configuration.",
    body: "Lines, zones, thresholds, opening hours and alert rules are rows, not releases. Draw a polygon on a camera snapshot and the box picks it up without a restart. A clothing store and a snooker club run the same binary.",
    aside: "0 deploys per store",
  },
  {
    no: "04",
    title: "Every number is reproducible.",
    body: "Counting rules change only together with the recorded clips that pin their behaviour. Saved detections replay through the counting logic on every commit. If a number moves, a test moved first.",
    aside: "replay on every commit",
  },
] as const;

export type FeatureVisual = "footfall" | "dwell" | "queue" | "heatmap" | "alerts" | "insight";

export type Feature = {
  no: string;
  key: FeatureVisual;
  name: string;
  event: string;
  claim: string;
  body: string;
  facts: readonly string[];
  tone: "ink" | "signal" | "paper";
};

export const features: readonly Feature[] = [
  {
    no: "01",
    key: "footfall",
    name: "Footfall",
    event: "line_minute",
    claim: "A person is one point crossing one line. Once.",
    body: "Two parallel lines just inside the door, a minimum track age, a staff zone that does not count, and groups counted as groups. Entries, exits and live occupancy every minute, with occupancy reset outside opening hours.",
    facts: ["Entries / exits / occupancy", "Group counting", "Staff excluded by zone", "Installer's manual count stored beside it"],
    tone: "ink",
  },
  {
    no: "02",
    key: "dwell",
    name: "Zones & dwell",
    event: "zone_minute",
    claim: "Medians, because averages lie about retail.",
    body: "Draw a polygon on a snapshot. Name it. Give it an engagement threshold. The box reports visits, engaged visits and people present per zone, and rejoins tracks that flicker out and reappear so one browser is not counted as three.",
    facts: ["Hourly dwell median and average", "Stop rate per section", "Section ranking and cold spots", "Feet-point zone entry"],
    tone: "paper",
  },
  {
    no: "03",
    key: "queue",
    name: "Queue & counter",
    event: "queue_minute",
    claim: "The queue is a number. So is the empty counter.",
    body: "A queue zone reports length and wait. A staff zone behind the counter reports whether anyone is there. Put the two together and you know the exact minute service broke down, not the vague afternoon.",
    facts: ["Queue length and wait time", "Counter staffed / unattended", "Per-minute resolution", "Thresholds set per zone"],
    tone: "signal",
  },
  {
    no: "04",
    key: "heatmap",
    name: "Heatmap",
    event: "heatmap_hour",
    claim: "A coarse grid of presence. No trails, no faces.",
    body: "The floor is divided into cells and each cell accumulates seconds of presence. That is all. It overlays the camera snapshot in the dashboard and shows where the store is dead. It cannot show where a person went, by construction.",
    facts: ["Presence seconds per cell", "Hourly aggregation", "Overlay on your own snapshot", "No per-person paths"],
    tone: "ink",
  },
  {
    no: "05",
    key: "alerts",
    name: "Alerts",
    event: "alert_rule",
    claim: "It reaches the owner. The owner opens nothing.",
    body: "Rules are per-tenant configuration with cooldowns and escalation: queue over a length for a duration, counter unattended, occupancy over a limit, box offline. One breach sends exactly one WhatsApp message. Recipients opt in, and can opt out.",
    facts: ["WhatsApp delivery with status tracking", "Cooldown and escalation", "Recorded consent per recipient", "Device-offline rule built in"],
    tone: "paper",
  },
  {
    no: "06",
    key: "insight",
    name: "Summaries",
    event: "weekly_insight",
    claim: "A language model that is not allowed to make up numbers.",
    body: "A daily summary lands every morning: yesterday's footfall, the peak hour, the busiest and quietest sections. Once a week a model writes the narrative from aggregates only, and every figure it quotes is checked against the database before it is sent.",
    facts: ["Daily summary on WhatsApp", "Weekly written insight", "Built from aggregates only", "Quoted numbers verified"],
    tone: "ink",
  },
] as const;

export const pipeline = [
  { no: "1", name: "Stream reader", detail: "RTSP from the DVR you already own. GPU decode. Reconnects on its own.", home: "vision/" },
  { no: "2", name: "Detector", detail: "Person boxes, about ten times a second. ONNX through OpenVINO.", home: "vision/" },
  { no: "3", name: "Tracker", detail: "Temporary IDs that link detections across frames. They die on the minute.", home: "vision/" },
  { no: "4", name: "Lines & zones", detail: "Crossings and visits. Pure functions. No pixels in scope.", home: "analytics/" },
  { no: "5", name: "Minute aggregator", detail: "Folds a minute into events. Discards every track ID.", home: "analytics/" },
  { no: "6", name: "Uplink", detail: "SQLite first, HTTPS second. Ordered batches, deleted only on acknowledgement.", home: "uplink/" },
] as const;

export const specs = [
  ["Input", "Existing cameras or DVR over RTSP"],
  ["Processing", "One process per camera"],
  ["Detection rate", "~10 frames per second, per stream"],
  ["Inference", "ONNX model on OpenVINO, person class only"],
  ["Output", "Per-minute aggregate events, HTTPS"],
  ["Offline buffer", "SQLite, ordered by batch_seq"],
  ["Resend safety", "Idempotent on event ID"],
  ["Config", "Synced from the dashboard, cached locally"],
  ["Updates", "Remote, with rollback"],
  ["Guards", "Disk, temperature, clock drift"],
  ["Recovery", "Boots and resumes after a power cut"],
  ["Uploaded video", "None"],
] as const;

export const refusals = [
  { text: "Face recognition", note: "Not disabled. Not built." },
  { text: "Re-identification", note: "Nobody is followed between cameras." },
  { text: "Personal journeys", note: "Track IDs are discarded every minute." },
  { text: "Profiling", note: "No age, no gender, no inference." },
  { text: "Cloud video", note: "There is no upload path for a frame." },
] as const;

export const marqueeWords = ["Footfall", "Dwell", "Queue length", "Occupancy", "Heatmap", "Counter staffed"] as const;
