import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/require-admin";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { card, buttonPrimary, buttonSecondary } from "@/lib/ui";

const ELIGIBILITY = [
  {
    title: "เป็นนิสิตมหาวิทยาลัย",
    description: "เป็นนิสิตมหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา",
  },
  {
    title: "เข้าร่วมกิจกรรมที่กำหนด",
    description:
      "เข้าร่วมกิจกรรมที่ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) กำหนดตลอดปีการศึกษา",
  },
  {
    title: "ลงทะเบียนและมีหลักฐาน",
    description: "ลงทะเบียนและมีหลักฐานการเข้าร่วมกิจกรรมครบถ้วนตามระบบที่มหาวิทยาลัยกำหนด",
  },
  {
    title: "นับเฉพาะกิจกรรมที่ประกาศ",
    description: "นับเฉพาะกิจกรรมที่ประกาศให้สามารถสะสมสิทธิ์รับ Certificate",
  },
];

const TIERS = [
  {
    name: "Platinum",
    range: "มากกว่าร้อยละ 80",
    percent: "> 80%",
    accent: "border-blue-200 bg-blue-50/60",
    badge: "bg-blue-700",
  },
  {
    name: "Gold",
    range: "มากกว่าร้อยละ 70 ถึงร้อยละ 80",
    percent: "> 70% ถึง 80%",
    accent: "border-amber-200 bg-amber-50/60",
    badge: "bg-amber-500",
  },
  {
    name: "Silver",
    range: "ร้อยละ 60 ถึงร้อยละ 70",
    percent: "≥ 60% ถึง 70%",
    accent: "border-slate-200 bg-slate-50",
    badge: "bg-slate-400",
  },
];

const EXAMPLES = [
  { joined: "17–20 กิจกรรม", note: "(มากกว่า 80%)", tier: "Platinum" },
  { joined: "15–16 กิจกรรม", note: "(มากกว่า 70–80%)", tier: "Gold" },
  { joined: "12–14 กิจกรรม", note: "(60–70%)", tier: "Silver" },
];

const NOTES = [
  "นิสิตต้องเข้าร่วมกิจกรรมของศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) ตลอดปีการศึกษา (ภาคต้นและภาคปลาย)",
  "การลงทะเบียนและเช็กชื่อเข้าร่วมกิจกรรมเป็นไปตามระบบที่มหาวิทยาลัยกำหนด",
  "ผู้ที่มีสิทธิ์เข้าร่วมต่ำกว่าร้อยละ 60 จะไม่ได้รับ Certificate",
  "ผลการพิจารณาของศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) ถือเป็นที่สิ้นสุด",
];

export default async function CertificateCriteriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = await checkIsAdmin(supabase, user?.id);

  return (
    <>
      <PublicHeader active="criteria" isAdmin={isAdmin} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <div className={`${card} anim-pop-in flex flex-col gap-3 text-center`}>
          <h1 className="text-2xl font-semibold text-slate-900">
            หลักเกณฑ์การมอบ Certificate
          </h1>
          <p className="text-slate-500">
            การเข้าร่วมกิจกรรมพัฒนานิสิต ประจำปีการศึกษา
          </p>
          <p className="text-sm font-medium text-blue-700">
            พัฒนาตนเอง สะสมประสบการณ์ สร้าง Portfolio พร้อมรับ Certificate
            ระดับ Platinum • Gold • Silver
          </p>
        </div>

        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-center font-semibold text-slate-900">
            คุณสมบัติของผู้มีสิทธิ์ได้รับ Certificate
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ELIGIBILITY.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-1 rounded-xl border border-slate-100 p-4"
              >
                <p className="font-medium text-blue-700">{item.title}</p>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-center font-semibold text-slate-900">
            ระดับ Certificate และเกณฑ์การให้คะแนน
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center ${tier.accent}`}
              >
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${tier.badge}`}
                >
                  {tier.name.toUpperCase()}
                </span>
                <p className="text-2xl font-bold text-slate-900">
                  {tier.percent}
                </p>
                <p className="text-sm text-slate-500">
                  เข้าร่วมกิจกรรม{tier.range}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-center font-semibold text-slate-900">
            วิธีการคำนวณ
          </h2>
          <p className="text-center text-sm text-slate-500">
            ร้อยละการเข้าร่วมกิจกรรม = (จำนวนกิจกรรมที่เข้าร่วม ÷ จำนวนกิจกรรมที่จัดทั้งหมด) × 100
          </p>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="mb-3 text-center text-sm font-medium text-slate-600">
              ตัวอย่างการคำนวณ (มีกิจกรรมทั้งหมด 20 กิจกรรม)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {EXAMPLES.map((example) => (
                <div
                  key={example.tier}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 p-3 text-center"
                >
                  <p className="font-medium text-slate-900">
                    เข้าร่วม {example.joined}
                  </p>
                  <p className="text-xs text-slate-400">{example.note}</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {example.tier}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${card} flex flex-col gap-3`}>
          <h2 className="font-semibold text-slate-900">หมายเหตุ</h2>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            {NOTES.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <p className="text-center text-sm font-medium text-blue-700">
            เข้าร่วมกิจกรรมให้มากขึ้น พัฒนาตนเองอย่างต่อเนื่อง
            สู่ความสำเร็จในอนาคต!
          </p>
        </section>

        <div className="flex flex-col gap-3 text-base font-medium sm:flex-row sm:justify-center">
          <Link href="/register" className={buttonPrimary}>
            ลงทะเบียนเข้าร่วม
          </Link>
          <Link href="/" className={buttonSecondary}>
            กลับหน้าแรก
          </Link>
        </div>
      </main>
    </>
  );
}
