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
import { ProjectCard } from "@/components/dashboard/ProjectCard";

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

  const { fullName, nickname, joinedRows, availableProjects } = data;

  const attendedCount = joinedRows.filter(
    (row) => row.status === "attended",
  ).length;

  return (
    <>
      <Header
        right={
          <>
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
        <section className={`${card} anim-fade-in flex flex-col gap-1`}>
          <h1 className="text-xl font-semibold text-slate-900">
            สวัสดี, {nickname ?? fullName ?? "นิสิต"} 👋
          </h1>
          <p className="text-sm text-slate-500">
            ติดตามโครงการที่เข้าร่วมและสะสมกิจกรรมเพื่อรับใบ Certificate ได้ที่นี่
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="โครงการที่เข้าร่วมแล้ว"
            value={joinedRows.length}
            delay="anim-delay-1"
          />
          <StatCard
            label="ผ่านแล้ว"
            value={attendedCount}
            delay="anim-delay-2"
          />
          <StatCard
            label="โครงการใหม่ที่ยังเปิดรับ"
            value={availableProjects.length}
            delay="anim-delay-3"
          />
        </section>

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">โครงการที่ประกาศใหม่</h2>
          {availableProjects.length === 0 && (
            <p className="text-sm text-slate-500">ไม่มีโครงการใหม่ในขณะนี้</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableProjects.map((project) => (
              <div key={project.id} className="stagger-card">
                <ProjectCard
                  code={project.code}
                  name={project.name}
                  description={project.description}
                  eventDate={project.event_date}
                  location={project.location}
                  duration={project.duration}
                  footer={
                    <form action={joinProject.bind(null, project.id)}>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        เข้าร่วม
                      </button>
                    </form>
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">โครงการที่เข้าร่วมแล้ว</h2>
          {joinedRows.length === 0 && (
            <p className="text-sm text-slate-500">ยังไม่ได้เข้าร่วมโครงการใด</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joinedRows.map((row) => (
              <div key={row.project_id} className="stagger-card">
                <ProjectCard
                  code={row.project?.code ?? "-"}
                  name={row.project?.name ?? "-"}
                  description={row.project?.description}
                  eventDate={row.project?.event_date ?? ""}
                  location={row.project?.location}
                  duration={row.project?.duration}
                  footer={
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[row.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  }
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

const STATUS_LABEL: Record<string, string> = {
  registered: "ลงทะเบียนแล้ว",
  attended: "ผ่านแล้ว",
  absent: "ขาดร่วมกิจกรรม",
};

const STATUS_STYLE: Record<string, string> = {
  registered: "bg-blue-50 text-blue-700",
  attended: "bg-green-50 text-green-700",
  absent: "bg-red-50 text-red-700",
};

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay?: string;
}) {
  return (
    <div className={`${card} anim-slide-up ${delay ?? ""} flex flex-col gap-1`}>
      <span className="text-3xl font-semibold text-blue-700">{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
