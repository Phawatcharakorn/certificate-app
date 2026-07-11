import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function requireStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!student) {
    await supabase.auth.signOut();
    redirect("/login?error=not-student");
  }

  return { supabase, user };
}
