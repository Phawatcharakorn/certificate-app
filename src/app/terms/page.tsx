import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { card, headingLg, smallText } from "@/lib/ui";
import { ORG_INFO } from "@/lib/site-config";

const SECTIONS = [
  {
    title: "คุณสมบัติผู้ใช้งาน",
    body: "ระบบนี้เปิดให้บริการเฉพาะนิสิตปัจจุบันของ " + ORG_INFO.name + " ที่ลงทะเบียนด้วยรหัสนิสิตและอีเมลของตนเองเท่านั้น",
  },
  {
    title: "ความรับผิดชอบของผู้ใช้งาน",
    body: "ผู้ใช้ต้องให้ข้อมูลที่ถูกต้องและเป็นความจริง และรับผิดชอบต่อการรักษาความปลอดภัยของบัญชีผู้ใช้ของตนเอง",
  },
  {
    title: "การใช้งานที่ไม่เหมาะสม",
    body: "ห้ามใช้ระบบเพื่อปลอมแปลงข้อมูลการเข้าร่วมกิจกรรม สวมรอยเป็นผู้อื่น หรือกระทำการใด ๆ ที่ขัดต่อระเบียบของมหาวิทยาลัย",
  },
  {
    title: "การเปลี่ยนแปลงข้อกำหนด",
    body: "มหาวิทยาลัยสงวนสิทธิ์ในการปรับปรุงข้อกำหนดการใช้งานได้ตามความเหมาะสม โดยจะแจ้งให้ทราบผ่านหน้านี้",
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className={`${card} flex flex-col gap-2 text-center`}>
          <h1 className={`${headingLg} text-slate-900`}>ข้อกำหนดการใช้งาน</h1>
          <p className={smallText}>
            ข้อกำหนดฉบับนี้เป็นตัวอย่างเบื้องต้น ควรได้รับการตรวจสอบและอนุมัติโดยหน่วยงานที่รับผิดชอบก่อนเผยแพร่ใช้งานจริง
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
