-- รูปปกโครงการ: เพิ่มคอลัมน์เก็บ URL รูป + storage bucket สำหรับแอดมินอัพโหลด

alter table public.projects
  add column cover_image_url text;

insert into storage.buckets (id, name, public)
values ('project-covers', 'project-covers', true)
on conflict (id) do nothing;

create policy "project_covers_read_public" on storage.objects
  for select using (bucket_id = 'project-covers');

create policy "project_covers_write_admin" on storage.objects
  for insert with check (bucket_id = 'project-covers' and public.is_admin());

create policy "project_covers_update_admin" on storage.objects
  for update using (bucket_id = 'project-covers' and public.is_admin());

create policy "project_covers_delete_admin" on storage.objects
  for delete using (bucket_id = 'project-covers' and public.is_admin());
