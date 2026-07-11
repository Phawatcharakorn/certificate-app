"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData, type DashboardData } from "@/lib/queries/dashboard";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { signOut } from "@/app/actions/auth";
import { joinProject } from "./actions";

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
    <main className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">สวัสดี, {fullName ?? "นิสิต"}</h1>
        <div className="flex items-center gap-4">
          <Link href="/certificates" className="text-sm underline">
            สถานะใบ Certificate
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm underline">
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">โครงการที่ประกาศใหม่</h2>
        {availableProjects.length === 0 && (
          <p className="text-sm text-gray-500">ไม่มีโครงการใหม่ในขณะนี้</p>
        )}
        <ul className="flex flex-col gap-2">
          {availableProjects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between border rounded p-4"
            >
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-gray-500">
                  {project.event_date} · {project.location ?? "-"}
                </p>
              </div>
              <form action={joinProject.bind(null, project.id)}>
                <button
                  type="submit"
                  className="bg-black text-white rounded px-4 py-2 text-sm"
                >
                  เข้าร่วม
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">โครงการที่เข้าร่วมแล้ว</h2>
        {joinedRows.length === 0 && (
          <p className="text-sm text-gray-500">ยังไม่ได้เข้าร่วมโครงการใด</p>
        )}
        <ul className="flex flex-col gap-2">
          {joinedRows.map((row) => (
            <li
              key={row.project_id}
              className="flex items-center justify-between border rounded p-4"
            >
              <div>
                <p className="font-medium">{row.project?.name}</p>
                <p className="text-sm text-gray-500">
                  {row.project?.event_date} · {row.project?.location ?? "-"}
                </p>
              </div>
              <span className="text-sm text-gray-500">{row.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
