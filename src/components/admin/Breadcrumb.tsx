import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({
  items,
  leading,
}: {
  items: Crumb[];
  /** Extra control rendered before the trail, e.g. a back button. */
  leading?: ReactNode;
}) {
  return (
    <nav
      aria-label="breadcrumb"
      className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
        {leading}
        <ol className="flex w-full flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRightIcon
                  width={14}
                  height={14}
                  className="shrink-0 text-slate-300"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate hover:text-blue-700 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`truncate ${
                    isLast ? "font-medium text-slate-700" : ""
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
        </ol>
      </div>
    </nav>
  );
}
