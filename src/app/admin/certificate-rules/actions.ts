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

  const setCount = Number(formData.get("set_count") ?? 0);
  const sets: { name: string; projectIds: string[] }[] = [];
  for (let i = 0; i < setCount; i++) {
    const setName = String(formData.get(`set_name_${i}`) ?? "").trim();
    const setProjectIds = formData.getAll(`set_project_ids_${i}`).map(String);
    if (setName && setProjectIds.length > 0) {
      sets.push({ name: setName, projectIds: setProjectIds });
    }
  }

  if (!name) {
    return { error: "กรุณากรอกชื่อใบเซอร์" };
  }

  if (projectIds.length === 0 && sets.length === 0) {
    return {
      error:
        "กรุณาเลือกโครงการอย่างน้อย 1 โครงการ หรือสร้างชุดอย่างน้อย 1 ชุด",
    };
  }

  const { data: certificateType, error: insertError } = await supabase
    .from("certificate_types")
    .insert({ name, description: description || null })
    .select("id")
    .single();

  if (insertError || !certificateType) {
    return { error: insertError?.message ?? "สร้างเกณฑ์ใบเซอร์ไม่สำเร็จ" };
  }

  if (projectIds.length > 0) {
    const { error: requirementsError } = await supabase
      .from("certificate_type_requirements")
      .insert(
        projectIds.map((projectId) => ({
          certificate_type_id: certificateType.id,
          project_id: projectId,
          required: true,
          set_id: null,
        })),
      );

    if (requirementsError) {
      return { error: requirementsError.message };
    }
  }

  for (const set of sets) {
    const { data: setRow, error: setError } = await supabase
      .from("certificate_type_sets")
      .insert({ certificate_type_id: certificateType.id, name: set.name })
      .select("id")
      .single();

    if (setError || !setRow) {
      return { error: setError?.message ?? "สร้างชุดไม่สำเร็จ" };
    }

    const { error: setReqError } = await supabase
      .from("certificate_type_requirements")
      .insert(
        set.projectIds.map((projectId) => ({
          certificate_type_id: certificateType.id,
          project_id: projectId,
          required: true,
          set_id: setRow.id,
        })),
      );

    if (setReqError) {
      return { error: setReqError.message };
    }
  }

  revalidatePath("/admin/certificate-rules");
  return { message: "สร้างเกณฑ์ใบเซอร์สำเร็จ" };
}
