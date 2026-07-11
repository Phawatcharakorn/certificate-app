"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchAdminStudents, type AdminStudentRow } from "@/lib/queries/admin-students";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import type { Faculty } from "@/types/database";
import { card, input } from "@/lib/ui";

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
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              facultyId === null
                ? "bg-blue-600 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            ทุกคณะ
          </button>
          {faculties.map((faculty) => (
            <button
              key={faculty.id}
              type="button"
              onClick={() => setFacultyId(faculty.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                facultyId === faculty.id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
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

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="py-2 pr-4">รหัสนิสิต</th>
              <th className="py-2 pr-4">ชื่อ-นามสกุล</th>
              <th className="py-2 pr-4">ชื่อเล่น</th>
              <th className="py-2 pr-4">คณะ</th>
              <th className="py-2 pr-4">ปีที่เข้าเรียน</th>
              <th className="py-2 pr-4">เข้าร่วม/ผ่านแล้ว</th>
              <th className="py-2 pr-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => {
              const total = student.participations?.length ?? 0;
              const attended =
                student.participations?.filter((p) => p.status === "attended")
                  .length ?? 0;
              return (
                <tr
                  key={student.id}
                  className="border-b border-slate-50 text-slate-700"
                >
                  <td className="py-2 pr-4">{student.student_code}</td>
                  <td className="py-2 pr-4 text-slate-900">
                    {student.full_name}
                  </td>
                  <td className="py-2 pr-4">{student.nickname ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {student.faculties?.name ?? "-"}
                  </td>
                  <td className="py-2 pr-4">{student.enrolled_year}</td>
                  <td className="py-2 pr-4">
                    {total}/{attended}
                  </td>
                  <td className="py-2 pr-4">
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
