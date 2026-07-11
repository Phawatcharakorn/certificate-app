import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">
          ระบบให้รางวัล Certificate นิสิต ม.เกษตรศาสตร์ ศรีราชา
        </h1>
        <p className="text-gray-500">
          เข้าร่วมโครงการ สะสมกิจกรรม รับใบเซอร์ทิฟิเคต
        </p>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
        {period ? (
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-white"
          >
            ลงทะเบียน
          </Link>
        ) : (
          <span className="flex h-12 items-center justify-center rounded-full border px-6 text-gray-400">
            ขณะนี้ปิดรับสมัคร
          </span>
        )}

        <Link
          href="/login"
          className="flex h-12 items-center justify-center rounded-full border px-6"
        >
          เข้าสู่ระบบนิสิต
        </Link>

        <Link
          href="/admin/login"
          className="flex h-12 items-center justify-center rounded-full border px-6"
        >
          เข้าสู่ระบบแอดมิน
        </Link>
      </div>
    </main>
  );
}
