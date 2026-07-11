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
    <header className="flex items-center justify-between gap-4 bg-blue-700 px-6 py-3 text-white shadow-sm">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-700">
          KU
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-blue-100">{subtitle}</p>
        </div>
      </Link>
      {right && (
        <div className="flex items-center gap-4 text-sm text-blue-50">
          {right}
        </div>
      )}
    </header>
  );
}
