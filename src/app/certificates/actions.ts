"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchCertificateProgress } from "@/lib/queries/certificates";

export async function requestCertificate(certificateTypeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Recompute completion server-side — never trust the client's button state.
  const progress = await fetchCertificateProgress(supabase, user.id);
  const target = progress.find(
    (item) => item.certificateTypeId === certificateTypeId,
  );

  if (!target?.isComplete) {
    throw new Error("ยังเข้าร่วมโครงการไม่ครบเงื่อนไข");
  }

  if (target.request) {
    // already requested — nothing to do
    return;
  }

  const { error } = await supabase.from("certificate_requests").insert({
    student_id: user.id,
    certificate_type_id: certificateTypeId,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/certificates");
}
