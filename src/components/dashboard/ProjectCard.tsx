import type { ReactNode } from "react";
import Link from "next/link";
import { LockIcon } from "@/components/icons";

const BANNER_GRADIENTS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-cyan-600",
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

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
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

  const cardClassName = `flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 ${
    href
      ? "transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-300/50"
      : ""
  } ${locked ? "opacity-75" : ""}`;

  const content = (
    <>
      <div
        className={`relative flex h-28 items-center justify-center overflow-hidden text-white ${
          coverImageUrl
            ? "bg-slate-800"
            : `bg-gradient-to-br ${locked ? "from-slate-400 to-slate-500" : bannerGradient(code)}`
        }`}
      >
        {coverImageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover ${locked ? "grayscale" : ""}`}
            />
            <div className="absolute inset-0 bg-black/35" />
          </>
        )}
        <span className="relative text-2xl font-bold tracking-wide opacity-90">
          {code}
        </span>
        {locked ? (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <LockIcon width={12} height={12} strokeWidth={2.5} />
            จำกัดคณะ
          </span>
        ) : (
          hasCapacity && (
            <span
              className={`absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${
                isFull ? "" : "animate-pulse"
              }`}
            >
              {isFull ? "เต็มแล้ว" : `เหลือ ${remaining} ที่`}
            </span>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-900">{name}</h3>
        {description && (
          <p className="line-clamp-2 text-sm text-slate-500">{description}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          <Chip>{formatThaiDate(eventDate)}</Chip>
          <Chip>{location ?? "ไม่ระบุสถานที่"}</Chip>
          {duration && <Chip>{duration}</Chip>}
          {hasCapacity && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
              จำกัด {capacity} ที่นั่ง
            </span>
          )}
        </div>
        <div className="mt-auto pt-3">{footer}</div>
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
