import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./RegisterForm";
import type { Faculty } from "@/types/database";

export default async function RegisterPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: period } = await supabase
    .from("registration_periods")
    .select("id")
    .eq("is_active", true)
    .lte("open_date", today)
    .gte("close_date", today)
    .maybeSingle();

  if (!period) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-lg">ขณะนี้ปิดรับสมัครสมาชิกระบบ กรุณาติดต่อแอดมิน</p>
      </main>
    );
  }

  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("name");

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <RegisterForm faculties={(faculties as Faculty[]) ?? []} />
    </main>
  );
}
