import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types/database";

export interface PublicProject extends Project {
  participantCount: number;
}

export async function fetchPublicProjects(
  supabase: SupabaseClient,
  opts?: { upcomingOnly?: boolean; limit?: number },
): Promise<PublicProject[]> {
  let query = supabase
    .from("projects")
    .select(
      "id, code, name, description, event_date, location, duration, capacity, cover_image_url",
    )
    .order("event_date", { ascending: true });

  if (opts?.upcomingOnly) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.gte("event_date", today);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const [{ data: projects }, { data: counts }] = await Promise.all([
    query,
    supabase.from("project_participant_counts").select("project_id, participant_count"),
  ]);

  const countByProject = new Map<string, number>(
    (counts ?? []).map((row) => [
      row.project_id as string,
      row.participant_count as number,
    ]),
  );

  return ((projects as unknown as Project[]) ?? []).map((project) => ({
    ...project,
    participantCount: countByProject.get(project.id) ?? 0,
  }));
}
