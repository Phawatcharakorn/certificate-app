"use client";

import { useActionState, useState } from "react";
import { createProject } from "./actions";
import type { Faculty } from "@/types/database";

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
      className="flex flex-col gap-4 max-w-lg w-full border rounded p-6"
    >
      <h2 className="font-semibold">สร้างโครงการใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="code">รหัสโครงการ</label>
        <input
          id="code"
          name="code"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name">ชื่อโครงการ</label>
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

      <div className="flex flex-col gap-1">
        <label htmlFor="event_date">วันที่จัดงาน</label>
        <input
          id="event_date"
          name="event_date"
          type="date"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location">สถานที่</label>
        <input
          id="location"
          name="location"
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="duration">ระยะเวลา</label>
        <input
          id="duration"
          name="duration"
          placeholder='เช่น "3 ชั่วโมง"'
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="responsible_person">ผู้รับผิดชอบ</label>
        <input
          id="responsible_person"
          name="responsible_person"
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="organizer_office">หน่วยงานผู้จัด</label>
        <input
          id="organizer_office"
          name="organizer_office"
          placeholder="สำนักงานวิทยาเขต งานบริหารกิจการนิสิตและการกีฬา"
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="target_faculty_mode">คณะที่เข้าร่วมได้</label>
        <select
          id="target_faculty_mode"
          name="target_faculty_mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as "all" | "specific")}
          className="border rounded px-3 py-2"
        >
          <option value="all">ทุกคณะ</option>
          <option value="specific">เฉพาะบางคณะ</option>
        </select>
      </div>

      {mode === "specific" && (
        <fieldset className="flex flex-col gap-2 border rounded p-3">
          <legend className="text-sm font-medium">เลือกคณะ</legend>
          {faculties.map((faculty) => (
            <label key={faculty.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="faculty_ids"
                value={faculty.id}
              />
              {faculty.name}
            </label>
          ))}
        </fieldset>
      )}

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.message && (
        <p className="text-green-700 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "กำลังสร้าง..." : "สร้างโครงการ"}
      </button>
    </form>
  );
}
