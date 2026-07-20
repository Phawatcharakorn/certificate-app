"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";

export function BackButton({
  fallbackHref,
  label = "ย้อนกลับ",
}: {
  fallbackHref: string;
  label?: string;
}) {
  const router = useRouter();

  function handleClick() {
    // history.state.idx is set by the Next.js app router on every in-app
    // navigation. idx > 0 means there's somewhere in-app to go back to;
    // idx === 0 (or missing, e.g. opened via bookmark/new tab) means
    // router.back() would leave the app entirely, so use the fallback.
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      <ArrowLeftIcon width={16} height={16} />
      {label}
    </button>
  );
}
