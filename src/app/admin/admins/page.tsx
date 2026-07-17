import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";
import type { Admin } from "@/types/database";
import { CreateAdminForm } from "./CreateAdminForm";
import { removeAdmin } from "./actions";

export default async function AdminAdminsPage() {
  const { supabase, user } = await requireAdmin();

  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("email");

  return (
    <>
      <Header
        homeHref="/admin"
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">จัดการแอดมิน</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CreateAdminForm />

          <div className={`${card} flex flex-col gap-3`}>
            <h2 className="font-semibold text-slate-900">รายชื่อแอดมิน</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {((admins as Admin[]) ?? []).map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {admin.email}
                    </p>
                    <p className="text-xs text-slate-400">{admin.role}</p>
                  </div>
                  {admin.id === user.id ? (
                    <span className="text-xs text-slate-400">
                      (บัญชีของคุณ)
                    </span>
                  ) : (
                    <form action={removeAdmin.bind(null, admin.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 underline"
                      >
                        ลบสิทธิ์แอดมิน
                      </button>
                    </form>
                  )}
                </li>
              ))}
              {(!admins || admins.length === 0) && (
                <li className="text-slate-500">ยังไม่มีแอดมิน</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
