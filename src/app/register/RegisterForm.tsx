"use client";

import { useActionState } from "react";
import { registerStudent } from "@/app/actions/auth";
import type { Faculty } from "@/types/database";
import { buttonPrimary, input, label } from "@/lib/ui";

export function RegisterForm({ faculties }: { faculties: Faculty[] }) {
  const [state, formAction, pending] = useActionState(
    registerStudent,
    undefined,
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="student_code" className={label}>
          รหัสนิสิต
        </label>
        <input id="student_code" name="student_code" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className={label}>
          ชื่อ-นามสกุล
        </label>
        <input id="full_name" name="full_name" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className={label}>
          ชื่อเล่น
        </label>
        <input id="nickname" name="nickname" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="faculty_id" className={label}>
          คณะ
        </label>
        <select id="faculty_id" name="faculty_id" required className={input}>
          <option value="">เลือกคณะ</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="enrolled_year" className={label}>
          ปีที่เข้าเรียน (พ.ศ.)
        </label>
        <input
          id="enrolled_year"
          name="enrolled_year"
          type="number"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={label}>
          อีเมล
        </label>
        <input id="email" name="email" type="email" required className={input} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className={label}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={input}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
