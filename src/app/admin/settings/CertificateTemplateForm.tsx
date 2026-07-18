"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { createCertificateTemplate } from "./actions";
import { buttonPrimary, card, input, label } from "@/lib/ui";
import { TIER_LABEL } from "@/lib/certificate-tier";
import type { CertificateTemplate, CertificateTier } from "@/types/database";
import {
  TemplateCanvasEditor,
  type FieldKey,
  type FieldPosition,
} from "./TemplateCanvasEditor";

const TIERS: CertificateTier[] = ["platinum", "gold", "silver"];

export function CertificateTemplateForm({
  existingTemplates,
}: {
  existingTemplates: CertificateTemplate[];
}) {
  const [state, formAction, pending] = useActionState(
    createCertificateTemplate,
    undefined,
  );
  const [tier, setTier] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<FieldKey, FieldPosition> | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateForTier = useMemo(
    () => existingTemplates.find((t) => t.tier === tier) ?? null,
    [existingTemplates, tier],
  );

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleTierChange = (value: string) => {
    setTier(value);
    const existing = existingTemplates.find((t) => t.tier === value);
    if (existing) {
      if (nameInputRef.current) nameInputRef.current.value = existing.name;
      setPreviewUrl(existing.background_image_url);
    } else if (nameInputRef.current) {
      nameInputRef.current.value = "";
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (templateForTier) {
      setPreviewUrl(templateForTier.background_image_url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex w-full flex-col gap-4`}
    >
      <div>
        <h2 className="font-semibold text-slate-900">สร้าง / แก้ไข Template ใบเซอร์</h2>
        <p className="text-xs text-slate-400">
          เลือกระดับก่อน ถ้ามี template เดิมของระดับนั้นจะโหลดพื้นหลังเดิมมาให้ปรับตำแหน่งต่อได้เลย
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="tier" className={label}>
            ระดับใบเซอร์
          </label>
          <select
            id="tier"
            name="tier"
            required
            className={input}
            value={tier}
            onChange={(e) => handleTierChange(e.target.value)}
          >
            <option value="" disabled>
              เลือกระดับ
            </option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
                {existingTemplates.some((et) => et.tier === t) ? " (มี template แล้ว)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className={label}>
            ชื่อ Template
          </label>
          <input id="name" name="name" required ref={nameInputRef} className={input} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="background_image" className={label}>
          พื้นหลัง (รูปภาพ)
          {templateForTier && (
            <span className="ml-1 font-normal text-slate-400">
              — ต้องอัปโหลดใหม่ทุกครั้งแม้ใช้รูปเดิม
            </span>
          )}
        </label>
        <input
          id="background_image"
          name="background_image"
          type="file"
          accept="image/png,image/jpeg"
          required
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className={input}
        />
      </div>

      <TemplateCanvasEditor
        imageUrl={previewUrl}
        initialPositions={templateForTier?.field_positions}
        onChange={setPositions}
      />

      {positions &&
        (Object.keys(positions) as FieldKey[]).map((key) => (
          <div key={key}>
            <input type="hidden" name={`${key}_x`} value={positions[key].x} />
            <input type="hidden" name={`${key}_y`} value={positions[key].y} />
          </div>
        ))}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังอัพโหลด..." : "บันทึก Template"}
      </button>
    </form>
  );
}
