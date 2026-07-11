-- Row Level Security: นิสิตเห็นแค่ข้อมูลตัวเอง, แอดมินเห็นทั้งหมด

alter table public.faculties enable row level security;
alter table public.students enable row level security;
alter table public.admins enable row level security;
alter table public.registration_periods enable row level security;
alter table public.projects enable row level security;
alter table public.project_faculties enable row level security;
alter table public.participations enable row level security;
alter table public.certificate_types enable row level security;
alter table public.certificate_type_requirements enable row level security;
alter table public.certificate_requests enable row level security;
alter table public.certificate_templates enable row level security;

-- ---------------------------------------------------------
-- faculties — master data ใครอ่านก็ได้ (ต้องใช้ตอนสมัคร), แก้ได้เฉพาะแอดมิน
-- ---------------------------------------------------------
create policy "faculties_select_all" on public.faculties
  for select using (true);

create policy "faculties_write_admin" on public.faculties
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- students
-- ---------------------------------------------------------
create policy "students_select_own_or_admin" on public.students
  for select using (id = auth.uid() or public.is_admin());

create policy "students_insert_self" on public.students
  for insert with check (id = auth.uid());

create policy "students_update_own_or_admin" on public.students
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------
-- admins — เห็นตัวเองหรือถ้าเป็นแอดมินเห็นทั้งหมด, ไม่มี public insert
-- (เพิ่มแอดมินใหม่ผ่าน service role เท่านั้น)
-- ---------------------------------------------------------
create policy "admins_select_own_or_admin" on public.admins
  for select using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------
-- registration_periods — อ่านได้ทุกคน (ต้องเช็คก่อนสมัคร), แก้ไขเฉพาะแอดมิน
-- ---------------------------------------------------------
create policy "registration_periods_select_all" on public.registration_periods
  for select using (true);

create policy "registration_periods_write_admin" on public.registration_periods
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- projects — นิสิตอ่านได้ทุกโครงการ (กรอง faculty rule ฝั่ง client/query),
-- เขียนได้เฉพาะแอดมิน
-- ---------------------------------------------------------
create policy "projects_select_all" on public.projects
  for select using (true);

create policy "projects_write_admin" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- project_faculties
-- ---------------------------------------------------------
create policy "project_faculties_select_all" on public.project_faculties
  for select using (true);

create policy "project_faculties_write_admin" on public.project_faculties
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- participations — นิสิตเห็น/สร้างแถวของตัวเอง, แอดมินเห็น/แก้ไขทั้งหมด
-- ---------------------------------------------------------
create policy "participations_select_own_or_admin" on public.participations
  for select using (student_id = auth.uid() or public.is_admin());

create policy "participations_insert_own" on public.participations
  for insert with check (student_id = auth.uid());

create policy "participations_update_admin" on public.participations
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- certificate_types / certificate_type_requirements — อ่านได้ทุกคน (นิสิตต้องดู
-- % ความคืบหน้า), เขียนได้เฉพาะแอดมิน
-- ---------------------------------------------------------
create policy "certificate_types_select_all" on public.certificate_types
  for select using (true);

create policy "certificate_types_write_admin" on public.certificate_types
  for all using (public.is_admin()) with check (public.is_admin());

create policy "certificate_type_requirements_select_all" on public.certificate_type_requirements
  for select using (true);

create policy "certificate_type_requirements_write_admin" on public.certificate_type_requirements
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- certificate_requests — นิสิตเห็น/สร้างคำร้องของตัวเอง, แอดมินเห็น/อัปเดตทั้งหมด
-- ---------------------------------------------------------
create policy "certificate_requests_select_own_or_admin" on public.certificate_requests
  for select using (student_id = auth.uid() or public.is_admin());

create policy "certificate_requests_insert_own" on public.certificate_requests
  for insert with check (student_id = auth.uid());

create policy "certificate_requests_update_admin" on public.certificate_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- certificate_templates — จัดการโดยแอดมินเท่านั้น
-- ---------------------------------------------------------
create policy "certificate_templates_select_admin" on public.certificate_templates
  for select using (public.is_admin());

create policy "certificate_templates_write_admin" on public.certificate_templates
  for all using (public.is_admin()) with check (public.is_admin());
