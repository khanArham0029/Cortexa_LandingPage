"use client";

import { motion } from "motion/react";
import { features } from "@/lib/content";
import { nav, site } from "@/lib/site";
import { EASE_SETTLE } from "../motion/variants";

const groups = [
  {
    title: "Reports",
    links: features.map((f) => ({ label: f.name, href: `#report-${f.key}` })),
  },
  {
    title: "System",
    links: nav.map((n) => ({ label: n.label, href: n.href })),
  },
  {
    title: "Contact",
    links: [
      { label: "Book a pilot", href: site.pilotHref },
      { label: site.contactEmail, href: `mailto:${site.contactEmail}` },
      { label: "Back to top ↑", href: "#top" },
    ],
  },
] as const;

const LETTERS = "CORTEXA".split("");

export function Footer() {
  return (
    <footer className="overflow-clip bg-ink text-paper">
      <div className="sheet pt-20 pb-16 md:pt-28 md:pb-24">
        <p className="accent col-span-12 max-w-[20ch] text-[1.9rem] md:col-span-5 md:text-[clamp(1.9rem,2.8vw,3rem)]">
          Anonymous counts from the cameras you already own.
        </p>
        {groups.map((group, i) => (
          <nav
            key={group.title}
            aria-label={group.title}
            className={`col-span-6 mt-12 md:col-span-2 md:mt-0 ${i === 0 ? "md:col-start-7" : ""} ${i === 2 ? "col-span-12 md:col-span-2" : ""}`}
          >
            <p className="label mb-4 text-paper/45">{group.title}</p>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="group relative inline-block text-[0.95rem] text-paper/85 transition-colors duration-300 hover:text-signal">
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-signal transition-transform duration-500 ease-heavy group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="sheet border-t rule-inverse py-4">
        <p className="label col-span-6 text-paper/50 md:col-span-4">© 2026 Cortexa AI</p>
        <p className="label col-span-4 hidden text-paper/50 md:block">All times UTC. All counts anonymous.</p>
        <p className="label col-span-6 text-right text-paper/50 md:col-span-4">
          Frames uploaded to date: <span className="text-signal">0</span>
        </p>
      </div>

      {/* Screen-width brand mark. Sized in container units so it always spans edge to edge. */}
      <motion.div
        aria-hidden
        className="@container px-[var(--gutter)]"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ staggerChildren: 0.06 }}
      >
        <div className="display flex justify-between overflow-hidden pt-[0.06em] text-[22.8cqw] !leading-[0.74] !tracking-normal">
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              className={`block will-change-transform ${letter === "X" ? "text-signal" : ""}`}
              variants={{
                hidden: { y: "105%" },
                shown: { y: "0%", transition: { duration: 1.3, ease: EASE_SETTLE } },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>
      <span className="sr-only">Cortexa</span>
    </footer>
  );
}
