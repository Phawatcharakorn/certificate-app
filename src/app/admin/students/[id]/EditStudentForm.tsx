"use client";

import { useActionState } from "react";
import { updateStudentProfile } from "../actions";
import type { Faculty } from "@/types/database";
import type { StudentDetail } from "@/lib/queries/admin-student-detail";
import { buttonPrimary, card, input, label } from "@/lib/ui";

export function EditStudentForm({
  studentId,
  student,
  faculties,
}: {
  studentId: string;
  student: StudentDetail;
  faculties: Faculty[];
}) {
  const boundAction = updateStudentProfile.bind(null, studentId);
  const [state, formAction, pending] = useActionState(
    boundAction,
    undefined,
  );

  return (
    <form
      action={formAction}
      key={`${student.full_name}-${student.nickname}-${student.faculty_id}-${student.enrolled_year}`}
      className={`${card} flex flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">ข้อมูลนิสิต</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={label}>รหัสนิสิต</label>
          <input
            value={student.student_code}
            disabled
            className={`${input} disabled:bg-slate-100 disabled:text-slate-400`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className={label}>
            ชื่อ-นามสกุล
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={student.full_name}
            required
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" className={label}>
            ชื่อเล่น
          </label>
          <input
            id="nickname"
            name="nickname"
            defaultValue={student.nickname ?? ""}
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="faculty_id" className={label}>
            คณะ
          </label>
          <select
            id="faculty_id"
            name="faculty_id"
            defaultValue={student.faculty_id}
            required
            className={input}
          >
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
            defaultValue={student.enrolled_year}
            required
            className={input}
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${buttonPrimary} w-fit`}
      >
        {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </button>
    </form>
  );
}
