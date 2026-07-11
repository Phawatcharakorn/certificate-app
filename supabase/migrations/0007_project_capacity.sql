-- จำกัดจำนวนที่นั่งต่อโครงการได้ (null = ไม่จำกัด)

alter table public.projects add column capacity integer;
