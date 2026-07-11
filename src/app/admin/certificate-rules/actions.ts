"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export type CertificateRuleFormState =
  | { error?: string; message?: string }
  | undefined;

export async function createCertificateType(
  _prevState: CertificateRuleFormState,
  formData: FormData,
): Promise<CertificateRuleFormState> {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const projectIds = formData.getAll("project_ids").map(String);

  if (!name) {
    return { error: "กรุณากรอกชื่อใบเซอร์" };
  }

  if (projectIds.length === 0) {
    return { error: "กรุณาเลือกโครงการที่ต้องเข้าครบอย่างน้อย 1 โครงการ" };
  }

  const { data: certificateType, error: insertError } = await supabase
    .from("certificate_types")
    .insert({ name, description: description || null })
    .select("id")
    .single();

  if (insertError || !certificateType) {
    return { error: insertError?.message ?? "สร้างเกณฑ์ใบเซอร์ไม่สำเร็จ" };
  }

  const { error: requirementsError } = await supabase
    .from("certificate_type_requirements")
    .insert(
      projectIds.map((projectId) => ({
        certificate_type_id: certificateType.id,
        project_id: projectId,
        required: true,
      })),
    );

  if (requirementsError) {
    return { error: requirementsError.message };
  }

  revalidatePath("/admin/certificate-rules");
  return { message: "สร้างเกณฑ์ใบเซอร์สำเร็จ" };
}
