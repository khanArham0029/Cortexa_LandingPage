/** Site-wide constants. The contact address is public configuration. */
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "pilot@cortexa.example";

export const site = {
  name: "Cortexa",
  title: "Cortexa — Count everyone. Know no one.",
  description:
    "Retail video analytics that runs in the store. An edge box turns your existing cameras into anonymous per-minute counts: footfall, dwell, queue length. Video never leaves the building.",
  contactEmail,
  pilotHref: `mailto:${contactEmail}?subject=${encodeURIComponent("Pilot: one store, one box")}`,
} as const;

export const nav = [
  { label: "Index", href: "#index" },
  { label: "Reports", href: "#reports" },
  { label: "The box", href: "#box" },
  { label: "Refusals", href: "#refusals" },
] as const;
