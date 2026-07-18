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
export const headingXl = "text-3xl font-bold tracking-tight sm:text-4xl";
export const headingLg = "text-xl font-semibold tracking-tight sm:text-2xl";
export const headingMd = "font-semibold tracking-tight";
export const bodyText = "text-base leading-relaxed text-slate-600";
export const smallText = "text-sm leading-relaxed text-slate-500";
export const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.14em] text-teal-700";

export const buttonPrimary =
  "inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-150 hover:shadow-xl hover:shadow-teal-900/30 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

export const buttonSecondary =
  "inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 active:scale-95";

export const linkMuted = "text-sm text-slate-500 underline hover:text-slate-700";
