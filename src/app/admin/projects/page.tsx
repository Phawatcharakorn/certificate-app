import { requireAdmin } from "@/lib/supabase/require-admin";
import { CreateProjectForm } from "./CreateProjectForm";
import type { Faculty } from "@/types/database";

interface ProjectRow {
  id: string;
  code: string;
  name: string;
  event_date: string;
  location: string | null;
  target_faculty_mode: "all" | "specific";
  project_faculties: { faculties: { name: string } | null }[];
}

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, code, name, event_date, location, target_faculty_mode, project_faculties(faculties(name))")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-xl font-semibold">จัดการโครงการ</h1>

      <CreateProjectForm faculties={(faculties as Faculty[]) ?? []} />

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">รายการโครงการทั้งหมด</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">รหัส</th>
              <th className="py-2 pr-4">ชื่อโครงการ</th>
              <th className="py-2 pr-4">วันที่</th>
              <th className="py-2 pr-4">สถานที่</th>
              <th className="py-2 pr-4">คณะที่เข้าร่วมได้</th>
              <th className="py-2 pr-4">ผู้เข้าร่วม</th>
            </tr>
          </thead>
          <tbody>
            {((projects as unknown as ProjectRow[]) ?? []).map((project) => (
              <tr key={project.id} className="border-b">
                <td className="py-2 pr-4">{project.code}</td>
                <td className="py-2 pr-4">{project.name}</td>
                <td className="py-2 pr-4">{project.event_date}</td>
                <td className="py-2 pr-4">{project.location ?? "-"}</td>
                <td className="py-2 pr-4">
                  {project.target_faculty_mode === "all"
                    ? "ทุกคณะ"
                    : project.project_faculties
                        .map((pf) => pf.faculties?.name)
                        .filter(Boolean)
                        .join(", ")}
                </td>
                <td className="py-2 pr-4">
                  <a
                    href={`/api/admin/export/projects/${project.id}/participants`}
                    className="underline"
                  >
                    Export
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
