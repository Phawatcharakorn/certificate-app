-- รองรับ "ชุด" (set) ของโครงการในเกณฑ์ใบเซอร์เดียวกัน — นิสิตทำครบ "ชุดใดชุดหนึ่ง"
-- ก็ผ่านเกณฑ์ในส่วนนั้น (นอกเหนือจากรายการ "ปกติ" ที่ต้องทำให้ครบทุกอันเหมือนเดิม
-- เมื่อ set_id เป็น null ถือว่าอยู่ในรายการปกติ)

create table public.certificate_type_sets (
  id uuid primary key default gen_random_uuid(),
  certificate_type_id uuid not null references public.certificate_types (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.certificate_type_sets enable row level security;

create policy "certificate_type_sets_select_all" on public.certificate_type_sets
  for select using (true);

create policy "certificate_type_sets_write_admin" on public.certificate_type_sets
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.certificate_type_requirements
  add column set_id uuid references public.certificate_type_sets (id) on delete cascade;
