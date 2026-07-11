-- เปิด Supabase Realtime (Postgres Changes) ให้ตารางที่ต้อง subscribe:
-- projects (นิสิตเห็นโครงการใหม่ทันที)
-- participations (แอดมินเห็นคนเข้าร่วมทันที)
-- certificate_requests (นิสิตเห็นสถานะคำร้องเปลี่ยนทันที)

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.participations;
alter publication supabase_realtime add table public.certificate_requests;
