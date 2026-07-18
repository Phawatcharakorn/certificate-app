import { requireAdmin } from "@/lib/supabase/require-admin";
import type { AcademicPeriod, CertificateTier } from "@/types/database";
import { PeriodsClient } from "./PeriodsClient";

export interface ClosedPeriodSummary extends AcademicPeriod {
  totalStudents: number;
  tierCounts: Record<CertificateTier, number>;
}

export default async function AdminPeriodsPage() {
  const { supabase } = await requireAdmin();

  const { data: periods } = await supabase
    .from("academic_periods")
    .select("*")
    .order("open_date", { ascending: false });

  const allPeriods = (periods as AcademicPeriod[]) ?? [];
  const openPeriod = allPeriods.find((p) => p.status === "open") ?? null;
  const closedPeriods = allPeriods.filter((p) => p.status === "closed");

  let openPeriodProjectCount = 0;
  if (openPeriod) {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("period_id", openPeriod.id);
    openPeriodProjectCount = count ?? 0;
  }

  const closedSummaries: ClosedPeriodSummary[] = [];
  for (const period of closedPeriods) {
    const { data: results } = await supabase
      .from("student_period_results")
      .select("tier")
      .eq("period_id", period.id);

    const tierCounts: Record<CertificateTier, number> = {
      platinum: 0,
      gold: 0,
      silver: 0,
    };
    for (const row of results ?? []) {
      if (row.tier) tierCounts[row.tier as CertificateTier] += 1;
    }

    closedSummaries.push({
      ...period,
      totalStudents: results?.length ?? 0,
      tierCounts,
    });
  }

  return (
    <PeriodsClient
      openPeriod={openPeriod}
      openPeriodProjectCount={openPeriodProjectCount}
      closedPeriods={closedSummaries}
    />
  );
}
