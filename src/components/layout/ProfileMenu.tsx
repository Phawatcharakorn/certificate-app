"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function ProfileMenu({
  name,
  subtitle,
  children,
}: {
  name: string;
  subtitle?: string | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white ring-2 ring-white/25 transition hover:ring-white/60"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="เมนูโปรไฟล์"
      >
        {initial}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-slate-700 shadow-lg shadow-slate-300/50 anim-fade-in"
          >
            <div className="px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              {subtitle && (
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              )}
            </div>
            <div className="border-t border-slate-100" />
            <div onClick={() => setOpen(false)} className="py-1">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ProfileMenuLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

export function ProfileMenuButton({
  type = "button",
  children,
  danger,
}: {
  type?: "button" | "submit";
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type={type}
      role="menuitem"
      className={`flex w-full items-center px-4 py-2 text-left text-sm transition hover:bg-slate-50 ${
        danger ? "text-red-600" : "text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
