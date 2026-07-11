-- Storage buckets: certificate-templates (พื้นหลังใบเซอร์ที่แอดมินอัพโหลด)
-- และ certificates (ไฟล์ PDF ที่ gen เสร็จแล้ว)

insert into storage.buckets (id, name, public)
values ('certificate-templates', 'certificate-templates', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

create policy "certificate_templates_read_public" on storage.objects
  for select using (bucket_id = 'certificate-templates');

create policy "certificate_templates_write_admin" on storage.objects
  for insert with check (bucket_id = 'certificate-templates' and public.is_admin());

create policy "certificate_templates_update_admin" on storage.objects
  for update using (bucket_id = 'certificate-templates' and public.is_admin());

create policy "certificate_templates_delete_admin" on storage.objects
  for delete using (bucket_id = 'certificate-templates' and public.is_admin());

-- ไฟล์ certificate ที่ gen เสร็จ: อ่านได้ทุกคน (ลิงก์เข้าถึงยากเพราะเป็น
-- uuid ของคำร้อง), เขียนได้เฉพาะฝั่ง server (service role ใน generate action)
create policy "certificates_read_public" on storage.objects
  for select using (bucket_id = 'certificates');
