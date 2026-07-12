import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { Header } from "@/components/layout/Header";
import { fetchAdminStudents } from "@/lib/queries/admin-students";
import { StudentsListClient } from "./StudentsListClient";
import type { Faculty } from "@/types/database";

export default async function AdminStudentsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: faculties }, initialData] = await Promise.all([
    supabase.from("faculties").select("*").order("name"),
    fetchAdminStudents(supabase),
  ]);

  return (
    <>
      <Header
        homeHref="/admin"
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">จัดการนิสิต</h1>

        <StudentsListClient
          faculties={(faculties as Faculty[]) ?? []}
          initialData={initialData}
        />
      </main>
    </>
  );
}
