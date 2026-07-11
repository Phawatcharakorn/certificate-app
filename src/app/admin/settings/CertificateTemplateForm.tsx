"use client";

import { useActionState } from "react";
import { createCertificateTemplate } from "./actions";

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
      className="flex flex-col gap-4 max-w-lg border rounded p-6"
    >
      <h2 className="font-semibold">สร้าง Template ใบเซอร์</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name">ชื่อ Template</label>
        <input
          id="name"
          name="name"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="background_image">พื้นหลัง (รูปภาพ)</label>
        <input
          id="background_image"
          name="background_image"
          type="file"
          accept="image/png,image/jpeg"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <fieldset className="flex flex-col gap-3 border rounded p-3">
        <legend className="text-sm font-medium">
          ตำแหน่ง (x, y) ของแต่ละช่อง — พิกัดเป็นจุด นับจากมุมล่างซ้ายของภาพ
        </legend>
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center gap-2">
            <span className="w-32 text-sm">{field.label}</span>
            <input
              name={`${field.key}_x`}
              type="number"
              placeholder="x"
              className="border rounded px-2 py-1 w-24"
            />
            <input
              name={`${field.key}_y`}
              type="number"
              placeholder="y"
              className="border rounded px-2 py-1 w-24"
            />
          </div>
        ))}
      </fieldset>

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.message && (
        <p className="text-green-700 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "กำลังอัพโหลด..." : "สร้าง Template"}
      </button>
    </form>
  );
}
