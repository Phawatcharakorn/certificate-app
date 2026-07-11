-- นิสิตทั่วไปมองเห็นแค่แถว participations ของตัวเอง (RLS) แต่การแสดง
-- "เหลือกี่ที่นั่ง" ต้องรู้จำนวนผู้เข้าร่วมทั้งหมดของแต่ละโครงการ — ใช้ view
-- ที่นับจำนวนอย่างเดียว (ไม่เปิดเผยว่าใครลงทะเบียน) รันด้วยสิทธิ์ของเจ้าของ view
-- จึงข้าม RLS ของตาราง participations ได้อย่างปลอดภัย

create view public.project_participant_counts as
select project_id, count(*)::int as participant_count
from public.participations
group by project_id;

grant select on public.project_participant_counts to anon, authenticated;
