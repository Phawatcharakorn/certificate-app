import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus } from "@/types/database";

export interface CertificateRequestInfo {
  id: string;
  status: CertificateRequestStatus;
  certificate_file_url: string | null;
}

export interface CertificateProgress {
  certificateTypeId: string;
  name: string;
  description: string | null;
  matched: number;
  total: number;
  percent: number;
  isComplete: boolean;
  request: CertificateRequestInfo | null;
}

interface CertificateTypeRow {
  id: string;
  name: string;
  description: string | null;
  certificate_type_requirements: { project_id: string; required: boolean }[];
}

// % ความคืบหน้า = (จำนวนโครงการที่เข้าร่วมแล้วใน rule นี้ / จำนวนโครงการทั้งหมดที่ required) × 100
// นับ "เข้าร่วมแล้ว" จากสถานะ 'attended' เท่านั้น (ไม่นับ 'registered' ที่ยังไม่มายืนยันตัวจริง)
export async function fetchCertificateProgress(
  supabase: SupabaseClient,
  studentId: string,
): Promise<CertificateProgress[]> {
  const { data: certificateTypes } = await supabase
    .from("certificate_types")
    .select(
      "id, name, description, certificate_type_requirements(project_id, required)",
    );

  const { data: attended } = await supabase
    .from("participations")
    .select("project_id")
    .eq("student_id", studentId)
    .eq("status", "attended");

  const { data: requests } = await supabase
    .from("certificate_requests")
    .select("id, certificate_type_id, status, certificate_file_url")
    .eq("student_id", studentId);

  const attendedProjectIds = new Set(
    (attended ?? []).map((row) => row.project_id as string),
  );

  const requestByType = new Map<string, CertificateRequestInfo>();
  for (const req of requests ?? []) {
    requestByType.set(req.certificate_type_id as string, {
      id: req.id as string,
      status: req.status as CertificateRequestStatus,
      certificate_file_url: req.certificate_file_url as string | null,
    });
  }

  return ((certificateTypes as unknown as CertificateTypeRow[]) ?? []).map(
    (type) => {
      const requiredProjectIds = type.certificate_type_requirements
        .filter((req) => req.required)
        .map((req) => req.project_id);

      const total = requiredProjectIds.length;
      const matched = requiredProjectIds.filter((id) =>
        attendedProjectIds.has(id),
      ).length;
      const percent = total === 0 ? 0 : Math.round((matched / total) * 100);

      return {
        certificateTypeId: type.id,
        name: type.name,
        description: type.description,
        matched,
        total,
        percent,
        isComplete: total > 0 && matched === total,
        request: requestByType.get(type.id) ?? null,
      };
    },
  );
}
