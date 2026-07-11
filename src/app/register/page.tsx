import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./RegisterForm";
import type { Faculty } from "@/types/database";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

export default async function RegisterPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: period } = await supabase
    .from("registration_periods")
    .select("id")
    .eq("is_active", true)
    .lte("open_date", today)
    .gte("close_date", today)
    .limit(1)
    .maybeSingle();

  if (!period) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className={card}>
            <p className="text-lg text-slate-700">
              ขณะนี้ปิดรับสมัครสมาชิกระบบ กรุณาติดต่อแอดมิน
            </p>
          </div>
        </main>
      </>
    );
  }

  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("name");

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className={`${card} anim-slide-up w-full max-w-md`}>
          <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
            ลงทะเบียนนิสิต
          </h1>
          <RegisterForm faculties={(faculties as Faculty[]) ?? []} />
        </div>
      </main>
    </>
  );
}
