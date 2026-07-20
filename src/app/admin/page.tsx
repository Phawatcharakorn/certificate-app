import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { NavIcon } from "@/components/admin/NavIcon";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { fetchAdminDashboard } from "@/lib/queries/admin-dashboard";
import { formatThaiDate } from "@/components/dashboard/ProjectCard";
import {
  buttonPrimary,
  buttonSecondary,
  card,
  eyebrow,
  headingSm,
  tableCell,
  tableCellHead,
  tableHeadRow,
  tableRow,
  tableWrap,
} from "@/lib/ui";
import {
  ActivityIcon,
  BadgeIcon,
  FileTextIcon,
  UsersIcon,
} from "@/components/icons";

const SECTIONS = [
  {
    title: "จัดการข้อมูล",
    items: [
      {
        href: "/admin/students",
        icon: "students" as const,
        label: "จัดการนิสิต",
        description: "ดูรายชื่อนิสิต แก้ไขข้อมูล และอัปเดตสถานะเข้าร่วมกิจกรรม",
      },
      {
        href: "/admin/projects",
        icon: "projects" as const,
        label: "จัดการโครงการ",
        description: "สร้าง/แก้ไขโครงการกิจกรรม กำหนดคณะและจำนวนที่นั่ง",
      },
      {
        href: "/admin/periods",
        icon: "certificate" as const,
        label: "จัดการปีการศึกษา",
        description: "เปิด/ปิดปีการศึกษา และดูสรุประดับใบ Certificate ของนิสิต",
      },
    ],
  },
  {
    title: "การดำเนินการ",
    items: [
      {
        href: "/admin/requests",
        icon: "inbox" as const,
        label: "คิวคำร้องขอใบเซอร์",
        description: "อนุมัติ ปฏิเสธ และสร้างไฟล์ใบเซอร์ให้นิสิตที่ยื่นคำร้อง",
      },
      {
        href: "/api/admin/export/projects",
        icon: "download" as const,
        label: "Export โครงการทั้งหมด (Excel)",
        description: "ดาวน์โหลดรายชื่อผู้เข้าร่วมทุกโครงการเป็นไฟล์ Excel",
      },
    ],
  },
  {
    title: "ระบบ",
    items: [
      {
        href: "/admin/settings",
        icon: "settings" as const,
        label: "ตั้งค่าระบบ",
        description: "กำหนดช่วงเวลาเปิดรับสมัคร และเทมเพลตใบเซอร์",
      },
      {
        href: "/admin/admins",
        icon: "lock" as const,
        label: "จัดการแอดมิน",
        description: "เพิ่มหรือถอดถอนสิทธิ์แอดมินคนอื่น",
      },
    ],
  },
];

const QUICK_ACTIONS = [
  { href: "/admin/projects", label: "เพิ่มโครงการใหม่" },
  { href: "/admin/requests", label: "จัดการคำร้อง Certificate" },
  { href: "/admin/students", label: "จัดการนิสิต" },
];

const REQUEST_STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

