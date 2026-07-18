import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus, CertificateTier } from "@/types/database";
import { computeTier } from "@/lib/certificate-tier";

export interface CertificateRequestInfo {
  id: string;
  status: CertificateRequestStatus;
  certificate_file_url: string | null;
  requested_at: string;
  updated_at: string;
}

export interface CurrentPeriodProgress {
  periodId: string;
  periodName: string;
  total: number;
  attended: number;
  percent: number;
  projectedTier: CertificateTier | null;
}

export interface PeriodResult {
  periodId: string;
  periodName: string;
  closeDate: string | null;
  total: number;
  attended: number;
  percent: number;
  tier: CertificateTier | null;
  request: CertificateRequestInfo | null;
}

export async function fetchCurrentPeriodProgress(
  supabase: SupabaseClient,
  studentId: string,
): Promise<CurrentPeriodProgress | null> {
  const { data: period } = await supabase
    .from("academic_periods")
    .select("id, name")
    .eq("status", "open")
    .maybeSingle();

  if (!period) return null;

  const { data: periodProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("period_id", period.id);

  const projectIds = (periodProjects ?? []).map((p) => p.id as string);
  const totalCount = projectIds.length;

  let attended = 0;
  if (totalCount > 0) {
    const { count } = await supabase
      .from("participations")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "attended")
      .in("project_id", projectIds);
    attended = count ?? 0;
  }
  const percent = totalCount === 0 ? 0 : Math.round((attended / totalCount) * 100);

  return {
    periodId: period.id,
    periodName: period.name,
    total: totalCount,
    attended,
    percent,
    projectedTier: computeTier(percent),
  };
}

export async function fetchPeriodHistory(
  supabase: SupabaseClient,
  studentId: string,
): Promise<PeriodResult[]> {
  const { data: results } = await supabase
    .from("student_period_results")
    .select(
      "total_projects, attended_projects, percent, tier, period:academic_periods(id, name, close_date)",
    )
    .eq("student_id", studentId);

  const { data: requests } = await supabase
    .from("certificate_requests")
    .select("id, period_id, status, certificate_file_url, requested_at, updated_at")
    .eq("student_id", studentId);

  const requestByPeriod = new Map<string, CertificateRequestInfo>();
  for (const req of requests ?? []) {
    requestByPeriod.set(req.period_id as string, {
      id: req.id as string,
      status: req.status as CertificateRequestStatus,
      certificate_file_url: req.certificate_file_url as string | null,
      requested_at: req.requested_at as string,
      updated_at: req.updated_at as string,
    });
  }

  type ResultRow = {
    total_projects: number;
    attended_projects: number;
    percent: number;
    tier: CertificateTier | null;
    period: { id: string; name: string; close_date: string | null } | null;
  };

  return ((results as unknown as ResultRow[]) ?? [])
    .filter((row) => row.period)
    .map((row) => ({
      periodId: row.period!.id,
      periodName: row.period!.name,
      closeDate: row.period!.close_date,
      total: row.total_projects,
      attended: row.attended_projects,
      percent: Number(row.percent),
      tier: row.tier,
      request: requestByPeriod.get(row.period!.id) ?? null,
    }))
    .sort((a, b) => (a.closeDate ?? "") < (b.closeDate ?? "") ? 1 : -1);
}
