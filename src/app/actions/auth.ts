"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthFormState = { error?: string; message?: string } | undefined;

export async function registerStudent(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const studentCode = String(formData.get("student_code") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const facultyId = String(formData.get("faculty_id") ?? "");
  const enrolledYear = Number(formData.get("enrolled_year"));

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: period } = await supabase
    .from("registration_periods")
    .select("id")
    .eq("is_active", true)
    .lte("open_date", today)
    .gte("close_date", today)
    .maybeSingle();

  if (!period) {
    return { error: "ขณะนี้ปิดรับสมัครสมาชิกระบบ" };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
    { email, password },
  );

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message ?? "สมัครสมาชิกไม่สำเร็จ" };
  }

  // signUp() may not return an active session yet (e.g. email confirmation
  // required), so this insert would fail the students_insert_self RLS policy.
  // Use the service-role client instead — we already verified the auth user
  // was just created with this exact id.
  const adminClient = createAdminClient();
  const { error: insertError } = await adminClient.from("students").insert({
    id: signUpData.user.id,
    student_code: studentCode,
    full_name: fullName,
    faculty_id: facultyId,
    enrolled_year: enrolledYear,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  if (!signUpData.session) {
    return {
      message: "สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลที่ระบบส่งไปให้ก่อนเข้าสู่ระบบ",
    };
  }

  redirect("/dashboard");
}

export async function loginStudent(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function loginAdmin(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "เข้าสู่ระบบไม่สำเร็จ" };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "บัญชีนี้ไม่มีสิทธิ์แอดมิน" };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
