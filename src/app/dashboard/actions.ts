"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/supabase/require-student";

export async function joinProject(projectId: string) {
  const { supabase, user } = await requireStudent();

  const { data: project } = await supabase
    .from("projects")
    .select("capacity, target_faculty_mode, project_faculties(faculty_id)")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    throw new Error("ไม่พบโครงการนี้");
  }

  if (project.target_faculty_mode === "specific") {
    const { data: student } = await supabase
      .from("students")
      .select("faculty_id")
      .eq("id", user.id)
      .single();

    const eligible = (
      project.project_faculties as { faculty_id: string }[]
    ).some((pf) => pf.faculty_id === student?.faculty_id);

    if (!eligible) {
      throw new Error("โครงการนี้จำกัดเฉพาะบางคณะ คุณไม่มีสิทธิ์เข้าร่วม");
    }
  }

  if (project?.capacity !== null && project?.capacity !== undefined) {
    const { data: countRow } = await supabase
      .from("project_participant_counts")
      .select("participant_count")
      .eq("project_id", projectId)
      .maybeSingle();

    const currentCount = countRow?.participant_count ?? 0;
    if (currentCount >= project.capacity) {
      throw new Error("โครงการนี้เต็มแล้ว");
    }
  }

  const { error } = await supabase
    .from("participations")
    .insert({ student_id: user.id, project_id: projectId });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects/[id]", "page");
}

export async function cancelParticipation(
  participationId: string,
  projectId?: string,
) {
  const { supabase, user } = await requireStudent();

  const { error } = await supabase
    .from("participations")
    .delete()
    .eq("id", participationId)
    .eq("student_id", user.id)
    .eq("status", "registered");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  else revalidatePath("/projects/[id]", "page");
}
