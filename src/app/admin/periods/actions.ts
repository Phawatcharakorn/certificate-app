"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export type PeriodFormState = { error?: string; message?: string } | undefined;

export async function createPeriod(
  _prevState: PeriodFormState,
  formData: FormData,
): Promise<PeriodFormState> {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const openDate = String(formData.get("open_date") ?? "");

  if (!name || !openDate) {
    return { error: "กรุณากรอกชื่อปีการศึกษาและวันที่เปิด" };
  }

  const { error } = await supabase.from("academic_periods").insert({
    name,
    open_date: openDate,
    status: "open",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "มีปีการศึกษาที่เปิดอยู่แล้ว กรุณาปิดปีปัจจุบันก่อน" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/periods");
  return { message: "เปิดปีการศึกษาใหม่สำเร็จ" };
}

export async function closePeriod(periodId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.rpc("close_academic_period", {
    p_period_id: periodId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/periods");
}
