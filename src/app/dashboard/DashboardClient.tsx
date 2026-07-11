"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData, type DashboardData } from "@/lib/queries/dashboard";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { signOut } from "@/app/actions/auth";
import { joinProject } from "./actions";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

export function DashboardClient({
  userId,
  initialData,
}: {
  userId: string;
  initialData: DashboardData;
}) {
  const supabase = createClient();
  const queryKey = ["dashboard", userId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchDashboardData(supabase, userId),
    initialData,
  });

  useRealtimeInvalidate(
    "dashboard-changes",
    [
      { table: "projects" },
      { table: "participations", filter: `student_id=eq.${userId}` },
    ],
    queryKey,
  );

  const { fullName, joinedRows, availableProjects } = data;

  return (
    <>
      <Header
        right={
          <>
            <span>สวัสดี, {fullName ?? "นิสิต"}</span>
            <Link href="/certificates" className="underline hover:text-white">
              สถานะใบ Certificate
            </Link>
            <form action={signOut}>
              <button type="submit" className="underline hover:text-white">
                ออกจากระบบ
              </button>
            </form>
          </>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">โครงการที่ประกาศใหม่</h2>
          {availableProjects.length === 0 && (
            <p className="text-sm text-slate-500">ไม่มีโครงการใหม่ในขณะนี้</p>
          )}
          <ul className="flex flex-col gap-2">
            {availableProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">
                    {project.event_date} · {project.location ?? "-"}
                  </p>
                </div>
                <form action={joinProject.bind(null, project.id)}>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    เข้าร่วม
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">โครงการที่เข้าร่วมแล้ว</h2>
          {joinedRows.length === 0 && (
            <p className="text-sm text-slate-500">ยังไม่ได้เข้าร่วมโครงการใด</p>
          )}
          <ul className="flex flex-col gap-2">
            {joinedRows.map((row) => (
              <li
                key={row.project_id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {row.project?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {row.project?.event_date} · {row.project?.location ?? "-"}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{row.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
