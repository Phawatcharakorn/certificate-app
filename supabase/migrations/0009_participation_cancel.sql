-- นิสิตยกเลิกการลงทะเบียนของตัวเองได้ (เฉพาะตอนยังเป็นสถานะ "registered" —
-- แอปฝั่ง client บังคับเงื่อนไขนี้อยู่แล้ว แต่กันไว้ระดับ DB ด้วยเพื่อความปลอดภัย)

create policy "participations_delete_own_registered" on public.participations
  for delete using (student_id = auth.uid() and status = 'registered');
