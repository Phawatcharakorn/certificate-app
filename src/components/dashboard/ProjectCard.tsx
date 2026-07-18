import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarIcon, LockIcon, MapPinIcon } from "@/components/icons";

// KU-brand banner tones — teal/navy family only, no rainbow grab-bag.
const BANNER_GRADIENTS = [
  "from-teal-700 via-teal-600 to-emerald-600",
  "from-blue-950 via-blue-900 to-teal-800",
  "from-emerald-700 via-teal-700 to-blue-900",
];

export function bannerGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

export function formatThaiDate(dateStr?: string | null) {
  if (!dateStr) return "ไม่ระบุวันที่";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Chip({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon?: typeof CalendarIcon;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600">
      {Icon && <Icon width={12} height={12} strokeWidth={2.5} className="text-teal-700" />}
      {children}
    </span>
  );
}

export function ProjectCard({
  code,
  name,
  description,
  eventDate,
  location,
  duration,
  capacity,
  joinedCount,
  footer,
  locked,
  coverImageUrl,
  href,
}: {
  code: string;
  name: string;
  description?: string | null;
  eventDate: string;
  location?: string | null;
  duration?: string | null;
  capacity?: number | null;
  joinedCount?: number;
  footer?: ReactNode;
  locked?: boolean;
  coverImageUrl?: string | null;
  href?: string;
}) {
  const hasCapacity = capacity !== null && capacity !== undefined;
  const remaining = hasCapacity ? capacity - (joinedCount ?? 0) : null;
  const isFull = hasCapacity && remaining !== null && remaining <= 0;

  const cardClassName = `group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(13,60,86,0.16)] ring-1 ring-transparent transition-all duration-300 ${
    href
      ? "hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-16px_rgba(13,122,106,0.35)] hover:ring-teal-500/25"
      : ""
  } ${locked ? "opacity-70 saturate-75" : ""}`;

  const content = (
    <>
      <div
        className={`relative flex h-32 items-center justify-center overflow-hidden text-white ${
          coverImageUrl
            ? "bg-slate-800"
            : `bg-gradient-to-br ${locked ? "from-slate-400 to-slate-500" : bannerGradient(code)}`
        }`}
      >
        {!coverImageUrl && !locked && (
          <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        )}
        {coverImageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${locked ? "grayscale" : "group-hover:scale-105"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </>
        )}
        <span className="relative text-2xl font-bold tracking-tight opacity-95 drop-shadow-sm">
          {code}
        </span>
        {locked ? (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <LockIcon width={12} height={12} strokeWidth={2.5} />
            จำกัดคณะ
          </span>
        ) : (
          hasCapacity && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-rose-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              {isFull ? "เต็มแล้ว" : `เหลือ ${remaining} ที่`}
            </span>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight text-slate-900">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
        <div className="mt-0.5 flex flex-wrap gap-1.5">
          <Chip icon={CalendarIcon}>{formatThaiDate(eventDate)}</Chip>
          <Chip icon={MapPinIcon}>{location ?? "ไม่ระบุสถานที่"}</Chip>
          {duration && <Chip>{duration}</Chip>}
          {hasCapacity && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
              จำกัด {capacity} ที่นั่ง
            </span>
          )}
        </div>
        <div className="mt-auto border-t border-slate-100 pt-3">{footer}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
