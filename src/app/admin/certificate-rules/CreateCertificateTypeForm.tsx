"use client";

import { useActionState } from "react";
import { createCertificateType } from "./actions";
import type { Project } from "@/types/database";
import { buttonPrimary, card, input, label } from "@/lib/ui";

export function CreateCertificateTypeForm({
  projects,
}: {
  projects: Project[];
}) {
  const [state, formAction, pending] = useActionState(
    createCertificateType,
    undefined,
  );

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex w-full max-w-lg flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">สร้างเกณฑ์ใบเซอร์ใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={label}>
          ชื่อใบเซอร์
        </label>
        <input id="name" name="name" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={label}>
          รายละเอียด
        </label>
        <textarea id="description" name="description" className={input} />
      </div>

      <fieldset className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
        <legend className="text-sm font-medium text-slate-600">
          โครงการที่ต้อง &quot;เข้าครบ&quot; ถึงจะผ่าน
        </legend>
        {projects.length === 0 && (
          <p className="text-sm text-slate-500">
            ยังไม่มีโครงการ — ไปสร้างที่หน้าจัดการโครงการก่อน
          </p>
        )}
        {projects.map((project) => (
          <label
            key={project.id}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <input type="checkbox" name="project_ids" value={project.id} />
            {project.code} — {project.name}
          </label>
        ))}
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังสร้าง..." : "สร้างเกณฑ์"}
      </button>
    </form>
  );
}
