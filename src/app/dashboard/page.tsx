import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/queries/dashboard";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await fetchDashboardData(supabase, user.id);

  return <DashboardClient userId={user.id} initialData={initialData} />;
}
