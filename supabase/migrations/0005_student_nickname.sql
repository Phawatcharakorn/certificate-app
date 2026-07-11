-- เพิ่มชื่อเล่นให้นิสิตกรอกตอนสมัคร และเปิด realtime ให้ตาราง students
-- เพื่อให้หน้าแอดมิน (จัดการนิสิต) อัปเดตสดได้เหมือนตารางอื่นๆ

alter table public.students add column nickname text;

alter publication supabase_realtime add table public.students;
