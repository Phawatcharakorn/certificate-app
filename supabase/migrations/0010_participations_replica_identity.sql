-- Postgres ส่งแค่ primary key มาด้วย DELETE event ตามค่าเริ่มต้น (REPLICA IDENTITY
-- DEFAULT) ทำให้ realtime filter แบบ "student_id=eq.xxx" จับ DELETE ไม่ได้เลย
-- (ไม่มี student_id ติดมาด้วย) — ต้องเปลี่ยนเป็น FULL เพื่อให้ payload มีคอลัมน์
-- ครบตอนลบแถว ปุ่ม "ยกเลิกลงทะเบียน" จะได้อัปเดตหน้าจอแบบ realtime ได้จริง

alter table public.participations replica identity full;
