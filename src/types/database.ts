export type TargetFacultyMode = "all" | "specific";
export type ParticipationStatus = "registered" | "attended" | "absent";
export type CertificateRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected";
export type PeriodStatus = "open" | "closed";
export type CertificateTier = "platinum" | "gold" | "silver";

export interface Faculty {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  nickname: string | null;
  faculty_id: string;
  enrolled_year: number;
  created_at: string;
}

export interface StudentWithYearLevel extends Student {
  year_level: number;
}

export interface Admin {
  id: string;
  email: string;
  username: string | null;
  role: string;
}

export interface RegistrationPeriod {
  id: string;
  open_date: string;
  close_date: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string | null;
  event_date: string;
  location: string | null;
  duration: string | null;
  responsible_person: string | null;
  organizer_office: string;
  target_faculty_mode: TargetFacultyMode;
  capacity: number | null;
  cover_image_url: string | null;
  period_id: string;
  created_at: string;
}

export interface AcademicPeriod {
  id: string;
  name: string;
  open_date: string;
  close_date: string | null;
  status: PeriodStatus;
  created_at: string;
}

export interface StudentPeriodResult {
  id: string;
  period_id: string;
  student_id: string;
  total_projects: number;
  attended_projects: number;
  percent: number;
  tier: CertificateTier | null;
  computed_at: string;
}

export interface ProjectFaculty {
  project_id: string;
  faculty_id: string;
}

export interface Participation {
  id: string;
  student_id: string;
  project_id: string;
  joined_at: string;
  status: ParticipationStatus;
}

export interface CertificateRequest {
  id: string;
  student_id: string;
  period_id: string;
  status: CertificateRequestStatus;
  requested_at: string;
  updated_at: string;
  certificate_file_url: string | null;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  background_image_url: string | null;
  field_positions: Record<string, { x: number; y: number }>;
  tier: CertificateTier | null;
}
