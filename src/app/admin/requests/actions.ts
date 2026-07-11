"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function markProcessing(requestId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("certificate_requests")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/requests");
}

export async function rejectRequest(requestId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("certificate_requests")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/requests");
}
