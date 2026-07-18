"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/supabase/require-student";

export async function requestCertificate(periodId: string) {
  const { supabase, user } = await requireStudent();

  // Recompute eligibility server-side — never trust the client's button state.
  const { data: result } = await supabase
    .from("student_period_results")
    .select("id, tier")
    .eq("period_id", periodId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!result || !result.tier) {
    throw new Error("ยังไม่ผ่านเกณฑ์ขั้นต่ำสำหรับปีการศึกษานี้");
  }

  const { data: existing } = await supabase
    .from("certificate_requests")
    .select("id")
    .eq("period_id", periodId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) {
    // already requested — nothing to do
    return;
  }

  const { error } = await supabase.from("certificate_requests").insert({
    student_id: user.id,
    period_id: periodId,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/certificates");
}
