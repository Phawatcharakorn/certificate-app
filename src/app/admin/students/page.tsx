import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { Header } from "@/components/layout/Header";
import { card, input } from "@/lib/ui";

interface StudentRow {
  id: string;
  student_code: string;
  full_name: string;
  enrolled_year: number;
  faculties: { name: string } | null;
  participations: { status: string }[];
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { q } = await searchParams;

  let query = supabase
    .from("students")
    .select(
      "id, student_code, full_name, enrolled_year, faculties(name), participations(status)",
    )
    .order("full_name");

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,student_code.ilike.%${q}%`);
  }

  const { data: students } = await query;

  return (
    <>
      <Header
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">จัดการนิสิต</h1>

        <form className={`${card} flex flex-col gap-3 sm:flex-row sm:items-end`}>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="q" className="text-sm font-medium text-slate-600">
              ค้นหาชื่อหรือรหัสนิสิต
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
              placeholder="เช่น สมชาย หรือ 6512345678"
              className={input}
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-150 hover:bg-blue-800"
          >
            ค้นหา
          </button>
        </form>

        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="py-2 pr-4">รหัสนิสิต</th>
                <th className="py-2 pr-4">ชื่อ-นามสกุล</th>
                <th className="py-2 pr-4">คณะ</th>
                <th className="py-2 pr-4">ปีที่เข้าเรียน</th>
                <th className="py-2 pr-4">เข้าร่วม/ผ่านแล้ว</th>
                <th className="py-2 pr-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {((students as unknown as StudentRow[]) ?? []).map((student) => {
                const total = student.participations?.length ?? 0;
                const attended =
                  student.participations?.filter(
                    (p) => p.status === "attended",
                  ).length ?? 0;
                return (
                  <tr
                    key={student.id}
                    className="border-b border-slate-50 text-slate-700"
                  >
                    <td className="py-2 pr-4">{student.student_code}</td>
                    <td className="py-2 pr-4 text-slate-900">
                      {student.full_name}
                    </td>
                    <td className="py-2 pr-4">
                      {student.faculties?.name ?? "-"}
                    </td>
                    <td className="py-2 pr-4">{student.enrolled_year}</td>
                    <td className="py-2 pr-4">
                      {total}/{attended}
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-blue-600 underline"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    ไม่พบนิสิต
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
