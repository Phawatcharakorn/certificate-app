import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { signOut } from "@/app/actions/auth";

export default async function AdminOverviewPage() {
  await requireAdmin();

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">ภาพรวมโครงการ (Admin)</h1>
      <nav className="flex gap-4 text-sm underline">
        <Link href="/admin/projects">จัดการโครงการ</Link>
        <Link href="/admin/certificate-rules">จัดการเกณฑ์ใบเซอร์</Link>
        <Link href="/admin/requests">คิวคำร้องขอใบเซอร์</Link>
        <Link href="/admin/settings">ตั้งค่าระบบ</Link>
        <a href="/api/admin/export/projects">Export โครงการทั้งหมด (Excel)</a>
      </nav>
      <form action={signOut}>
        <button type="submit" className="text-sm underline">
          ออกจากระบบ
        </button>
      </form>
    </main>
  );
}
