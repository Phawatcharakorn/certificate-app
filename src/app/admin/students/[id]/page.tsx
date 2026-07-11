import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";
import type { Faculty } from "@/types/database";
import { EditStudentForm } from "./EditStudentForm";
import { ParticipationRow } from "./ParticipationRow";

interface StudentDetail {
  id: string;
  student_code: string;
  full_name: string;
  faculty_id: string;
  enrolled_year: number;
  faculties: { name: string } | null;
}

interface ParticipationDetail {
  id: string;
  status: "registered" | "attended" | "absent";
  joined_at: string;
  project: { id: string; code: string; name: string; event_date: string } | null;
}

interface CertificateRequestDetail {
  id: string;
  status: string;
  requested_at: string;
  certificate_type: { name: string } | null;
}

const REQUEST_STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: student } = await supabase
    .from("students")
    .select("id, student_code, full_name, faculty_id, enrolled_year, faculties(name)")
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const [{ data: faculties }, { data: participations }, { data: certRequests }] =
    await Promise.all([
      supabase.from("faculties").select("*").order("name"),
      supabase
        .from("participations")
        .select("id, status, joined_at, project:projects(id, code, name, event_date)")
        .eq("student_id", id)
        .order("joined_at", { ascending: false }),
      supabase
        .from("certificate_requests")
        .select("id, status, requested_at, certificate_type:certificate_types(name)")
        .eq("student_id", id)
        .order("requested_at", { ascending: false }),
    ]);

  return (
    <>
      <Header
        right={
          <Link href="/admin/students" className="underline hover:text-white">
            กลับรายชื่อนิสิต
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          {(student as unknown as StudentDetail).full_name}
        </h1>

        <EditStudentForm
          studentId={id}
          student={student as unknown as StudentDetail}
          faculties={(faculties as Faculty[]) ?? []}
        />

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">โครงการที่เข้าร่วม</h2>
          {(!participations || participations.length === 0) && (
            <p className="text-sm text-slate-500">ยังไม่ได้เข้าร่วมโครงการใด</p>
          )}
          <ul className="flex flex-col gap-2">
            {((participations as unknown as ParticipationDetail[]) ?? []).map(
              (p) => (
                <ParticipationRow key={p.id} studentId={id} participation={p} />
              ),
            )}
          </ul>
        </section>

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">คำร้องขอใบเซอร์</h2>
          {(!certRequests || certRequests.length === 0) && (
            <p className="text-sm text-slate-500">ยังไม่มีคำร้อง</p>
          )}
          <ul className="flex flex-col gap-2">
            {((certRequests as unknown as CertificateRequestDetail[]) ?? []).map(
              (r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
                >
                  <span className="text-slate-900">
                    {r.certificate_type?.name}
                  </span>
                  <span className="text-slate-500">
                    {REQUEST_STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </li>
              ),
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
