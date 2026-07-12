import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus } from "@/types/database";

export interface CertificateRequestInfo {
  id: string;
  status: CertificateRequestStatus;
  certificate_file_url: string | null;
  requested_at: string;
  updated_at: string;
}

export interface CertificateProgress {
  certificateTypeId: string;
  name: string;
  description: string | null;
  matched: number;
  total: number;
  percent: number;
  isComplete: boolean;
  isFailed: boolean;
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
// โครงการที่กำหนดไว้เป็น "รายการปกติ" หรือ "ชุดทางเลือก" มักจัดครั้งเดียวจบ — ถ้านิสิต
// ขาด (absent) โครงการที่จำเป็นไปแล้ว ถือว่าใบเซอร์นั้น "ไม่ผ่าน" ถาวร ไม่ใช่แค่ "กำลังสะสม"
// (isFailed) ยกเว้นกรณีมีชุดทางเลือกอื่นที่ยังไม่ขาดสักโครงการ ก็ยังลุ้นผ่านทางชุดนั้นได้
export async function fetchCertificateProgress(
  supabase: SupabaseClient,
  studentId: string,
): Promise<CertificateProgress[]> {
  const { data: certificateTypes } = await supabase
    .from("certificate_types")
    .select(
      "id, name, description, certificate_type_requirements(project_id, required, set_id)",
    );

  const { data: participations } = await supabase
    .from("participations")
    .select("project_id, status")
    .eq("student_id", studentId)
    .in("status", ["attended", "absent"]);

  const { data: requests } = await supabase
    .from("certificate_requests")
    .select(
      "id, certificate_type_id, status, certificate_file_url, requested_at, updated_at",
    )
    .eq("student_id", studentId);

  const attendedProjectIds = new Set(
    (participations ?? [])
      .filter((row) => row.status === "attended")
      .map((row) => row.project_id as string),
  );
  const absentProjectIds = new Set(
    (participations ?? [])
      .filter((row) => row.status === "absent")
      .map((row) => row.project_id as string),
  );

  const requestByType = new Map<string, CertificateRequestInfo>();
  for (const req of requests ?? []) {
    requestByType.set(req.certificate_type_id as string, {
      id: req.id as string,
      status: req.status as CertificateRequestStatus,
      certificate_file_url: req.certificate_file_url as string | null,
      requested_at: req.requested_at as string,
      updated_at: req.updated_at as string,
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
      const flatFailed = flatProjectIds.some((id) => absentProjectIds.has(id));

      // เลือกชุดที่ใกล้ผ่านที่สุด (matched มากสุด) มาแสดงผล โดยเลี่ยงชุดที่ขาดไปแล้ว
      // (blocked) ก่อน — ถ้าทุกชุดขาดหมด ค่อยเลือกชุดที่ดีที่สุดมาแสดง (แต่ถือว่าไม่ผ่าน)
      let bestSetTotal = 0;
      let bestSetMatched = 0;
      let bestSetBlocked = false;
      let everySetBlocked = setGroups.size > 0;
      for (const projectIds of setGroups.values()) {
        const matched = projectIds.filter((id) =>
          attendedProjectIds.has(id),
        ).length;
        const blocked = projectIds.some((id) => absentProjectIds.has(id));
        if (!blocked) everySetBlocked = false;

        const isBetter =
          bestSetTotal === 0 ||
          (bestSetBlocked && !blocked) ||
          (blocked === bestSetBlocked && matched > bestSetMatched);

        if (isBetter) {
          bestSetMatched = matched;
          bestSetTotal = projectIds.length;
          bestSetBlocked = blocked;
        }
      }

      const total = flatTotal + bestSetTotal;
      const matched = flatMatched + bestSetMatched;
      const percent = total === 0 ? 0 : Math.round((matched / total) * 100);
      const isFailed = flatFailed || everySetBlocked;

      return {
        certificateTypeId: type.id,
        name: type.name,
        description: type.description,
        matched,
        total,
        percent,
        isComplete: total > 0 && matched === total,
        isFailed,
        request: requestByType.get(type.id) ?? null,
      };
    },
  );
}
