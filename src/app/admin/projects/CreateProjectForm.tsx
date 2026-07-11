"use client";

import { useActionState, useState } from "react";
import { createProject } from "./actions";
import type { Faculty } from "@/types/database";
import { buttonPrimary, card, input, label } from "@/lib/ui";

export function CreateProjectForm({ faculties }: { faculties: Faculty[] }) {
  const [state, formAction, pending] = useActionState(
    createProject,
    undefined,
  );
  const [mode, setMode] = useState<"all" | "specific">("all");

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} mx-auto flex w-full max-w-lg flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">สร้างโครงการใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="code" className={label}>
          รหัสโครงการ
        </label>
        <input id="code" name="code" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={label}>
          ชื่อโครงการ
        </label>
        <input id="name" name="name" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={label}>
          รายละเอียด
        </label>
        <textarea id="description" name="description" className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event_date" className={label}>
          วันที่จัดงาน
        </label>
        <input
          id="event_date"
          name="event_date"
          type="date"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1 rounded-xl border-2 border-red-200 bg-red-50 p-3">
        <label htmlFor="capacity" className="text-sm font-semibold text-red-700">
          จำกัดจำนวนที่นั่ง (เว้นว่างไว้ = ไม่จำกัด)
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          placeholder="เช่น 30"
          className="w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className={label}>
          สถานที่
        </label>
        <input id="location" name="location" className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="duration" className={label}>
          ระยะเวลา
        </label>
        <input
          id="duration"
          name="duration"
          placeholder='เช่น "3 ชั่วโมง"'
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="responsible_person" className={label}>
          ผู้รับผิดชอบ
        </label>
        <input
          id="responsible_person"
          name="responsible_person"
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="organizer_office" className={label}>
          หน่วยงานผู้จัด
        </label>
        <input
          id="organizer_office"
          name="organizer_office"
          placeholder="สำนักงานวิทยาเขต งานบริหารกิจการนิสิตและการกีฬา"
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="target_faculty_mode" className={label}>
          คณะที่เข้าร่วมได้
        </label>
        <select
          id="target_faculty_mode"
          name="target_faculty_mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as "all" | "specific")}
          className={input}
        >
          <option value="all">ทุกคณะ</option>
          <option value="specific">เฉพาะบางคณะ</option>
        </select>
      </div>

      {mode === "specific" && (
        <fieldset className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
          <legend className="text-sm font-medium text-slate-600">
            เลือกคณะ
          </legend>
          {faculties.map((faculty) => (
            <label
              key={faculty.id}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input type="checkbox" name="faculty_ids" value={faculty.id} />
              {faculty.name}
            </label>
          ))}
        </fieldset>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังสร้าง..." : "สร้างโครงการ"}
      </button>
    </form>
  );
}
