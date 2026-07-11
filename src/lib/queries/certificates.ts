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
  certificate_type_requirements: {
    project_id: string;
    required: boolean;
    set_id: string | null;
  }[];
}

// เกณฑ์ผ่านของใบเซอร์แต่ละใบ = "รายการปกติ" (set_id เป็น null) ต้องเข้าครบทุกอัน
// บวกกับ (ถ้ามี "ชุดทางเลือก") ต้องเข้าครบอย่างน้อย 1 ชุด — ชุดที่ใกล้ผ่านที่สุดจะถูก
// เลือกมาแสดง % ความคืบหน้า ไม่นับรวมทุกชุดพร้อมกัน
// นับ "เข้าร่วมแล้ว" จากสถานะ 'attended' เท่านั้น (ไม่นับ 'registered' ที่ยังไม่มายืนยันตัวจริง)
export async function fetchCertificateProgress(
  supabase: SupabaseClient,
  studentId: string,
): Promise<CertificateProgress[]> {
  const { data: certificateTypes } = await supabase
    .from("certificate_types")
    .select(
      "id, name, description, certificate_type_requirements(project_id, required, set_id)",
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
      const flatProjectIds = type.certificate_type_requirements
        .filter((req) => req.required && !req.set_id)
        .map((req) => req.project_id);

      const setGroups = new Map<string, string[]>();
      for (const req of type.certificate_type_requirements) {
        if (!req.required || !req.set_id) continue;
        const list = setGroups.get(req.set_id) ?? [];
        list.push(req.project_id);
        setGroups.set(req.set_id, list);
      }

      const flatTotal = flatProjectIds.length;
      const flatMatched = flatProjectIds.filter((id) =>
        attendedProjectIds.has(id),
      ).length;

      // เลือกชุดที่ใกล้ผ่านที่สุด (matched มากสุด) มาแสดงผล — ถ้าไม่มีชุดเลยก็ไม่มีผล
      let bestSetTotal = 0;
      let bestSetMatched = 0;
      for (const projectIds of setGroups.values()) {
        const matched = projectIds.filter((id) =>
          attendedProjectIds.has(id),
        ).length;
        if (matched > bestSetMatched || bestSetTotal === 0) {
          bestSetMatched = matched;
          bestSetTotal = projectIds.length;
        }
      }

      const total = flatTotal + bestSetTotal;
      const matched = flatMatched + bestSetMatched;
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
