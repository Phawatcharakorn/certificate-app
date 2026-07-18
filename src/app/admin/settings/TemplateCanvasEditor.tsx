"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface FieldPosition {
  x: number;
  y: number;
}

export type FieldKey = "full_name" | "student_code" | "certificate_name" | "date";

const FIELDS: { key: FieldKey; label: string; sample: string }[] = [
  { key: "full_name", label: "ชื่อ-นามสกุล", sample: "สมชาย ใจดี" },
  { key: "student_code", label: "รหัสนิสิต", sample: "64010001" },
  { key: "certificate_name", label: "ชื่อใบเซอร์", sample: "ปีการศึกษา 2569 — Platinum" },
  {
    key: "date",
    label: "วันที่",
    sample: new Date().toLocaleDateString("th-TH"),
  },
];

const FONT_SIZE = 20; // matches generate-actions.ts drawText size

// Fractional defaults (from top-left, 0–1) used the first time a field's
// position hasn't been set yet, so labels start spread out and visible
// instead of stacked at the origin.
const DEFAULT_FRACTIONS: Record<FieldKey, { fx: number; fy: number }> = {
  full_name: { fx: 0.5, fy: 0.45 },
  student_code: { fx: 0.5, fy: 0.55 },
  certificate_name: { fx: 0.5, fy: 0.65 },
  date: { fx: 0.5, fy: 0.75 },
};

export function TemplateCanvasEditor({
  imageUrl,
  initialPositions,
  onChange,
}: {
  imageUrl: string | null;
  initialPositions?: Partial<Record<FieldKey, FieldPosition>>;
  onChange: (positions: Record<FieldKey, FieldPosition>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [positions, setPositions] = useState<Record<FieldKey, FieldPosition> | null>(null);
  const [draggingKey, setDraggingKey] = useState<FieldKey | null>(null);

  // Reset to defaults / provided initial positions whenever the background
  // image or the initial positions change (e.g. switching tier).
  useEffect(() => {
    setNaturalSize(null);
    setPositions(null);
  }, [imageUrl]);

  const scale = naturalSize && displayWidth ? displayWidth / naturalSize.w : 0;

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNaturalSize({ w, h });
    setDisplayWidth(img.clientWidth);

    setPositions((prev) => {
      if (prev) return prev;
      const next = {} as Record<FieldKey, FieldPosition>;
      for (const field of FIELDS) {
        const provided = initialPositions?.[field.key];
        if (provided) {
          next[field.key] = provided;
        } else {
          const { fx, fy } = DEFAULT_FRACTIONS[field.key];
          next[field.key] = {
            x: Math.round(fx * w),
            y: Math.round((1 - fy) * h), // stored y is from bottom
          };
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPositions]);

  useEffect(() => {
    if (positions) onChange(positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  useEffect(() => {
    function handleResize() {
      if (imgRef.current) setDisplayWidth(imgRef.current.clientWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // A cached image can already be `complete` by the time this effect runs,
  // in which case the browser never fires another native `load` event and
  // the <img onLoad> handler below silently never runs — poll for it here.
  useEffect(() => {
    if (!imageUrl) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      handleImageLoad();
    }
  }, [imageUrl, handleImageLoad]);

  const movePointer = useCallback(
    (key: FieldKey, clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || !naturalSize || !scale) return;
      const rect = container.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      const xNatural = Math.min(Math.max(offsetX / scale, 0), naturalSize.w);
      const yFromTopNatural = Math.min(Math.max(offsetY / scale, 0), naturalSize.h);
      const yFromBottom = naturalSize.h - yFromTopNatural;

      setPositions((prev) =>
        prev
          ? {
              ...prev,
              [key]: { x: Math.round(xNatural), y: Math.round(yFromBottom) },
            }
          : prev,
      );
    },
    [naturalSize, scale],
  );

  useEffect(() => {
    if (!draggingKey) return;

    function handleMove(e: PointerEvent) {
      movePointer(draggingKey!, e.clientX, e.clientY);
    }
    function handleUp() {
      setDraggingKey(null);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingKey, movePointer]);

  const setFieldValue = (key: FieldKey, axis: "x" | "y", value: number) => {
    setPositions((prev) => (prev ? { ...prev, [key]: { ...prev[key], [axis]: value } } : prev));
  };

  const fontScale = scale || 0;

  if (!imageUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
        เลือกรูปพื้นหลังเพื่อเริ่มจัดตำแหน่ง
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="พื้นหลังใบเซอร์"
          className="block w-full"
          onLoad={handleImageLoad}
          draggable={false}
        />

        {positions &&
          naturalSize &&
          scale > 0 &&
          FIELDS.map((field) => {
            const pos = positions[field.key];
            const left = pos.x * scale;
            const top = (naturalSize.h - pos.y) * scale;
            return (
              <div
                key={field.key}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDraggingKey(field.key);
                }}
                style={{
                  left,
                  top,
                  fontSize: Math.max(10, FONT_SIZE * fontScale),
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab whitespace-nowrap rounded-md border px-2 py-0.5 font-medium leading-tight text-slate-900 shadow-sm transition-colors active:cursor-grabbing ${
                  draggingKey === field.key
                    ? "border-teal-500 bg-teal-50/90 ring-2 ring-teal-400"
                    : "border-teal-300/70 bg-white/85 hover:border-teal-400"
                }`}
              >
                {field.sample}
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const pos = positions?.[field.key];
          return (
            <div
              key={field.key}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
            >
              <span className="font-medium text-slate-600">{field.label}</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                x
                <input
                  type="number"
                  value={pos?.x ?? 0}
                  onChange={(e) => setFieldValue(field.key, "x", Number(e.target.value))}
                  className="w-16 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-right text-slate-800"
                />
                y
                <input
                  type="number"
                  value={pos?.y ?? 0}
                  onChange={(e) => setFieldValue(field.key, "y", Number(e.target.value))}
                  className="w-16 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-right text-slate-800"
                />
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">
        ลากป้ายชื่อบนภาพเพื่อจัดตำแหน่ง หรือพิมพ์ x, y เองก็ได้ — พิกัดนับจากมุมล่างซ้ายของภาพ
      </p>
    </div>
  );
}

export { FIELDS as TEMPLATE_FIELDS };
