"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchAdminStudents, type AdminStudentRow } from "@/lib/queries/admin-students";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import type { Faculty } from "@/types/database";
import {
  card,
  chipActive,
  chipInactive,
  input,
  tableCell,
  tableCellHead,
  tableHeadRow,
  tableRow,
  tableWrap,
} from "@/lib/ui";

export function StudentsListClient({
  faculties,
  initialData,
}: {
  faculties: Faculty[];
  initialData: AdminStudentRow[];
}) {
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const queryKey = ["admin-students", q, facultyId];

  const { data: students } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminStudents(supabase, { q, facultyId: facultyId ?? undefined }),
    initialData: q === "" && facultyId === null ? initialData : undefined,
  });

  useRealtimeInvalidate(
    "admin-students-changes",
    [{ table: "students" }, { table: "participations" }],
    queryKey,
  );

  const rows = students ?? [];

  return (
    <>
      <div className={`${card} flex flex-col gap-4`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFacultyId(null)}
            className={facultyId === null ? chipActive : chipInactive}
          >
            ทุกคณะ
          </button>
          {faculties.map((faculty) => (
            <button
              key={faculty.id}
              type="button"
              onClick={() => setFacultyId(faculty.id)}
              className={facultyId === faculty.id ? chipActive : chipInactive}
            >
              {faculty.name}
            </button>
          ))}
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาชื่อ, ชื่อเล่น หรือรหัสนิสิต"
          className={input}
        />
      </div>

      <div className={tableWrap}>
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className={tableHeadRow}>
              <th className={tableCellHead}>รหัสนิสิต</th>
              <th className={tableCellHead}>ชื่อ-นามสกุล</th>
              <th className={tableCellHead}>ชื่อเล่น</th>
              <th className={tableCellHead}>คณะ</th>
              <th className={tableCellHead}>ปีที่เข้าเรียน</th>
              <th className={tableCellHead}>เข้าร่วม/ผ่านแล้ว</th>
              <th className={tableCellHead}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => {
              const total = student.participations?.length ?? 0;
              const attended =
                student.participations?.filter((p) => p.status === "attended")
                  .length ?? 0;
              return (
                <tr key={student.id} className={tableRow}>
                  <td className={tableCell}>{student.student_code}</td>
                  <td className={`${tableCell} text-slate-900`}>
                    {student.full_name}
                  </td>
                  <td className={tableCell}>{student.nickname ?? "-"}</td>
                  <td className={tableCell}>
                    {student.faculties?.name ?? "-"}
                  </td>
                  <td className={tableCell}>{student.enrolled_year}</td>
                  <td className={tableCell}>
                    {total}/{attended}
                  </td>
                  <td className={tableCell}>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="text-blue-600 underline"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-slate-500">
                  ไม่พบนิสิต
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
