import type { ComponentType, ReactNode, SVGProps } from "react";

/** Shared state-color vocabulary — see docs/DESIGN_SYSTEM.md "States". */
export type BadgeTone =
  | "neutral"
  | "info"
  | "warning"
  | "processing"
  | "success"
  | "danger";

/** Exposed for callers that need the raw tone classes outside a pill shape
 *  (e.g. a status icon circle) — keep in sync with Badge's own rendering. */
export const TONE_STYLE: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  processing: "bg-sky-50 text-sky-700",
  success: "bg-green-50 text-green-700",
  danger: "bg-red-50 text-red-700",
};

export function Badge({
  tone,
  icon: Icon,
  children,
}: {
  tone: BadgeTone;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${TONE_STYLE[tone]}`}
    >
      {Icon && <Icon width={13} height={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
