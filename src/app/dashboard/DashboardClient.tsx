"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData, type DashboardData } from "@/lib/queries/dashboard";
import type { CertificateProgress } from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { signOut } from "@/app/actions/auth";
import { cancelParticipation, joinProject } from "./actions";
import { Header } from "@/components/layout/Header";
import {
  ProfileMenu,
  ProfileMenuButton,
  ProfileMenuLink,
} from "@/components/layout/ProfileMenu";
import { card } from "@/lib/ui";
import { ProjectCard, formatThaiDate } from "@/components/dashboard/ProjectCard";
import { BadgeIcon, CalendarIcon, LockIcon } from "@/components/icons";

export function DashboardClient({
  userId,
  initialData,
  certificateProgress,
}: {
  userId: string;
  initialData: DashboardData;
  certificateProgress: CertificateProgress[];
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

  const { fullName, nickname, studentCode, joinedRows, availableProjects } =
    data;

  const attendedCount = joinedRows.filter(
    (row) => row.status === "attended",
  ).length;

  const joinableCount = availableProjects.filter(
    (p) =>
      p.eligible && (p.capacity === null || p.participantCount < p.capacity),
  ).length;

  const nextEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return joinedRows
      .filter((row) => row.status === "registered" && row.project?.event_date)
      .map((row) => ({
        row,
        eventDate: new Date(row.project.event_date),
      }))
      .filter(({ eventDate }) => eventDate >= today)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())[0];
  }, [joinedRows]);

  const nextEventDaysLeft = nextEvent
    ? Math.round(
        (nextEvent.eventDate.getTime() - new Date().setHours(0, 0, 0, 0)) /
          86400000,
      )
    : null;

  const displayName = nickname ?? fullName ?? "นิสิต";

  return (
    <>
      <Header
        right={
          <ProfileMenu
            name={fullName ?? displayName}
            subtitle={studentCode ? `รหัสนิสิต ${studentCode}` : undefined}
          >
            <ProfileMenuLink href="/certificates">
              สถานะใบ Certificate
            </ProfileMenuLink>
            <div className="my-1 border-t border-slate-100" />
            <form action={signOut}>
              <ProfileMenuButton type="submit" danger>
                ออกจากระบบ
              </ProfileMenuButton>
            </form>
          </ProfileMenu>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <section className={`${card} anim-fade-in flex flex-col gap-1`}>
          <h1 className="text-xl font-semibold text-slate-900">
            สวัสดี, {displayName} 👋
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
            label="โครงการที่เปิดรับสำหรับคุณ"
            value={joinableCount}
            delay="anim-delay-3"
          />
        </section>

        {/* Next upcoming activity */}
        {nextEvent && (
          <section
            className={`${card} anim-fade-in flex flex-col gap-2 border-l-4 border-l-blue-600 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CalendarIcon width={20} height={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  กิจกรรมถัดไปของคุณ
                </p>
                <p className="font-medium text-slate-900">
                  {nextEvent.row.project?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatThaiDate(nextEvent.row.project?.event_date)}
                </p>
              </div>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {nextEventDaysLeft === 0
                ? "วันนี้"
                : `อีก ${nextEventDaysLeft} วัน`}
            </span>
          </section>
        )}

        {/* Certificate progress summary */}
        <section className={`${card} flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <BadgeIcon width={18} height={18} className="text-blue-700" />
              ความคืบหน้าใบ Certificate
            </h2>
            <Link
              href="/certificates"
              className="text-sm text-blue-700 underline hover:text-blue-800"
            >
              ดูทั้งหมด
            </Link>
          </div>

          {certificateProgress.length === 0 ? (
            <p className="text-sm text-slate-500">ยังไม่มีเกณฑ์ใบเซอร์ในระบบ</p>
          ) : (
            <div className="flex flex-col gap-3">
              {certificateProgress.slice(0, 3).map((item) => (
                <div key={item.certificateTypeId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">
                      {item.name}
                    </span>
                    <span className="text-slate-500">
                      {item.matched}/{item.total} ({item.percent}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  capacity={project.capacity}
                  joinedCount={project.participantCount}
                  locked={!project.eligible}
                  footer={
                    !project.eligible ? (
                      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
                        <LockIcon width={14} height={14} />
                        จำกัดเฉพาะบางคณะ
                      </div>
                    ) : project.capacity !== null &&
                      project.participantCount >= project.capacity ? (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
                      >
                        เต็มแล้ว
                      </button>
                    ) : (
                      <form action={joinProject.bind(null, project.id)}>
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          เข้าร่วม
                        </button>
                      </form>
                    )
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
                    <div className="flex flex-col gap-2">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[row.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                      {row.status === "registered" && (
                        <form action={cancelParticipation.bind(null, row.id)}>
                          <button
                            type="submit"
                            className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            ยกเลิกลงทะเบียน
                          </button>
                        </form>
                      )}
                    </div>
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
