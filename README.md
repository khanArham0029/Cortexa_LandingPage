# Cortexa landing page

Marketing site for Cortexa AI. Next.js (App Router), Tailwind CSS v4, Motion.

```bash
pnpm install
pnpm dev
```

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

## Layout

| Path                   | Contents                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| `app/globals.css`      | Design tokens (`@theme`), type roles, grid, grain                     |
| `app/layout.tsx`       | Fonts: Bricolage Grotesque, Archivo, Instrument Serif, JetBrains Mono |
| `components/motion/`   | Motion variants and primitives: line reveal, magnetic, parallax       |
| `components/sections/` | One file per page section                                             |
| `components/hero/`     | The live counting-line floor in the hero                              |
| `components/explorer/` | Data figures for the sticky feature explorer                          |
| `lib/content.ts`       | All page copy                                                         |
| `lib/sim.ts`           | Pure counting simulation behind the hero (no React, no DOM, no clock) |
| `lib/samples.ts`       | Sample figures for the feature charts, labelled as sample on the page |

## Configuration

`NEXT_PUBLIC_CONTACT_EMAIL` sets the address the "Book a pilot" links write to. See `.env.example`.
