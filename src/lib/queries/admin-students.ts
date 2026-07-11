import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminStudentRow {
  id: string;
  student_code: string;
  full_name: string;
  nickname: string | null;
  enrolled_year: number;
  faculty_id: string;
  faculties: { name: string } | null;
  participations: { status: string }[];
}

export async function fetchAdminStudents(
  supabase: SupabaseClient,
  opts?: { q?: string; facultyId?: string },
): Promise<AdminStudentRow[]> {
  let query = supabase
    .from("students")
    .select(
      "id, student_code, full_name, nickname, enrolled_year, faculty_id, faculties(name), participations(status)",
    )
    .order("full_name");

  if (opts?.facultyId) {
    query = query.eq("faculty_id", opts.facultyId);
  }

  if (opts?.q) {
    query = query.or(
      `full_name.ilike.%${opts.q}%,student_code.ilike.%${opts.q}%,nickname.ilike.%${opts.q}%`,
    );
  }

  const { data } = await query;
  return (data as unknown as AdminStudentRow[]) ?? [];
}
