import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { card, headingLg, smallText } from "@/lib/ui";

const FAQS = [
  {
    q: "ใครมีสิทธิ์รับ Certificate บ้าง",
    a: "นิสิตมหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา ที่เข้าร่วมกิจกรรมของศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) ครบตามเกณฑ์ที่กำหนดในแต่ละปีการศึกษา",
  },
  {
    q: "Certificate มีกี่ระดับ ต่างกันอย่างไร",
    a: "มี 3 ระดับ ได้แก่ Platinum (เข้าร่วมมากกว่า 80%) Gold (มากกว่า 70-80%) และ Silver (60-70%) ผู้ที่เข้าร่วมต่ำกว่า 60% จะไม่ได้รับ Certificate",
  },
  {
    q: "ต้องลงทะเบียนเข้าร่วมโครงการอย่างไร",
    a: "สมัครสมาชิกด้วยรหัสนิสิตและอีเมล จากนั้นเลือกโครงการที่เปิดรับจากหน้า Dashboard แล้วกดเข้าร่วมได้ทันที",
  },
  {
    q: "ยื่นคำร้องขอใบ Certificate ได้เมื่อไหร่",
    a: "เมื่อเข้าร่วมกิจกรรมครบตามเกณฑ์ของปีการศึกษานั้น ระบบจะเปิดให้ยื่นคำร้องได้จากหน้าสถานะใบ Certificate และดาวน์โหลดไฟล์ได้หลังแอดมินอนุมัติ",
  },
  {
    q: "ลืมรหัสผ่านหรือเข้าสู่ระบบไม่ได้ ต้องทำอย่างไร",
    a: "ติดต่อผู้ดูแลระบบผ่านช่องทางในหน้าติดต่อเรา เพื่อขอความช่วยเหลือในการรีเซ็ตบัญชีผู้ใช้งาน",
  },
];

export default function FaqPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className={`${card} flex flex-col gap-2 text-center`}>
          <h1 className={`${headingLg} text-slate-900`}>คำถามที่พบบ่อย</h1>
          <p className={smallText}>
            ดูรายละเอียดเกณฑ์แบบเต็มได้ที่หน้า{" "}
            <Link href="/certificate-criteria" className="text-blue-700 underline">
              หลักเกณฑ์การมอบ Certificate
            </Link>
          </p>
        </div>

        <section className="flex flex-col gap-3">
          {FAQS.map((item) => (
            <details key={item.q} className={`${card} group`}>
              <summary className="cursor-pointer list-none font-medium text-slate-900 marker:content-none">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="shrink-0 text-slate-400 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className={`${smallText} mt-2`}>{item.a}</p>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
