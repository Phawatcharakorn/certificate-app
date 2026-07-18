import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";
import { NavIcon } from "@/components/admin/NavIcon";

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

export default async function AdminOverviewPage() {
  await requireAdmin();

  return (
    <>
      <Header
        homeHref="/admin"
        right={
          <>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium">
              Manager
            </span>
            <form action={signOut}>
              <button type="submit" className="underline hover:text-white">
                ออกจากระบบ
              </button>
            </form>
          </>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          ภาพรวมโครงการ (Admin)
        </h1>

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
