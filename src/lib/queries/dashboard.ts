import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types/database";

export interface ProjectWithFaculties extends Project {
  project_faculties: { faculty_id: string }[];
  participantCount: number;
  eligible: boolean;
}

export function isProjectEligible(
  project: { target_faculty_mode: string; project_faculties: { faculty_id: string }[] },
  studentFacultyId: string | null | undefined,
) {
  return (
    project.target_faculty_mode === "all" ||
    project.project_faculties.some((pf) => pf.faculty_id === studentFacultyId)
  );
}

export interface ParticipationRow {
  id: string;
  project_id: string;
  status: string;
  joined_at: string;
  project: Project;
}

export interface DashboardData {
  fullName: string | null;
  nickname: string | null;
  studentCode: string | null;
  joinedRows: ParticipationRow[];
  availableProjects: ProjectWithFaculties[];
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardData> {
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, nickname, student_code, faculty_id")
    .eq("id", userId)
    .single();

  const { data: participations } = await supabase
    .from("participations")
    .select("id, project_id, status, joined_at, project:projects(*)")
    .eq("student_id", userId)
    .order("joined_at", { ascending: false });

  const joinedRows = (participations as unknown as ParticipationRow[]) ?? [];
  const joinedProjectIds = new Set(joinedRows.map((row) => row.project_id));

  const [{ data: allProjects }, { data: counts }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_faculties(faculty_id)")
      .order("event_date", { ascending: true }),
    supabase.from("project_participant_counts").select("project_id, participant_count"),
  ]);

  const countByProject = new Map<string, number>(
    (counts ?? []).map((row) => [
      row.project_id as string,
      row.participant_count as number,
    ]),
  );

  const availableProjects = (
    (allProjects as unknown as ProjectWithFaculties[]) ?? []
  )
    .filter((project) => !joinedProjectIds.has(project.id))
    .map((project) => ({
      ...project,
      participantCount: countByProject.get(project.id) ?? 0,
      eligible: isProjectEligible(project, student?.faculty_id),
    }));

  return {
    fullName: student?.full_name ?? null,
    nickname: student?.nickname ?? null,
    studentCode: student?.student_code ?? null,
    joinedRows,
    availableProjects,
  };
}
