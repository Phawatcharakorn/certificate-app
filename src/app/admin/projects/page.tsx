import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { CreateProjectForm } from "./CreateProjectForm";
import type { Faculty } from "@/types/database";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

interface ProjectRow {
  id: string;
  code: string;
  name: string;
  event_date: string;
  location: string | null;
  target_faculty_mode: "all" | "specific";
  capacity: number | null;
  project_faculties: { faculties: { name: string } | null }[];
  participations: { id: string }[];
}

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("name");

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, code, name, event_date, location, target_faculty_mode, capacity, project_faculties(faculties(name)), participations(id)",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <Header
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">จัดการโครงการ</h1>

        <CreateProjectForm faculties={(faculties as Faculty[]) ?? []} />

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900">
            รายการโครงการทั้งหมด
          </h2>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="py-2 pr-4">รหัส</th>
                  <th className="py-2 pr-4">ชื่อโครงการ</th>
                  <th className="py-2 pr-4">วันที่</th>
                  <th className="py-2 pr-4">สถานที่</th>
                  <th className="py-2 pr-4">คณะที่เข้าร่วมได้</th>
                  <th className="py-2 pr-4">ที่นั่ง</th>
                  <th className="py-2 pr-4">ผู้เข้าร่วม</th>
                </tr>
              </thead>
              <tbody>
                {((projects as unknown as ProjectRow[]) ?? []).map(
                  (project) => {
                    const joined = project.participations?.length ?? 0;
                    const isFull =
                      project.capacity !== null && joined >= project.capacity;
                    return (
                      <tr
                        key={project.id}
                        className="border-b border-slate-50 text-slate-700"
                      >
                        <td className="py-2 pr-4">{project.code}</td>
                        <td className="py-2 pr-4 text-slate-900">
                          {project.name}
                        </td>
                        <td className="py-2 pr-4">{project.event_date}</td>
                        <td className="py-2 pr-4">
                          {project.location ?? "-"}
                        </td>
                        <td className="py-2 pr-4">
                          {project.target_faculty_mode === "all"
                            ? "ทุกคณะ"
                            : project.project_faculties
                                .map((pf) => pf.faculties?.name)
                                .filter(Boolean)
                                .join(", ")}
                        </td>
                        <td className="py-2 pr-4">
                          {project.capacity === null ? (
                            <span className="text-slate-400">ไม่จำกัด</span>
                          ) : (
                            <span
                              className={
                                isFull
                                  ? "font-medium text-red-600"
                                  : "text-slate-700"
                              }
                            >
                              {joined}/{project.capacity}
                              {isFull ? " (เต็ม)" : ""}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <a
                            href={`/api/admin/export/projects/${project.id}/participants`}
                            className="text-blue-600 underline"
                          >
                            Export
                          </a>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
