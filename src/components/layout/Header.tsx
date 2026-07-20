import Link from "next/link";
import type { ReactNode } from "react";

export function Header({
  title = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา",
  subtitle = "ระบบให้รางวัล Certificate นิสิต",
  homeHref = "/",
  right,
}: {
  title?: string;
  subtitle?: string;
  homeHref?: string;
  right?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-50 flex h-16 items-center justify-between gap-x-4 border-b border-white/10 bg-slate-900/85 px-4 text-white shadow-lg shadow-black/10 backdrop-blur-md sm:h-[70px] sm:px-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(9,23,51,0.92) 0%, rgba(13,47,78,0.9) 55%, rgba(15,92,82,0.88) 100%)",
      }}
    >
      <Link href={homeHref} className="flex min-w-0 shrink-0 items-center gap-3">
        <div className="flex h-11 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ring-white/40 sm:h-12 sm:w-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo_Eng1.png"
            alt="Kasetsart University Sriracha Campus"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="hidden min-w-0 leading-tight sm:block">
          <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
          <p className="truncate text-xs text-teal-100/75">{subtitle}</p>
        </div>
      </Link>
      {right && (
        <div className="flex min-w-0 items-center gap-x-3 text-xs text-teal-50/90 sm:gap-x-4 sm:text-sm">
          {right}
        </div>
      )}
    </header>
  );
}
