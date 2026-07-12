import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types/database";

export interface ProjectDetail extends Project {
  participantCount: number;
  project_faculties: { faculty_id: string; faculties: { name: string } | null }[];
}

export async function fetchProjectDetail(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectDetail | null> {
  const [{ data: project }, { data: countRow }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_faculties(faculty_id, faculties(name))")
      .eq("id", projectId)
      .maybeSingle(),
    supabase
      .from("project_participant_counts")
      .select("participant_count")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  if (!project) return null;

  return {
    ...(project as unknown as ProjectDetail),
    participantCount: countRow?.participant_count ?? 0,
  };
}

export interface StudentParticipationForProject {
  id: string;
  status: string;
}

export async function fetchStudentParticipationForProject(
  supabase: SupabaseClient,
  studentId: string,
  projectId: string,
): Promise<StudentParticipationForProject | null> {
  const { data } = await supabase
    .from("participations")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("project_id", projectId)
    .maybeSingle();

  return data as StudentParticipationForProject | null;
}
