"use client";

import { useActionState } from "react";
import { registerStudent } from "@/app/actions/auth";
import type { Faculty } from "@/types/database";

export function RegisterForm({ faculties }: { faculties: Faculty[] }) {
  const [state, formAction, pending] = useActionState(
    registerStudent,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md w-full">
      <div className="flex flex-col gap-1">
        <label htmlFor="student_code">รหัสนิสิต</label>
        <input
          id="student_code"
          name="student_code"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="full_name">ชื่อ-นามสกุล</label>
        <input
          id="full_name"
          name="full_name"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="faculty_id">คณะ</label>
        <select
          id="faculty_id"
          name="faculty_id"
          required
          className="border rounded px-3 py-2"
        >
          <option value="">เลือกคณะ</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="enrolled_year">ปีที่เข้าเรียน (พ.ศ.)</label>
        <input
          id="enrolled_year"
          name="enrolled_year"
          type="number"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">รหัสผ่าน</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="border rounded px-3 py-2"
        />
      </div>

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.message && (
        <p className="text-green-700 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
