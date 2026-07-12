"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCertificateProgress,
  type CertificateProgress,
} from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { requestCertificate } from "./actions";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";
import {
  ActivityIcon,
  BadgeIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  InboxIcon,
  MoreVerticalIcon,
  SearchIcon,
  SendIcon,
  XCircleIcon,
} from "@/components/icons";

type DisplayStatus = "not_ready" | "ready" | "pending" | "processing" | "completed" | "rejected";

const STATUS_LABEL: Record<DisplayStatus, string> = {
  not_ready: "กำลังสะสม",
  ready: "พร้อมยื่นคำร้อง",
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

const STATUS_STYLE: Record<DisplayStatus, string> = {
  not_ready: "bg-slate-100 text-slate-600",
  ready: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-sky-50 text-sky-700",
  completed: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const STATUS_ICON: Record<DisplayStatus, typeof CheckCircleIcon> = {
  not_ready: ClockIcon,
  ready: SendIcon,
  pending: ClockIcon,
  processing: ClockIcon,
  completed: CheckCircleIcon,
  rejected: XCircleIcon,
};

function getDisplayStatus(item: CertificateProgress): DisplayStatus {
  if (item.request) return item.request.status;
  if (item.isComplete) return "ready";
  return "not_ready";
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
  item: CertificateProgress;
  status: DisplayStatus;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === item.certificateTypeId;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : item.certificateTypeId)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="เมนูการทำงาน"
      >
        <MoreVerticalIcon width={18} height={18} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpenId(null)}
          />
          <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-slate-200/80">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400">
              <EyeIcon width={14} height={14} />
              รายละเอียดเกณฑ์
            </div>
            <div className="border-t border-slate-50 px-3 py-2 text-xs text-slate-500">
              เข้าร่วมแล้ว {item.matched}/{item.total} รายการ ({item.percent}
              %)
            </div>

            {status === "ready" && (
              <form
                action={requestCertificate.bind(null, item.certificateTypeId)}
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
  initialData,
}: {
  userId: string;
  initialData: CertificateProgress[];
}) {
  const supabase = createClient();
  const queryKey = ["certificates", userId];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>(
    "all",
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: progress } = useQuery({
    queryKey,
    queryFn: () => fetchCertificateProgress(supabase, userId),
    initialData,
  });

  useRealtimeInvalidate(
    "certificates-changes",
    [
      { table: "certificate_requests", filter: `student_id=eq.${userId}` },
      { table: "participations", filter: `student_id=eq.${userId}` },
    ],
    queryKey,
  );

  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let ready = 0;
    for (const item of progress) {
      const status = getDisplayStatus(item);
      if (status === "completed") completed += 1;
      else if (status === "pending" || status === "processing")
        inProgress += 1;
      else if (status === "ready") ready += 1;
    }
    return { total: progress.length, completed, inProgress, ready };
  }, [progress]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return progress.filter((item) => {
      const status = getDisplayStatus(item);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [progress, search, statusFilter]);

  const activity = useMemo(() => {
    return progress
      .filter((item) => item.request)
      .map((item) => ({
        certificateTypeId: item.certificateTypeId,
        name: item.name,
        status: item.request!.status as DisplayStatus,
        date: item.request!.updated_at,
        isInitial: item.request!.requested_at === item.request!.updated_at,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [progress]);

  return (
    <>
      <Header
        right={
          <Link href="/dashboard" className="underline hover:text-white">
            กลับหน้าหลัก
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
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
            ติดตามความคืบหน้าและยื่นคำร้องขอใบ Certificate ของคุณได้ที่นี่
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="ใบเซอร์ทั้งหมด"
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

        {/* Table card */}
        <section className={`${card} flex flex-col gap-4`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <BadgeIcon width={18} height={18} className="text-blue-700" />
              รายการ Certificate
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <SearchIcon
                  width={16}
                  height={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อใบเซอร์..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-400 sm:w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | DisplayStatus)
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">สถานะทั้งหมด</option>
                {(Object.keys(STATUS_LABEL) as DisplayStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {progress.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="ยังไม่มีเกณฑ์ใบเซอร์ในระบบ"
              description="เมื่อมหาวิทยาลัยเพิ่มเกณฑ์ใบ Certificate รายการจะแสดงที่นี่"
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="ไม่พบรายการที่ค้นหา"
              description="ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ"
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">ความคืบหน้า</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">อัปเดตล่าสุด</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const status = getDisplayStatus(item);
                      return (
                        <tr
                          key={item.certificateTypeId}
                          className="border-b border-slate-50 transition hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-900">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="max-w-xs truncate text-xs text-slate-400">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            ใบ Certificate
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
                                {item.matched}/{item.total}
                              </span>
                            </div>
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
                {filtered.map((item) => {
                  const status = getDisplayStatus(item);
                  return (
                    <li
                      key={item.certificateTypeId}
                      className="stagger-card rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            ใบ Certificate
                          </p>
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
                    key={`${event.certificateTypeId}-${event.date}`}
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
                        {event.isInitial ? "ยื่นคำร้องขอใบ " : "อัปเดตสถานะใบ "}
                        <span className="font-medium">{event.name}</span>{" "}
                        เป็น <span className="font-medium">{STATUS_LABEL[event.status]}</span>
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
