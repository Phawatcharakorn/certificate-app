import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types/database";

export interface ProjectWithFaculties extends Project {
  project_faculties: { faculty_id: string }[];
}

export interface ParticipationRow {
  project_id: string;
  status: string;
  joined_at: string;
  project: Project;
}

export interface DashboardData {
  fullName: string | null;
  joinedRows: ParticipationRow[];
  availableProjects: ProjectWithFaculties[];
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardData> {
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, faculty_id")
    .eq("id", userId)
    .single();

  const { data: participations } = await supabase
    .from("participations")
    .select("project_id, status, joined_at, project:projects(*)")
    .eq("student_id", userId)
    .order("joined_at", { ascending: false });

  const joinedRows = (participations as unknown as ParticipationRow[]) ?? [];
  const joinedProjectIds = new Set(joinedRows.map((row) => row.project_id));

  const { data: allProjects } = await supabase
    .from("projects")
    .select("*, project_faculties(faculty_id)")
    .order("event_date", { ascending: true });

  const availableProjects = (
    (allProjects as unknown as ProjectWithFaculties[]) ?? []
  ).filter((project) => {
    if (joinedProjectIds.has(project.id)) return false;
    if (project.target_faculty_mode === "all") return true;
    return project.project_faculties.some(
      (pf) => pf.faculty_id === student?.faculty_id,
    );
  });

  return {
    fullName: student?.full_name ?? null,
    joinedRows,
    availableProjects,
  };
}
