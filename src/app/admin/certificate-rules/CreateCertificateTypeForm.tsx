"use client";

import { useActionState, useRef, useState } from "react";
import { createCertificateType } from "./actions";
import type { Project } from "@/types/database";
import { buttonPrimary, buttonSecondary, card, input, label } from "@/lib/ui";

export function CreateCertificateTypeForm({
  projects,
}: {
  projects: Project[];
}) {
  const [state, formAction, pending] = useActionState(
    createCertificateType,
    undefined,
  );
  const [setKeys, setSetKeys] = useState<number[]>([]);
  const nextKey = useRef(0);

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} mx-auto flex w-full max-w-lg flex-col gap-4`}
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
          รายการปกติ — ต้องเข้าร่วมให้ครบ &quot;ทุกโครงการ&quot; ที่เลือกไว้
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

      <input type="hidden" name="set_count" value={setKeys.length} />

      {setKeys.map((key, index) => (
        <fieldset
          key={key}
          className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50/40 p-3"
        >
          <legend className="text-sm font-medium text-blue-700">
            ชุดทางเลือก {index + 1} — เข้าครบชุดนี้ชุดเดียวก็ผ่าน
          </legend>
          <input
            name={`set_name_${index}`}
            placeholder="ชื่อชุด เช่น สายเทคโนโลยี"
            required
            className={input}
          />
          {projects.map((project) => (
            <label
              key={project.id}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                name={`set_project_ids_${index}`}
                value={project.id}
              />
              {project.code} — {project.name}
            </label>
          ))}
          <button
            type="button"
            onClick={() =>
              setSetKeys((prev) => prev.filter((k) => k !== key))
            }
            className="w-fit text-xs text-red-600 underline"
          >
            ลบชุดนี้
          </button>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => {
          setSetKeys((prev) => [...prev, nextKey.current]);
          nextKey.current += 1;
        }}
        className={buttonSecondary}
      >
        + เพิ่มชุดทางเลือก
      </button>

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
