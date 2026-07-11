import Link from "next/link";
import type { ReactNode } from "react";

export function Header({
  title = "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา",
  subtitle = "ระบบให้รางวัล Certificate นิสิต",
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header
      className="flex items-center justify-between gap-4 px-4 py-3 text-white shadow-sm sm:px-6"
      style={{ background: "linear-gradient(135deg, #0d2f6e 0%, #1565c0 100%)" }}
    >
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kus-logo.svg"
            alt="KU Sriracha"
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-blue-100/80">{subtitle}</p>
        </div>
      </Link>
      {right && (
        <div className="flex shrink-0 items-center gap-4 text-sm text-blue-50">
          {right}
        </div>
      )}
    </header>
  );
}
