"use client";

import { useEffect, type ReactNode } from "react";
import { modalBackdrop, modalPanel } from "@/lib/ui";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className={modalBackdrop} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={modalPanel}>
        {title && (
          <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
        )}
        {children}
      </div>
    </>
  );
}
