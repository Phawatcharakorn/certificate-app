import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { buttonPrimary, buttonSecondary, card } from "@/lib/ui";

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: period } = await supabase
    .from("registration_periods")
    .select("id")
    .eq("is_active", true)
    .lte("open_date", today)
    .gte("close_date", today)
    .maybeSingle();

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
        <div
          className={`${card} anim-pop-in flex max-w-lg flex-col gap-6 text-center`}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              ระบบให้รางวัล Certificate นิสิต
            </h1>
            <p className="text-slate-500">
              เข้าร่วมโครงการ สะสมกิจกรรม รับใบเซอร์ทิฟิเคต
            </p>
          </div>

          <div className="flex flex-col gap-3 text-base font-medium sm:flex-row sm:justify-center">
            {period ? (
              <Link href="/register" className={buttonPrimary}>
                ลงทะเบียน
              </Link>
            ) : (
              <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-slate-400">
                ขณะนี้ปิดรับสมัคร
              </span>
            )}

            <Link href="/login" className={buttonSecondary}>
              เข้าสู่ระบบนิสิต
            </Link>

            <Link href="/admin/login" className={buttonSecondary}>
              เข้าสู่ระบบแอดมิน
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
