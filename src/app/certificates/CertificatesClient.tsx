"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCurrentPeriodProgress,
  fetchPeriodHistory,
  type CurrentPeriodProgress,
  type PeriodResult,
} from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { requestCertificate } from "./actions";
import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/layout/Header";
import {
  ProfileMenu,
  ProfileMenuButton,
  ProfileMenuLink,
} from "@/components/layout/ProfileMenu";
import type { StudentProfile } from "@/lib/queries/profile";
import { card } from "@/lib/ui";
import { TIER_LABEL, TIER_STYLE } from "@/lib/certificate-tier";
import {
  ActivityIcon,
  BadgeIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  InboxIcon,
  MoreVerticalIcon,
  SendIcon,
  XCircleIcon,
} from "@/components/icons";

type DisplayStatus =
  | "not_eligible"
  | "ready"
  | "pending"
  | "processing"
  | "completed"
  | "rejected";

const STATUS_LABEL: Record<DisplayStatus, string> = {
  not_eligible: "ไม่ผ่านเกณฑ์",
  ready: "พร้อมยื่นคำร้อง",
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

const STATUS_STYLE: Record<DisplayStatus, string> = {
  not_eligible: "bg-slate-100 text-slate-600",
  ready: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-sky-50 text-sky-700",
  completed: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const STATUS_ICON: Record<DisplayStatus, typeof CheckCircleIcon> = {
  not_eligible: XCircleIcon,
  ready: SendIcon,
  pending: ClockIcon,
  processing: ClockIcon,
  completed: CheckCircleIcon,
  rejected: XCircleIcon,
};

function getDisplayStatus(item: PeriodResult): DisplayStatus {
  if (item.request) return item.request.status;
  if (!item.tier) return "not_eligible";
  return "ready";
}

function formatThaiDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      <Icon width={13} height={13} strokeWidth={2.5} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: number;
  icon: typeof FileTextIcon;
  accent: string;
  delay?: string;
}) {
  return (
    <div
      className={`${card} anim-slide-up ${delay ?? ""} flex items-center gap-4`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon width={20} height={20} strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}

function ActionMenu({
  item,
  status,
  openId,
  setOpenId,
}: {
  item: PeriodResult;
  status: DisplayStatus;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === item.periodId;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : item.periodId)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="เมนูการทำงาน"
      >
        <MoreVerticalIcon width={18} height={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpenId(null)} />
          <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-slate-200/80">
            <div className="px-3 py-2 text-xs text-slate-500">
              เข้าร่วมแล้ว {item.attended}/{item.total} รายการ ({item.percent}%)
            </div>

            {status === "ready" && (
              <form
                action={requestCertificate.bind(null, item.periodId)}
                onSubmit={() => setOpenId(null)}
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 border-t border-slate-50 px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                >
                  <SendIcon width={15} height={15} />
                  ยื่นคำร้องขอใบเซอร์
                </button>
              </form>
            )}

            {status === "completed" && item.request?.certificate_file_url && (
              <a
                href={item.request.certificate_file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenId(null)}
                className="flex w-full items-center gap-2 border-t border-slate-50 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50"
              >
                <DownloadIcon width={15} height={15} />
                ดาวน์โหลด PDF
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function CertificatesClient({
  userId,
  initialCurrentPeriod,
  initialHistory,
  profile,
}: {
  userId: string;
  initialCurrentPeriod: CurrentPeriodProgress | null;
  initialHistory: PeriodResult[];
  profile: StudentProfile;
}) {
  const supabase = createClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: currentPeriod } = useQuery({
    queryKey: ["certificates-current", userId],
    queryFn: () => fetchCurrentPeriodProgress(supabase, userId),
    initialData: initialCurrentPeriod,
  });

  const { data: history } = useQuery({
    queryKey: ["certificates-history", userId],
    queryFn: () => fetchPeriodHistory(supabase, userId),
    initialData: initialHistory,
  });

  useRealtimeInvalidate(
    "certificates-changes",
    [
      { table: "certificate_requests", filter: `student_id=eq.${userId}` },
      { table: "participations", filter: `student_id=eq.${userId}` },
      { table: "student_period_results", filter: `student_id=eq.${userId}` },
      { table: "academic_periods" },
    ],
    ["certificates-current", userId],
  );
  useRealtimeInvalidate(
    "certificates-history-changes",
    [
      { table: "certificate_requests", filter: `student_id=eq.${userId}` },
      { table: "student_period_results", filter: `student_id=eq.${userId}` },
    ],
    ["certificates-history", userId],
  );

  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let ready = 0;
    for (const item of history) {
      const status = getDisplayStatus(item);
      if (status === "completed") completed += 1;
      else if (status === "pending" || status === "processing") inProgress += 1;
      else if (status === "ready") ready += 1;
    }
    return { total: history.length, completed, inProgress, ready };
  }, [history]);

  const activity = useMemo(() => {
    return history
      .filter((item) => item.request)
      .map((item) => ({
        periodId: item.periodId,
        name: item.periodName,
        status: item.request!.status as DisplayStatus,
        date: item.request!.updated_at,
        isInitial: item.request!.requested_at === item.request!.updated_at,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [history]);

  return (
    <>
      <Header
        homeHref="/dashboard"
        right={
          <ProfileMenu
            name={profile.fullName ?? profile.nickname ?? "นิสิต"}
            subtitle={
              profile.studentCode ? `รหัสนิสิต ${profile.studentCode}` : undefined
            }
          >
            <ProfileMenuLink href="/dashboard">กลับหน้าหลัก</ProfileMenuLink>
            <div className="my-1 border-t border-slate-100" />
            <form action={signOut}>
              <ProfileMenuButton type="submit" danger>
                ออกจากระบบ
              </ProfileMenuButton>
            </form>
          </ProfileMenu>
        }
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-sm text-slate-500"
        >
          <Link href="/dashboard" className="hover:text-blue-700 hover:underline">
            หน้าหลัก
          </Link>
          <ChevronRightIcon width={14} height={14} />
          <span className="font-medium text-slate-700">สถานะใบ Certificate</span>
        </nav>

        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            สถานะใบ Certificate
          </h1>
          <p className="text-sm text-slate-500">
            ติดตามความคืบหน้ารายปีการศึกษาและยื่นคำร้องขอใบ Certificate ของคุณได้ที่นี่
          </p>
        </section>

        {/* Current open period */}
        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <BadgeIcon width={18} height={18} className="text-blue-700" />
            ปีการศึกษาปัจจุบัน
          </h2>
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
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLE[currentPeriod.projectedTier]}`}
                    >
                      คาดว่าจะได้ {TIER_LABEL[currentPeriod.projectedTier]}
                    </span>
                  )}
                  <span className="text-slate-500">
                    {currentPeriod.attended}/{currentPeriod.total} ({currentPeriod.percent}%)
                  </span>
                </div>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${currentPeriod.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                ยื่นคำร้องขอใบเซอร์ได้หลังปีการศึกษานี้ปิด
              </p>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="ปีการศึกษาที่ปิดแล้ว"
            value={stats.total}
            icon={FileTextIcon}
            accent="bg-blue-50 text-blue-700"
            delay="anim-delay-1"
          />
          <StatCard
            label="พร้อมยื่นคำร้อง"
            value={stats.ready}
            icon={SendIcon}
            accent="bg-sky-50 text-sky-700"
            delay="anim-delay-2"
          />
          <StatCard
            label="กำลังดำเนินการ"
            value={stats.inProgress}
            icon={ClockIcon}
            accent="bg-amber-50 text-amber-700"
            delay="anim-delay-3"
          />
          <StatCard
            label="เสร็จสิ้นแล้ว"
            value={stats.completed}
            icon={CheckCircleIcon}
            accent="bg-green-50 text-green-700"
            delay="anim-delay-4"
          />
        </section>

        {/* History table */}
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <BadgeIcon width={18} height={18} className="text-blue-700" />
            ปีการศึกษาที่ปิดแล้ว
          </h2>

          {history.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="ยังไม่มีปีการศึกษาที่ปิดแล้ว"
              description="เมื่อมหาวิทยาลัยปิดปีการศึกษา ผลของคุณจะแสดงที่นี่"
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 font-medium">ปีการศึกษา</th>
                      <th className="px-3 py-2 font-medium">ความคืบหน้า</th>
                      <th className="px-3 py-2 font-medium">ระดับ</th>
                      <th className="px-3 py-2 font-medium">สถานะคำร้อง</th>
                      <th className="px-3 py-2 font-medium">อัปเดตล่าสุด</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => {
                      const status = getDisplayStatus(item);
                      return (
                        <tr
                          key={item.periodId}
                          className="border-b border-slate-50 transition hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-900">
                              {item.periodName}
                            </p>
                            <p className="text-xs text-slate-400">
                              ปิดเมื่อ {formatThaiDate(item.closeDate)}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full bg-blue-600"
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {item.attended}/{item.total}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {item.tier ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLE[item.tier]}`}
                              >
                                {TIER_LABEL[item.tier]}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {formatThaiDate(item.request?.updated_at)}
                          </td>
                          <td className="px-3 py-3">
                            <ActionMenu
                              item={item}
                              status={status}
                              openId={openMenuId}
                              setOpenId={setOpenMenuId}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="flex flex-col gap-3 md:hidden">
                {history.map((item) => {
                  const status = getDisplayStatus(item);
                  return (
                    <li
                      key={item.periodId}
                      className="stagger-card rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.periodName}
                          </p>
                          {item.tier && (
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLE[item.tier]}`}
                            >
                              {TIER_LABEL[item.tier]}
                            </span>
                          )}
                        </div>
                        <ActionMenu
                          item={item}
                          status={status}
                          openId={openMenuId}
                          setOpenId={setOpenMenuId}
                        />
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-blue-600"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={status} />
                        <span className="text-xs text-slate-400">
                          {formatThaiDate(item.request?.updated_at)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* Activity timeline */}
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <ActivityIcon width={18} height={18} className="text-blue-700" />
            กิจกรรมล่าสุด
          </h2>

          {activity.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="ยังไม่มีกิจกรรม"
              description="เมื่อคุณยื่นคำร้องขอใบเซอร์ ความเคลื่อนไหวจะแสดงที่นี่"
            />
          ) : (
            <ol className="flex flex-col gap-4">
              {activity.map((event, idx) => {
                const Icon = STATUS_ICON[event.status];
                return (
                  <li
                    key={`${event.periodId}-${event.date}`}
                    className="stagger-card flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${STATUS_STYLE[event.status]}`}
                      >
                        <Icon width={15} height={15} strokeWidth={2.5} />
                      </div>
                      {idx !== activity.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-slate-100" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-slate-800">
                        {event.isInitial ? "ยื่นคำร้องขอใบเซอร์ปี " : "อัปเดตสถานะปี "}
                        <span className="font-medium">{event.name}</span> เป็น{" "}
                        <span className="font-medium">{STATUS_LABEL[event.status]}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatThaiDate(event.date)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof InboxIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon width={22} height={22} />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
