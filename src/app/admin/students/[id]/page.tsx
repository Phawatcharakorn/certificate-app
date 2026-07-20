import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { Faculty } from "@/types/database";
import { fetchAdminStudentDetail } from "@/lib/queries/admin-student-detail";
import { StudentDetailClient } from "./StudentDetailClient";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [initialData, { data: faculties }] = await Promise.all([
    fetchAdminStudentDetail(supabase, id),
    supabase.from("faculties").select("*").order("name"),
  ]);

  if (!initialData.student) {
    notFound();
  }

  return (
    <>
      <AdminHeader
        crumbs={[
          { label: "จัดการนิสิต", href: "/admin/students" },
          { label: initialData.student.full_name },
        ]}
        backHref="/admin/students"
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <StudentDetailClient
          studentId={id}
          faculties={(faculties as Faculty[]) ?? []}
          initialData={initialData}
        />
      </main>
    </>
  );
}
