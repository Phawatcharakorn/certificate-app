-- ระบบให้รางวัล Certificate นิสิต ม.เกษตรศาสตร์ ศรีราชา
-- Core schema: faculties, students, admins, registration_periods, projects,
-- project_faculties, participations, certificate_types, certificate_type_requirements,
-- certificate_requests, certificate_templates

-- =========================================================
-- 1. faculties (คณะ) — master data
-- =========================================================
create table public.faculties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- =========================================================
-- 2. students (นิสิต)
-- =========================================================
create table public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  student_code text not null unique,
  full_name text not null,
  faculty_id uuid not null references public.faculties (id),
  enrolled_year int not null,
  created_at timestamptz not null default now()
);

-- year_level (ชั้นปีปัจจุบัน) ต้องคำนวณจากปีการศึกษาปัจจุบัน ซึ่งไม่ใช่ค่าคงที่
-- (immutable) จึงทำเป็น generated column ไม่ได้ — ใช้ฟังก์ชัน + view แทน
-- เพื่อไม่ต้อง update มือทุกปี
create function public.calc_year_level(enrolled_year int)
returns int
language sql
stable
as $$
  select greatest(1, extract(year from current_date)::int - enrolled_year + 1)
$$;

create view public.students_with_year_level as
select
  s.*,
  public.calc_year_level(s.enrolled_year) as year_level
from public.students s;

-- =========================================================
-- 3. admins
-- =========================================================
create table public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin'
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid())
$$;

-- =========================================================
-- 4. registration_periods (ช่วงเวลาเปิดรับสมัครสมาชิกระบบ)
-- =========================================================
create table public.registration_periods (
  id uuid primary key default gen_random_uuid(),
  open_date date not null,
  close_date date not null,
  is_active boolean not null default true
);

-- =========================================================
-- 5. projects (โครงการ/กิจกรรม)
-- =========================================================
create type public.target_faculty_mode as enum ('all', 'specific');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  event_date date not null,
  location text,
  duration text,
  responsible_person text,
  organizer_office text not null default 'สำนักงานวิทยาเขต งานบริหารกิจการนิสิตและการกีฬา',
  target_faculty_mode public.target_faculty_mode not null default 'all',
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. project_faculties (คณะที่เข้าร่วมได้ — ใช้เมื่อ mode='specific')
-- =========================================================
create table public.project_faculties (
  project_id uuid not null references public.projects (id) on delete cascade,
  faculty_id uuid not null references public.faculties (id) on delete cascade,
  primary key (project_id, faculty_id)
);

-- =========================================================
-- 7. participations (การเข้าร่วมของนิสิต)
-- =========================================================
create type public.participation_status as enum ('registered', 'attended', 'absent');

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  joined_at timestamptz not null default now(),
  status public.participation_status not null default 'registered',
  unique (student_id, project_id)
);

-- =========================================================
-- 8. certificate_types + certificate_type_requirements (เงื่อนไขการได้ใบเซอร์)
-- =========================================================
create table public.certificate_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

create table public.certificate_type_requirements (
  certificate_type_id uuid not null references public.certificate_types (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  required boolean not null default true,
  primary key (certificate_type_id, project_id)
);

-- =========================================================
-- 9. certificate_requests (คำร้องขอใบเซอร์)
-- =========================================================
create type public.certificate_request_status as enum ('pending', 'processing', 'completed', 'rejected');

create table public.certificate_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  certificate_type_id uuid not null references public.certificate_types (id),
  status public.certificate_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  certificate_file_url text
);

-- =========================================================
-- 10. certificate_templates
-- =========================================================
create table public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  background_image_url text,
  field_positions jsonb not null default '{}'::jsonb
);

-- =========================================================
-- Seed: 5 คณะ
-- =========================================================
insert into public.faculties (name) values
  ('วิทยาการจัดการ'),
  ('วิศวกรรมศาสตร์ ศรีราชา'),
  ('พาณิชยนาวีนานาชาติ'),
  ('วิทยาศาสตร์ ศรีราชา'),
  ('เศรษฐศาสตร์ ศรีราชา');
