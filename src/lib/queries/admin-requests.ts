import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus, CertificateTier } from "@/types/database";

export interface AdminRequestRow {
  id: string;
  status: CertificateRequestStatus;
  requested_at: string;
  certificate_file_url: string | null;
  student: { full_name: string; student_code: string } | null;
  period: { name: string } | null;
  tier: CertificateTier | null;
}

export async function fetchAdminRequests(
  supabase: SupabaseClient,
): Promise<AdminRequestRow[]> {
  const { data } = await supabase
    .from("certificate_requests")
    .select(
      "id, status, requested_at, certificate_file_url, student_id, period_id, student:students(full_name, student_code), period:academic_periods(name)",
    )
    .order("requested_at", { ascending: true });

  const rows = (data as unknown as (AdminRequestRow & {
    student_id: string;
    period_id: string;
  })[]) ?? [];

  if (rows.length === 0) return [];

  const { data: results } = await supabase
    .from("student_period_results")
    .select("student_id, period_id, tier");

  const tierByKey = new Map<string, CertificateTier | null>();
  for (const row of results ?? []) {
    tierByKey.set(`${row.student_id}:${row.period_id}`, row.tier);
  }

  return rows.map((row) => ({
    ...row,
    tier: tierByKey.get(`${row.student_id}:${row.period_id}`) ?? null,
  }));
}
