export const card =
  "rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-14px_rgba(13,122,106,0.25)]";

// Glassmorphism variant — soft blur + layered shadow, no flat white-on-gray.
export const cardGlass =
  "rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(13,60,86,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60";

export const input =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-teal-500";

export const label = "text-sm font-medium text-slate-600";

// Typography scale — pick from these instead of ad-hoc text-* sizes so
// heading/body hierarchy stays consistent across pages.
// Color-agnostic on purpose — set text color at the call site (default
// text-slate-900, or e.g. text-white on a dark hero) to avoid class-order
// specificity fights when overriding.
export const headingXl = "text-3xl font-bold tracking-tight sm:text-4xl"; // H1
export const headingLg = "text-xl font-semibold tracking-tight sm:text-2xl"; // H2
export const headingMd = "font-semibold tracking-tight"; // H3
export const headingSm = "text-sm font-semibold text-slate-800"; // H4/H5 — table group headers, card sub-sections
export const bodyText = "text-base leading-relaxed text-slate-600";
export const smallText = "text-sm leading-relaxed text-slate-500";
export const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.14em] text-teal-700"; // H6-style label

export const buttonPrimary =
  "inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-150 hover:shadow-xl hover:shadow-teal-900/30 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

export const buttonSecondary =
  "inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 active:scale-95";

// Compact solid action for inline row buttons (table/list actions) — blue is
// the app's secondary color, distinct from the teal/blue primary gradient.
export const buttonSecondarySolid =
  "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

// Lowest-emphasis action (dismiss/cancel) — no border, no fill until hover.
export const buttonGhost =
  "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800";

// Destructive action (delete/revoke) — outlined, not solid, so it doesn't
// visually compete with buttonPrimary for attention.
export const buttonDanger =
  "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition hover:bg-red-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

// Filter chip / segmented-toggle pair (selected vs unselected option).
export const chipActive = "rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white transition";
export const chipInactive =
  "rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-50";

export const linkMuted = "text-sm text-slate-500 underline hover:text-slate-700";

// Compact CTA pill for the header bar (e.g. "เข้าสู่ระบบ" next to the nav links).
export const buttonHeaderCta =
  "inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-95";

// ── Tables ──────────────────────────────────────────────────────────────
export const tableWrap = `${card} overflow-x-auto`;
export const tableHeadRow = "border-b border-slate-100 text-left text-slate-500";
export const tableCellHead = "py-2 pr-4 text-xs font-medium uppercase tracking-wide";
export const tableRow =
  "border-b border-slate-50 text-slate-700 transition hover:bg-slate-50/60";
export const tableCell = "py-2 pr-4";

// ── Modal ───────────────────────────────────────────────────────────────
export const modalBackdrop = "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm";
export const modalPanel =
  `${card} anim-pop-in fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2`;
