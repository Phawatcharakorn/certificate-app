import type { SupabaseClient } from "@supabase/supabase-js";

export interface StudentProfile {
  fullName: string | null;
  nickname: string | null;
  studentCode: string | null;
}

export async function fetchStudentProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<StudentProfile> {
  const { data: student } = await supabase
    .from("students")
    .select("full_name, nickname, student_code")
    .eq("id", userId)
    .single();

  return {
    fullName: student?.full_name ?? null,
    nickname: student?.nickname ?? null,
    studentCode: student?.student_code ?? null,
  };
}
