"use client";

import { useActionState } from "react";
import { createCertificateTemplate } from "./actions";
import { buttonPrimary, card, input, label } from "@/lib/ui";

const FIELDS = [
  { key: "full_name", label: "ชื่อ-นามสกุล" },
  { key: "student_code", label: "รหัสนิสิต" },
  { key: "certificate_name", label: "ชื่อใบเซอร์" },
  { key: "date", label: "วันที่" },
] as const;

export function CertificateTemplateForm() {
  const [state, formAction, pending] = useActionState(
    createCertificateTemplate,
    undefined,
  );

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex w-full flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">สร้าง Template ใบเซอร์</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={label}>
          ชื่อ Template
        </label>
        <input id="name" name="name" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="background_image" className={label}>
          พื้นหลัง (รูปภาพ)
        </label>
        <input
          id="background_image"
          name="background_image"
          type="file"
          accept="image/png,image/jpeg"
          required
          className={input}
        />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3">
        <legend className="text-sm font-medium text-slate-600">
          ตำแหน่ง (x, y) ของแต่ละช่อง — พิกัดเป็นจุด นับจากมุมล่างซ้ายของภาพ
        </legend>
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-wrap items-center gap-2">
            <span className="w-full text-sm text-slate-600 sm:w-32">
              {field.label}
            </span>
            <input
              name={`${field.key}_x`}
              type="number"
              placeholder="x"
              className={`${input} w-24`}
            />
            <input
              name={`${field.key}_y`}
              type="number"
              placeholder="y"
              className={`${input} w-24`}
            />
          </div>
        ))}
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังอัพโหลด..." : "สร้าง Template"}
      </button>
    </form>
  );
}
