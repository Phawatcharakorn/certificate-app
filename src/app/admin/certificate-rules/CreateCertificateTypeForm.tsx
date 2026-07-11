"use client";

import { useActionState } from "react";
import { createCertificateType } from "./actions";
import type { Project } from "@/types/database";

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
      className="flex flex-col gap-4 max-w-lg w-full border rounded p-6"
    >
      <h2 className="font-semibold">สร้างเกณฑ์ใบเซอร์ใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name">ชื่อใบเซอร์</label>
        <input
          id="name"
          name="name"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">รายละเอียด</label>
        <textarea
          id="description"
          name="description"
          className="border rounded px-3 py-2"
        />
      </div>

      <fieldset className="flex flex-col gap-2 border rounded p-3">
        <legend className="text-sm font-medium">
          โครงการที่ต้อง &quot;เข้าครบ&quot; ถึงจะผ่าน
        </legend>
        {projects.length === 0 && (
          <p className="text-sm text-gray-500">ยังไม่มีโครงการ — ไปสร้างที่หน้าจัดการโครงการก่อน</p>
        )}
        {projects.map((project) => (
          <label key={project.id} className="flex items-center gap-2">
            <input type="checkbox" name="project_ids" value={project.id} />
            {project.code} — {project.name}
          </label>
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
        {pending ? "กำลังสร้าง..." : "สร้างเกณฑ์"}
      </button>
    </form>
  );
}
