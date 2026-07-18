"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData, type DashboardData } from "@/lib/queries/dashboard";
import type { CurrentPeriodProgress } from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/layout/Header";
import {
  ProfileMenu,
  ProfileMenuButton,
  ProfileMenuLink,
} from "@/components/layout/ProfileMenu";
import { cardGlass } from "@/lib/ui";
import { ProjectCard, formatThaiDate } from "@/components/dashboard/ProjectCard";
import {
  BadgeIcon,
  CalendarIcon,
  CheckCircleIcon,
  LockIcon,
  SendIcon,
} from "@/components/icons";
import { TIER_LABEL, TIER_STYLE } from "@/lib/certificate-tier";

export function DashboardClient({
  userId,
  initialData,
  currentPeriod,
}: {
  userId: string;
  initialData: DashboardData;
  currentPeriod: CurrentPeriodProgress | null;
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
        homeHref="/dashboard"
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
        <section
          className="anim-pop-in relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_20px_50px_-20px_rgba(13,60,86,0.55)] sm:p-8"
          style={{
            background:
              "linear-gradient(120deg, #0d2f4e 0%, #0f5c52 55%, #0d7a6a 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-100/80">
              ยินดีต้อนรับกลับมา
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              สวัสดี, {displayName}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-teal-50/85">
              ติดตามโครงการที่เข้าร่วมและสะสมกิจกรรมเพื่อรับใบ Certificate ได้ที่นี่
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="โครงการที่เข้าร่วมแล้ว"
            value={joinedRows.length}
            icon={CalendarIcon}
            accent="from-blue-600 to-indigo-500"
            delay="anim-delay-1"
          />
          <StatCard
            label="ผ่านแล้ว"
            value={attendedCount}
            icon={CheckCircleIcon}
            accent="from-teal-600 to-emerald-500"
            delay="anim-delay-2"
          />
          <StatCard
            label="โครงการที่เปิดรับสำหรับคุณ"
            value={joinableCount}
            icon={SendIcon}
            accent="from-amber-500 to-orange-500"
            delay="anim-delay-3"
          />
        </section>

        {/* Next upcoming activity */}
        {nextEvent && (
          <section
            className={`${cardGlass} anim-fade-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-800 text-white shadow-md shadow-teal-900/20">
                <CalendarIcon width={20} height={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  กิจกรรมถัดไปของคุณ
                </p>
                <p className="font-medium tracking-tight text-slate-900">
                  {nextEvent.row.project?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatThaiDate(nextEvent.row.project?.event_date)}
                </p>
              </div>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-gradient-to-r from-teal-600 to-blue-700 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-teal-900/20">
              {nextEventDaysLeft === 0
                ? "วันนี้"
                : `อีก ${nextEventDaysLeft} วัน`}
            </span>
          </section>
        )}

        {/* Certificate progress summary */}
        <section className={`${cardGlass} flex flex-col gap-3.5`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-blue-800 text-white">
                <BadgeIcon width={16} height={16} />
              </span>
              ความคืบหน้าใบ Certificate
            </h2>
            <Link
              href="/certificates"
              className="text-sm font-medium text-teal-700 transition hover:text-teal-900"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {!currentPeriod ? (
            <p className="text-sm text-slate-500">ขณะนี้ไม่มีปีการศึกษาที่เปิดอยู่</p>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">
                  {currentPeriod.periodName}
                </span>
                <div className="flex items-center gap-2">
                  {currentPeriod.projectedTier && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLE[currentPeriod.projectedTier]}`}
                    >
                      คาดว่าจะได้ {TIER_LABEL[currentPeriod.projectedTier]}
                    </span>
                  )}
                  <span className="font-medium text-slate-500">
                    {currentPeriod.attended}/{currentPeriod.total} ({currentPeriod.percent}%)
                  </span>
                </div>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100/80 shadow-inner">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-700 shadow-[0_0_10px_rgba(13,122,106,0.5)] transition-[width] duration-500"
                  style={{ width: `${currentPeriod.percent}%` }}
                />
              </div>
            </div>
          )}
        </section>

        <section className={`${cardGlass} flex flex-col gap-3.5`}>
          <h2 className="font-semibold tracking-tight text-slate-900">
            โครงการที่ประกาศใหม่
          </h2>
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
                  coverImageUrl={project.cover_image_url}
                  locked={!project.eligible}
                  href={`/projects/${project.id}`}
                  footer={
                    !project.eligible ? (
                      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
                        <LockIcon width={14} height={14} />
                        จำกัดเฉพาะบางคณะ
                      </div>
                    ) : project.capacity !== null &&
                      project.participantCount >= project.capacity ? (
                      <div className="rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-500">
                        เต็มแล้ว
                      </div>
                    ) : (
                      <div className="rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-2 text-center text-sm font-semibold text-teal-800">
                        ดูรายละเอียด &amp; เข้าร่วม
                      </div>
                    )
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className={`${cardGlass} flex flex-col gap-3.5`}>
          <h2 className="font-semibold tracking-tight text-slate-900">
            โครงการที่เข้าร่วมแล้ว
          </h2>
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
                  coverImageUrl={row.project?.cover_image_url}
                  href={row.project?.id ? `/projects/${row.project.id}` : undefined}
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
  attended: "bg-teal-50 text-teal-700",
  absent: "bg-red-50 text-red-700",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: number;
  icon: typeof CalendarIcon;
  accent: string;
  delay?: string;
}) {
  return (
    <div
      className={`${cardGlass} anim-slide-up ${delay ?? ""} flex items-center gap-4 p-5`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md shadow-slate-900/10`}
      >
        <Icon width={20} height={20} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
