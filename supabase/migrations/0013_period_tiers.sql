-- Redesign certificates from per-project checklists to annual aggregate tiers.
-- Projects now belong to an academic_period; when admin closes a period,
-- every student's attendance percentage across that period's projects is
-- snapshotted into student_period_results with a Platinum/Gold/Silver tier
-- (or null = below 60%, no certificate).

-- =========================================================
-- 1. academic_periods
-- =========================================================
create type public.period_status as enum ('open', 'closed');

create table public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  open_date date not null,
  close_date date,
  status public.period_status not null default 'open',
  created_at timestamptz not null default now()
);

-- only one open period at a time
create unique index academic_periods_one_open
  on public.academic_periods ((true)) where (status = 'open');

-- =========================================================
-- 2. projects.period_id — backfill existing projects into a legacy period
-- =========================================================
alter table public.projects
  add column period_id uuid references public.academic_periods (id);

insert into public.academic_periods (name, open_date, close_date, status)
values ('ก่อนเริ่มระบบปีการศึกษา', current_date, current_date, 'closed');

update public.projects
set period_id = (
  select id from public.academic_periods
  where name = 'ก่อนเริ่มระบบปีการศึกษา'
)
where period_id is null;

alter table public.projects
  alter column period_id set not null;

-- =========================================================
-- 3. certificate_tier + student_period_results (frozen snapshot)
-- =========================================================
create type public.certificate_tier as enum ('platinum', 'gold', 'silver');

create table public.student_period_results (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.academic_periods (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  total_projects int not null,
  attended_projects int not null,
  percent numeric(5,2) not null,
  tier public.certificate_tier,
  computed_at timestamptz not null default now(),
  unique (period_id, student_id)
);

-- =========================================================
-- 4. certificate_templates — key off tier instead of a free-form name
-- =========================================================
alter table public.certificate_templates
  add column tier public.certificate_tier;

create unique index certificate_templates_one_per_tier
  on public.certificate_templates (tier);

-- =========================================================
-- 5. certificate_requests — restructure to reference a period, not a type
-- =========================================================
-- pre-production data only — safe to clear before reshaping the column
truncate table public.certificate_requests;

alter table public.certificate_requests
  drop constraint certificate_requests_certificate_type_id_fkey,
  drop column certificate_type_id,
  add column period_id uuid not null references public.academic_periods (id),
  add constraint certificate_requests_unique_period unique (student_id, period_id);

-- =========================================================
-- 6. drop the old certificate-type checklist model entirely
-- =========================================================
drop table public.certificate_type_requirements;
drop table public.certificate_type_sets;
drop table public.certificate_types;

-- =========================================================
-- 7. close_academic_period — atomic snapshot + close
-- =========================================================
create function public.close_academic_period(p_period_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_status public.period_status;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select status into v_status from public.academic_periods where id = p_period_id;
  if v_status is null then
    raise exception 'period not found';
  end if;
  if v_status <> 'open' then
    raise exception 'period already closed';
  end if;

  select count(*) into v_total from public.projects where period_id = p_period_id;

  insert into public.student_period_results
    (period_id, student_id, total_projects, attended_projects, percent, tier)
  select
    p_period_id,
    s.id,
    v_total,
    coalesce(att.cnt, 0),
    case when v_total = 0 then 0
         else round(coalesce(att.cnt, 0)::numeric / v_total * 100, 2) end,
    case
      when v_total = 0 then null
      when coalesce(att.cnt, 0)::numeric / v_total * 100 > 80 then 'platinum'
      when coalesce(att.cnt, 0)::numeric / v_total * 100 > 70 then 'gold'
      when coalesce(att.cnt, 0)::numeric / v_total * 100 >= 60 then 'silver'
      else null
    end
  from public.students s
  left join (
    select pt.student_id, count(*) cnt
    from public.participations pt
    join public.projects pr on pr.id = pt.project_id
    where pr.period_id = p_period_id and pt.status = 'attended'
    group by pt.student_id
  ) att on att.student_id = s.id
  on conflict (period_id, student_id) do update
    set total_projects = excluded.total_projects,
        attended_projects = excluded.attended_projects,
        percent = excluded.percent,
        tier = excluded.tier,
        computed_at = now();

  update public.academic_periods
    set status = 'closed', close_date = current_date
    where id = p_period_id;
end;
$$;

grant execute on function public.close_academic_period(uuid) to authenticated;

-- =========================================================
-- 8. RLS
-- =========================================================
alter table public.academic_periods enable row level security;
alter table public.student_period_results enable row level security;

create policy "academic_periods_select_all" on public.academic_periods
  for select using (true);

create policy "academic_periods_write_admin" on public.academic_periods
  for all using (public.is_admin()) with check (public.is_admin());

create policy "student_period_results_select_own_or_admin" on public.student_period_results
  for select using (student_id = auth.uid() or public.is_admin());
