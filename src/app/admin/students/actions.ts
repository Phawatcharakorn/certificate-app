"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import type { ParticipationStatus } from "@/types/database";

export type StudentFormState = { error?: string; message?: string } | undefined;

export async function updateStudentProfile(
  studentId: string,
  _prevState: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  const { supabase } = await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  const facultyId = String(formData.get("faculty_id") ?? "");
  const enrolledYear = Number(formData.get("enrolled_year"));

  if (!fullName || !facultyId || !enrolledYear) {
    return { error: "กรุณากรอกข้อมูลให้ครบ" };
  }

  const { error } = await supabase
    .from("students")
    .update({
      full_name: fullName,
      nickname: nickname || null,
      faculty_id: facultyId,
      enrolled_year: enrolledYear,
    })
    .eq("id", studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  return { message: "บันทึกข้อมูลนิสิตสำเร็จ" };
}

export async function updateParticipationStatus(
  studentId: string,
  participationId: string,
  status: ParticipationStatus,
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("participations")
    .update({ status })
    .eq("id", participationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/students/${studentId}`);
}
