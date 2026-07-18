import { fetchDashboardData } from "@/lib/queries/dashboard";
import { fetchCurrentPeriodProgress } from "@/lib/queries/certificates";
import { requireStudent } from "@/lib/supabase/require-student";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { supabase, user } = await requireStudent();

  const [initialData, currentPeriod] = await Promise.all([
    fetchDashboardData(supabase, user.id),
    fetchCurrentPeriodProgress(supabase, user.id),
  ]);

  return (
    <DashboardClient
      userId={user.id}
      initialData={initialData}
      currentPeriod={currentPeriod}
    />
  );
}
