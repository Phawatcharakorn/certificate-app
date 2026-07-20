import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";

/** Non-redirecting check for public pages that render differently for an
 *  admin who's browsing the public site while still signed in (e.g. via
 *  the admin header's "หน้าเว็บหลัก" link) — unlike requireAdmin(), a
 *  regular visitor or student is not an error case here. */
export async function checkIsAdmin(
  supabase: SupabaseClient,
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return !!data;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  return { supabase, user };
}
