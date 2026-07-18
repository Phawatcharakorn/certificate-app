import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParticipationStatus } from "@/types/database";

export interface StudentDetail {
  id: string;
  student_code: string;
  full_name: string;
  nickname: string | null;
  faculty_id: string;
  enrolled_year: number;
}

export interface ParticipationDetail {
  id: string;
  status: ParticipationStatus;
  joined_at: string;
  project: { id: string; code: string; name: string; event_date: string } | null;
}

export interface CertificateRequestDetail {
  id: string;
  status: string;
  requested_at: string;
  period: { name: string } | null;
}

export interface AdminStudentDetailData {
  student: StudentDetail | null;
  participations: ParticipationDetail[];
  certRequests: CertificateRequestDetail[];
}

export async function fetchAdminStudentDetail(
  supabase: SupabaseClient,
  studentId: string,
): Promise<AdminStudentDetailData> {
  const [{ data: student }, { data: participations }, { data: certRequests }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, student_code, full_name, nickname, faculty_id, enrolled_year")
        .eq("id", studentId)
        .maybeSingle(),
      supabase
        .from("participations")
        .select("id, status, joined_at, project:projects(id, code, name, event_date)")
        .eq("student_id", studentId)
        .order("joined_at", { ascending: false }),
      supabase
        .from("certificate_requests")
        .select("id, status, requested_at, period:academic_periods(name)")
        .eq("student_id", studentId)
        .order("requested_at", { ascending: false }),
    ]);

  return {
    student: (student as unknown as StudentDetail) ?? null,
    participations: (participations as unknown as ParticipationDetail[]) ?? [],
    certRequests: (certRequests as unknown as CertificateRequestDetail[]) ?? [],
  };
}
