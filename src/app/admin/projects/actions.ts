"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import type { TargetFacultyMode } from "@/types/database";

export type ProjectFormState = { error?: string; message?: string } | undefined;

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const { supabase } = await requireAdmin();

  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const eventDate = String(formData.get("event_date") ?? "");
  const location = String(formData.get("location") ?? "");
  const duration = String(formData.get("duration") ?? "");
  const responsiblePerson = String(formData.get("responsible_person") ?? "");
  const organizerOffice = String(formData.get("organizer_office") ?? "");
  const targetFacultyMode = String(
    formData.get("target_faculty_mode") ?? "all",
  ) as TargetFacultyMode;
  const facultyIds = formData.getAll("faculty_ids").map(String);

  if (!code || !name || !eventDate) {
    return { error: "กรุณากรอกรหัส, ชื่อโครงการ และวันที่จัดงาน" };
  }

  if (targetFacultyMode === "specific" && facultyIds.length === 0) {
    return { error: "กรุณาเลือกคณะที่เข้าร่วมได้อย่างน้อย 1 คณะ" };
  }

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      code,
      name,
      description: description || null,
      event_date: eventDate,
      location: location || null,
      duration: duration || null,
      responsible_person: responsiblePerson || null,
      ...(organizerOffice ? { organizer_office: organizerOffice } : {}),
      target_faculty_mode: targetFacultyMode,
    })
    .select("id")
    .single();

  if (insertError || !project) {
    return { error: insertError?.message ?? "สร้างโครงการไม่สำเร็จ" };
  }

  if (targetFacultyMode === "specific") {
    const { error: linkError } = await supabase
      .from("project_faculties")
      .insert(
        facultyIds.map((facultyId) => ({
          project_id: project.id,
          faculty_id: facultyId,
        })),
      );

    if (linkError) {
      return { error: linkError.message };
    }
  }

  revalidatePath("/admin/projects");
  return { message: "สร้างโครงการสำเร็จ" };
}
