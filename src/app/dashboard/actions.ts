"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("participations")
    .insert({ student_id: user.id, project_id: projectId });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