const REQUEST_STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  processing: "processing",
  completed: "success",
  rejected: "danger",
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof FileTextIcon;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className={`${card} stagger-card flex items-center gap-4`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-800 text-white shadow-md shadow-slate-900/10">
        <Icon width={20} height={20} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value.toLocaleString("th-TH")}
        </span>
        <span className="text-sm text-slate-500">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const { summary, recentProjects, recentCertificates, pendingApprovals } =
    await fetchAdminDashboard(supabase);

  const requestTotal = summary.totalCertificatesIssued + summary.pendingApprovals;
  const completedPercent =
    requestTotal === 0
      ? 0
      : Math.round((summary.totalCertificatesIssued / requestTotal) * 100);

  return (
    <>
      <AdminHeader crumbs={[]} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <span className={eyebrow}>Admin Dashboard</span>
          <h1 className="text-xl font-semibold text-slate-900">
            ภาพรวมระบบ
          </h1>
        </div>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={FileTextIcon}
            label="โครงการทั้งหมด"
            value={summary.totalProjects}
          />
          <SummaryCard
            icon={UsersIcon}
            label="นิสิตในระบบ"
            value={summary.totalStudents}
          />
          <SummaryCard
            icon={BadgeIcon}
            label="Certificate ที่ออกแล้ว"
            value={summary.totalCertificatesIssued}
          />
          <SummaryCard
            icon={ActivityIcon}
            label="กิจกรรมล่าสุด"
            value={summary.recentActivityCount}
            hint="7 วันที่ผ่านมา"
          />
        </section>

        {/* Quick actions */}
        <section className="flex flex-col gap-3">
          <h2 className={headingSm}>การดำเนินการด่วน</h2>
          <div className="flex flex-wrap gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className={i === 0 ? buttonPrimary : buttonSecondary}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Certificate request status — simple bar breakdown */}
        {requestTotal > 0 && (
          <section className={`${card} flex flex-col gap-3`}>
            <h2 className={headingSm}>สถานะคำร้องขอ Certificate</h2>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-green-500"
                style={{ width: `${completedPercent}%` }}
                title={`เสร็จสิ้น ${summary.totalCertificatesIssued}`}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${100 - completedPercent}%` }}
                title={`รอดำเนินการ ${summary.pendingApprovals}`}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                เสร็จสิ้น {summary.totalCertificatesIssued} ({completedPercent}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                รอดำเนินการ {summary.pendingApprovals} ({100 - completedPercent}%)
              </span>
            </div>
          </section>
        )}

        {/* Pending approvals */}
        {pendingApprovals.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className={headingSm}>คำร้องที่รอดำเนินการ</h2>
              <Link
                href="/admin/requests"
                className="text-xs text-blue-600 underline"
              >
                ดูทั้งหมด
              </Link>
            </div>
            <div className={tableWrap}>
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className={tableHeadRow}>
                    <th className={tableCellHead}>นิสิต</th>
                    <th className={tableCellHead}>ปีการศึกษา</th>
                    <th className={tableCellHead}>วันที่ยื่น</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((req) => (
                    <tr key={req.id} className={tableRow}>
                      <td className={`${tableCell} text-slate-900`}>
                        {req.student?.full_name}
                        <span className="ml-1 text-slate-400">
                          ({req.student?.student_code})
                        </span>
                      </td>
                      <td className={tableCell}>{req.period?.name}</td>
                      <td className={tableCell}>
                        {formatThaiDate(req.requested_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recent projects + recent certificates */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className={headingSm}>โครงการล่าสุด</h2>
              <Link
                href="/admin/projects"
                className="text-xs text-blue-600 underline"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className={`${card} text-center text-sm text-slate-500`}>
                ยังไม่มีโครงการในระบบ
              </p>
            ) : (
              <ul className={`${card} flex flex-col divide-y divide-slate-50 p-0`}>
                {recentProjects.map((project) => (
                  <li key={project.id} className="flex flex-col gap-0.5 p-4">
                    <span className="text-sm font-medium text-slate-900">
                      {project.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {project.code} · {formatThaiDate(project.event_date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className={headingSm}>คำร้อง Certificate ล่าสุด</h2>
              <Link
                href="/admin/requests"
                className="text-xs text-blue-600 underline"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {recentCertificates.length === 0 ? (
              <p className={`${card} text-center text-sm text-slate-500`}>
                ยังไม่มีคำร้อง
              </p>
            ) : (
              <ul className={`${card} flex flex-col divide-y divide-slate-50 p-0`}>
                {recentCertificates.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-900">
                        {req.student?.full_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {req.period?.name}
                      </span>
                    </div>
                    <Badge tone={REQUEST_STATUS_TONE[req.status]}>
                      {REQUEST_STATUS_LABEL[req.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Full section nav */}
        {SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${card} stagger-card flex items-start gap-3 transition hover:border-blue-200`}
                >
                  <NavIcon name={item.icon} />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
