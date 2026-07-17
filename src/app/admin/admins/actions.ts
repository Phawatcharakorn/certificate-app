"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminFormState = { error?: string; message?: string } | undefined;

export async function createAdmin(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "admin").trim() || "admin";

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return { error: createError?.message ?? "สร้างบัญชีไม่สำเร็จ" };
  }

  const { error: insertError } = await adminClient.from("admins").insert({
    id: created.user.id,
    email,
    role,
  });

  if (insertError) {
    // Roll back the auth user so we don't leave an orphaned account behind.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { error: insertError.message };
  }

  revalidatePath("/admin/admins");
  return { message: "เพิ่มแอดมินสำเร็จ" };
}

export async function removeAdmin(adminId: string) {
  const { user } = await requireAdmin();

  if (adminId === user.id) {
    throw new Error("ไม่สามารถลบบัญชีแอดมินของตัวเองได้");
  }

  const adminClient = createAdminClient();

  const { error: deleteRowError } = await adminClient
    .from("admins")
    .delete()
    .eq("id", adminId);

  if (deleteRowError) {
    throw new Error(deleteRowError.message);
  }

  await adminClient.auth.admin.deleteUser(adminId);

  revalidatePath("/admin/admins");
}
