import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/require-admin";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { card, headingLg, smallText } from "@/lib/ui";
import { ORG_INFO } from "@/lib/site-config";

const SECTIONS = [
  {
    title: "ข้อมูลที่เราเก็บรวบรวม",
    body: "ระบบเก็บข้อมูลที่จำเป็นต่อการลงทะเบียนและออกใบ Certificate เช่น ชื่อ-นามสกุล รหัสนิสิต คณะ อีเมล และประวัติการเข้าร่วมกิจกรรม",
  },
  {
    title: "วัตถุประสงค์การใช้ข้อมูล",
    body: "ใช้เพื่อยืนยันตัวตนนิสิต ตรวจสอบสิทธิ์การรับ Certificate และติดต่อสื่อสารเรื่องโครงการกิจกรรมของศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) เท่านั้น",
  },
  {
    title: "การเก็บรักษาและความปลอดภัย",
    body: "ข้อมูลถูกจัดเก็บบนระบบที่มีการควบคุมสิทธิ์การเข้าถึง และจะเก็บไว้ตราบเท่าที่จำเป็นต่อการดำเนินงานของมหาวิทยาลัย",
  },
  {
    title: "สิทธิ์ของเจ้าของข้อมูล",
    body: "นิสิตสามารถขอตรวจสอบ แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของตนเองได้ โดยติดต่อผ่านช่องทางที่ระบุในหน้าติดต่อเรา",
  },
];

export default async function PrivacyPolicyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = await checkIsAdmin(supabase, user?.id);

  return (
    <>
      <PublicHeader isAdmin={isAdmin} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className={`${card} flex flex-col gap-2 text-center`}>
          <h1 className={`${headingLg} text-slate-900`}>นโยบายความเป็นส่วนตัว</h1>
          <p className={smallText}>
            นโยบายฉบับนี้เป็นตัวอย่างเบื้องต้น ควรได้รับการตรวจสอบและอนุมัติโดยหน่วยงานที่รับผิดชอบของ{" "}
            {ORG_INFO.nameEn} ก่อนเผยแพร่ใช้งานจริง
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title} className={`${card} flex flex-col gap-2`}>
            <h2 className="font-semibold text-slate-900">{section.title}</h2>
            <p className={smallText}>{section.body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
