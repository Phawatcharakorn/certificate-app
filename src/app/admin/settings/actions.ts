"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export type SettingsFormState = { error?: string; message?: string } | undefined;

export async function createRegistrationPeriod(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { supabase } = await requireAdmin();

  const openDate = String(formData.get("open_date") ?? "");
  const closeDate = String(formData.get("close_date") ?? "");
  const isActive = formData.get("is_active") === "on";

  if (!openDate || !closeDate) {
    return { error: "กรุณากรอกวันที่เปิด-ปิดรับสมัคร" };
  }

  const { error } = await supabase.from("registration_periods").insert({
    open_date: openDate,
    close_date: closeDate,
    is_active: isActive,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { message: "ตั้งค่าช่วงเวลาเปิดรับสมัครสำเร็จ" };
}

export async function createCertificateTemplate(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const tier = String(formData.get("tier") ?? "");
  const backgroundImage = formData.get("background_image") as File | null;

  const fields = ["full_name", "student_code", "certificate_name", "date"] as const;
  const fieldPositions: Record<string, { x: number; y: number }> = {};

  for (const field of fields) {
    const x = Number(formData.get(`${field}_x`));
    const y = Number(formData.get(`${field}_y`));
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      fieldPositions[field] = { x, y };
    }
  }

  if (!name || !tier || !backgroundImage || backgroundImage.size === 0) {
    return { error: "กรุณากรอกชื่อ template, เลือกระดับ และอัปโหลดพื้นหลัง" };
  }

  const filePath = `${crypto.randomUUID()}-${backgroundImage.name}`;
  const { error: uploadError } = await supabase.storage
    .from("certificate-templates")
    .upload(filePath, backgroundImage, {
      contentType: backgroundImage.type || "image/png",
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from("certificate-templates")
    .getPublicUrl(filePath);

  const { error: upsertError } = await supabase
    .from("certificate_templates")
    .upsert(
      {
        name,
        tier,
        background_image_url: publicUrlData.publicUrl,
        field_positions: fieldPositions,
      },
      { onConflict: "tier" },
    );

  if (upsertError) {
    return { error: upsertError.message };
  }

  revalidatePath("/admin/settings");
  return { message: "สร้าง template ใบเซอร์สำเร็จ" };
}
