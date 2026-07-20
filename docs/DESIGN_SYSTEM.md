# Design System — Certificate Management System

Source of truth for all shared styling. Import tokens from
[`src/lib/ui.ts`](../src/lib/ui.ts) and reusable components from
[`src/components/ui/`](../src/components/ui/) — never hardcode raw Tailwind
classes for something already covered here.

## 1. Color Palette

### Primary — Teal → Blue gradient
Brand identity. Hero backgrounds, header gradient, the app's one true "go" action.
```
from-teal-600 to-blue-700     buttonPrimary, hero background
from-teal-500 to-emerald-500  buttonHeaderCta
text-teal-700 / bg-teal-50    accents, buttonSecondary hover
```

### Secondary — Blue solid
Compact inline actions (table row buttons, filter chips) and the "selected" state
of segmented controls.
```
bg-blue-600 hover:bg-blue-700   buttonSecondarySolid, chipActive
```

### Neutral — Slate (single scale, no exceptions)
```
text-slate-900   heading, primary text
text-slate-700   table row text
text-slate-600   body text
text-slate-500   secondary text, label, caption
text-slate-400   placeholder, disabled, light icon
border-slate-200 input / card border (dense)
border-slate-100 card border (soft), table header rule
bg-slate-50      secondary surface (input fill, table header hover)
```
Previously `zinc-100/zinc-600` leaked into the Silver tier badge — fixed, slate is now the only neutral gray used anywhere in the app.

### States
```
Success     bg-green-50 text-green-700   attended / completed
Warning     bg-amber-50 text-amber-700   pending
Danger      bg-red-50 text-red-700       rejected / destructive actions
Info        bg-blue-50 text-blue-700     ready / neutral-positive
Processing  bg-sky-50 text-sky-700       in-progress (distinct from info)
Neutral     bg-slate-100 text-slate-600  not applicable / disabled state
```
Use via `<Badge tone="...">` (§4), not raw classes — see `TONE_STYLE` in
[`Badge.tsx`](../src/components/ui/Badge.tsx) for the single source of truth.

### Tier colors (Certificate levels)
Previously inconsistent between two files (Platinum was blue on the public
criteria page but slate on the student dashboard). Standardized on:
```
Platinum  bg-blue-50 text-blue-700
Gold      bg-amber-50 text-amber-700
Silver    bg-slate-100 text-slate-600
```
Defined once in [`lib/certificate-tier.ts`](../src/lib/certificate-tier.ts) — every page must import `TIER_STYLE`/`TIER_LABEL` from there, never redefine locally.

## 2. Typography

| Level | Token | Class | Use |
|---|---|---|---|
| H1 | `headingXl` | `text-3xl font-bold tracking-tight sm:text-4xl` | One per page, hero title |
| H2 | `headingLg` | `text-xl font-semibold tracking-tight sm:text-2xl` | Section heading |
| H3 | `headingMd` | `font-semibold tracking-tight` | Card / form title |
| H4/H5 | `headingSm` | `text-sm font-semibold text-slate-800` | Card sub-section, table group header |
| H6 | `eyebrow` | `text-xs font-semibold uppercase tracking-[0.14em] text-teal-700` | Small caps label above a heading |
| Body | `bodyText` | `text-base leading-relaxed text-slate-600` | Paragraph copy |
| Small/Caption | `smallText` | `text-sm leading-relaxed text-slate-500` | Meta text, helper copy |
| Button (primary size) | — | `text-sm font-semibold` | Baked into `buttonPrimary`/`buttonSecondary` |
| Button (compact) | — | `text-xs font-medium` | Baked into `buttonSecondarySolid`/`buttonGhost`/`buttonDanger` |

Headings are intentionally color-agnostic — set `text-slate-900` (or `text-white` on a dark hero) at the call site.

## 3. Components

### Buttons
| Variant | Token | When |
|---|---|---|
| Primary | `buttonPrimary` | The one main action on a page/form (Save, Submit, Register) |
| Secondary (outline) | `buttonSecondary` | Alternative action next to a primary one |
| Secondary (solid, compact) | `buttonSecondarySolid` | Inline table/list row actions |
| Ghost | `buttonGhost` | Lowest-emphasis action (Cancel, Dismiss) |
| Danger | `buttonDanger` | Destructive/negative action (Reject) |
| Header CTA | `buttonHeaderCta` | Pill button inside the sticky header |

Never write `bg-blue-600 ...` inline for a button — use `buttonSecondarySolid`.

### Cards — two variants, both intentional
- `card` — opaque, used everywhere data needs full contrast (admin, tables, forms)
- `cardGlass` — translucent/blurred, only for hero-adjacent marketing sections on public/dashboard pages

Don't merge these — the blur on `cardGlass` would hurt legibility of dense admin data.

### Forms
```
input  — lib/ui.ts, used identically by every form in the app (admin + student)
label  — lib/ui.ts
```
Already fully consistent — no changes needed here.

### Tables
```
tableWrap      card + overflow-x-auto, wraps the <table>
tableHeadRow   header <tr>
tableCellHead  header <th>
tableRow       body <tr> (includes hover state)
tableCell      body <td>
```
Applied to all 4 tables in the app (student list, project list, certificate request queue, certificate history).

### Badge (`src/components/ui/Badge.tsx`)
Reusable status/tier pill. Replaces 3 previously-divergent implementations
(colored+iconed on the student certificates page, plain gray text on two admin
pages showing the *same* underlying status).
```tsx
<Badge tone="success" icon={CheckCircleIcon}>เสร็จสิ้น</Badge>
```

### Modal (`src/components/ui/Modal.tsx`)
Net-new — the app previously had no centered confirm dialog, only dropdown
popovers. First real usage: the irreversible "ปิดปีการศึกษา" confirmation in
admin/periods.
```tsx
<Modal open={confirming} onClose={() => setConfirming(false)} title="ยืนยันปิดปีการศึกษา">
  ...
</Modal>
```

## 4. Tailwind config

No `tailwind.config.js` needed. This project is on **Tailwind v4** (CSS-first
config via `@theme` in [`globals.css`](../src/app/globals.css)), and every
color used is a stock Tailwind color (slate/teal/blue/amber/red/green/sky) —
the app never deviates from the default palette, so there's nothing to
register as a custom token. The "config layer" for this app *is*
`lib/ui.ts` + `components/ui/*`: composed class strings and small components
instead of theme tokens. Only introduce a real `@theme` color token if the
brand palette ever needs a hex value Tailwind doesn't ship (it doesn't today).

## 5. Adoption Checklist

- [x] Home page components use this design system — already did (typography/buttonPrimary/cardGlass predate this doc and match it)
- [x] Admin page components use this design system — tier colors fixed, 3 hardcoded `bg-blue-600` buttons → `buttonSecondarySolid`/`buttonDanger`, all 4 tables → shared table tokens, status text → `Badge`
- [x] Footer uses this design system — already built on `slate`/`teal` tokens (see previous footer rebuild), no changes needed
- [x] All buttons have consistent style — primary/secondary/ghost/danger/secondary-solid now all centralized in `lib/ui.ts`; zero remaining ad-hoc button color classes
- [x] All text uses the same typography rules — `headingXl/Lg/Md/Sm`, `bodyText`, `smallText`, `eyebrow` cover H1–H6; no remaining ad-hoc heading sizes

### Known intentional exceptions (not bugs)
- `cardGlass` vs `card` — different by design (see §3)
- `ParticipationRow`'s 3-color active-state toggle (registered=blue/attended=green/absent=red) — a segmented control indicating *which status is selected*, not a status badge; correctly reuses the State palette per-option
