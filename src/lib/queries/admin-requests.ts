import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus } from "@/types/database";

export interface AdminRequestRow {
  id: string;
  status: CertificateRequestStatus;
  requested_at: string;
  certificate_file_url: string | null;
  student: { full_name: string; student_code: string } | null;
  certificate_type: { name: string } | null;
}

export async function fetchAdminRequests(
  supabase: SupabaseClient,
): Promise<AdminRequestRow[]> {
  const { data } = await supabase
    .from("certificate_requests")
    .select(
      "id, status, requested_at, certificate_file_url, student:students(full_name, student_code), certificate_type:certificate_types(name)",
    )
    .order("requested_at", { ascending: true });

  return (data as unknown as AdminRequestRow[]) ?? [];
}
