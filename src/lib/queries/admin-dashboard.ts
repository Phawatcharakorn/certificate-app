import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateRequestStatus } from "@/types/database";

export interface DashboardSummary {
  totalProjects: number;
  totalStudents: number;
  totalCertificatesIssued: number;
  pendingApprovals: number;
  recentActivityCount: number;
}

export interface RecentProject {
  id: string;
  code: string;
  name: string;
  event_date: string;
  created_at: string;
}

export interface RecentCertificate {
  id: string;
  status: CertificateRequestStatus;
  updated_at: string;
  student: { full_name: string; student_code: string } | null;
  period: { name: string } | null;
}

export interface PendingApproval {
  id: string;
  requested_at: string;
  student: { full_name: string; student_code: string } | null;
  period: { name: string } | null;
}

export interface AdminDashboardData {
  summary: DashboardSummary;
  recentProjects: RecentProject[];
  recentCertificates: RecentCertificate[];
  pendingApprovals: PendingApproval[];
}

const RECENT_ACTIVITY_WINDOW_DAYS = 7;

export async function fetchAdminDashboard(
  supabase: SupabaseClient,
): Promise<AdminDashboardData> {
  const since = new Date(
    Date.now() - RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { count: totalProjects },
    { count: totalStudents },
    { count: totalCertificatesIssued },
    { count: pendingCount },
    { count: recentJoins },
    { count: recentRequests },
    { data: recentProjects },
    { data: recentCertificates },
    { data: pendingApprovals },
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase
      .from("certificate_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("certificate_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("participations")
      .select("id", { count: "exact", head: true })
      .gte("joined_at", since),
    supabase
      .from("certificate_requests")
      .select("id", { count: "exact", head: true })
      .gte("requested_at", since),
    supabase
      .from("projects")
      .select("id, code, name, event_date, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("certificate_requests")
      .select(
        "id, status, updated_at, student:students(full_name, student_code), period:academic_periods(name)",
      )
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("certificate_requests")
      .select(
        "id, requested_at, student:students(full_name, student_code), period:academic_periods(name)",
      )
      .eq("status", "pending")
      .order("requested_at", { ascending: true })
      .limit(5),
  ]);

  return {
    summary: {
      totalProjects: totalProjects ?? 0,
      totalStudents: totalStudents ?? 0,
      totalCertificatesIssued: totalCertificatesIssued ?? 0,
      pendingApprovals: pendingCount ?? 0,
      recentActivityCount: (recentJoins ?? 0) + (recentRequests ?? 0),
    },
    recentProjects: (recentProjects as RecentProject[]) ?? [],
    recentCertificates: (recentCertificates as unknown as RecentCertificate[]) ?? [],
    pendingApprovals: (pendingApprovals as unknown as PendingApproval[]) ?? [],
  };
}
