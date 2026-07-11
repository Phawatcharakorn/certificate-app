## ระบบให้รางวัล Certificate นิสิต ม.เกษตรศาสตร์ ศรีราชา

Next.js (App Router) + Supabase (Postgres + Auth + Storage + Realtime)

## Setup

1. สร้าง Supabase project ที่ [supabase.com](https://supabase.com)
2. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่าจาก Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — ห้าม expose ฝั่ง client)
3. เชื่อมโปรเจ็คและรัน migration:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   คำสั่งนี้จะรัน migration ทั้งหมดใน `supabase/migrations/` (ตาราง, RLS policies, realtime publication, storage buckets, seed 5 คณะ)

4. ใน Supabase Dashboard → Authentication → Providers → Email ตรวจสอบว่า "Confirm email" ตรงตามที่ต้องการ (ปิดไว้ถ้าอยากให้นิสิต login ได้ทันทีหลังสมัคร)
5. เพิ่มบัญชีแอดมินคนแรกด้วยตัวเอง (ผ่าน SQL Editor หลังจากมี auth user แล้ว):

   ```sql
   insert into public.admins (id, email) values ('<auth-user-uuid>', 'admin@example.com');
   ```

6. รัน dev server:

   ```bash
   npm run dev
   ```

## Deploy on Vercel

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel --prod
```

หรือเชื่อม GitHub repo กับ Vercel dashboard แล้วตั้งค่า 3 environment variables ข้างต้นในหน้า Project Settings → Environment Variables ก่อน deploy
