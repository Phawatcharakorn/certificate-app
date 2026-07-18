"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAdminStudentDetail,
  type AdminStudentDetailData,
} from "@/lib/queries/admin-student-detail";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import type { Faculty } from "@/types/database";
import { card } from "@/lib/ui";
import { EditStudentForm } from "./EditStudentForm";
import { ParticipationRow } from "./ParticipationRow";

const REQUEST_STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

export function StudentDetailClient({
  studentId,
  faculties,
  initialData,
}: {
  studentId: string;
  faculties: Faculty[];
  initialData: AdminStudentDetailData;
}) {
  const supabase = createClient();
  const queryKey = ["admin-student-detail", studentId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchAdminStudentDetail(supabase, studentId),
    initialData,
  });

  useRealtimeInvalidate(
    "admin-student-detail-changes",
    [
      { table: "students", filter: `id=eq.${studentId}` },
      { table: "participations", filter: `student_id=eq.${studentId}` },
      { table: "certificate_requests", filter: `student_id=eq.${studentId}` },
    ],
    queryKey,
  );

  const { student, participations, certRequests } = data;

  if (!student) {
    return <p className="text-sm text-slate-500">ไม่พบข้อมูลนิสิต</p>;
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900">
        {student.full_name}
        {student.nickname ? ` (${student.nickname})` : ""}
      </h1>

      <EditStudentForm
        studentId={studentId}
        student={student}
        faculties={faculties}
      />

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="font-semibold text-slate-900">โครงการที่เข้าร่วม</h2>
        {participations.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่ได้เข้าร่วมโครงการใด</p>
        )}
        <ul className="flex flex-col gap-2">
          {participations.map((p) => (
            <ParticipationRow key={p.id} studentId={studentId} participation={p} />
          ))}
        </ul>
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="font-semibold text-slate-900">คำร้องขอใบเซอร์</h2>
        {certRequests.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีคำร้อง</p>
        )}
        <ul className="flex flex-col gap-2">
          {certRequests.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
            >
              <span className="text-slate-900">{r.period?.name}</span>
              <span className="text-slate-500">
                {REQUEST_STATUS_LABEL[r.status] ?? r.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
