import { fetchDashboardData } from "@/lib/queries/dashboard";
import { requireStudent } from "@/lib/supabase/require-student";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { supabase, user } = await requireStudent();

  const initialData = await fetchDashboardData(supabase, user.id);

  return <DashboardClient userId={user.id} initialData={initialData} />;
}
