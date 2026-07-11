"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/supabase/require-student";

export async function joinProject(projectId: string) {
  const { supabase, user } = await requireStudent();

  const { error } = await supabase
    .from("participations")
    .insert({ student_id: user.id, project_id: projectId });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
