import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

const NAV_ITEMS = [
  { href: "/admin/projects", label: "จัดการโครงการ" },
  { href: "/admin/certificate-rules", label: "จัดการเกณฑ์ใบเซอร์" },
  { href: "/admin/requests", label: "คิวคำร้องขอใบเซอร์" },
  { href: "/admin/settings", label: "ตั้งค่าระบบ" },
];

export default async function AdminOverviewPage() {
  await requireAdmin();

  return (
    <>
      <Header
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
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          ภาพรวมโครงการ (Admin)
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${card} font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/api/admin/export/projects"
            className={`${card} font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700`}
          >
            Export โครงการทั้งหมด (Excel)
          </a>
        </div>
      </main>
    </>
  );
}
