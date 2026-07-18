"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminFormState = { error?: string; message?: string } | undefined;

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;

export async function createAdmin(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "admin").trim() || "admin";

  if (!username || !password) {
    return { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "ชื่อผู้ใช้ต้องมี 3-32 ตัวอักษร ใช้ได้เฉพาะ a-z, 0-9, . _ - เท่านั้น",
    };
  }

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const adminClient = createAdminClient();

  // Supabase Auth requires an email-shaped identifier — synthesize one from
  // the username so admins can be created/logged in without a real inbox.
  const syntheticEmail = `${username}@admin.local`;

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return { error: createError?.message ?? "สร้างบัญชีไม่สำเร็จ" };
  }

  const { error: insertError } = await adminClient.from("admins").insert({
    id: created.user.id,
    email: syntheticEmail,
    username,
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
