import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/require-admin";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { card, headingLg, smallText } from "@/lib/ui";
import { ORG_INFO } from "@/lib/site-config";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

export default async function ContactPage() {
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
          <h1 className={`${headingLg} text-slate-900`}>ติดต่อเรา</h1>
          <p className={smallText}>
            ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC) {ORG_INFO.name}
          </p>
        </div>

        <section className={`${card} flex flex-col gap-4`}>
          <div className="flex items-start gap-3">
            <MapPinIcon width={18} height={18} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="font-medium text-slate-900">ที่อยู่</p>
              <p className={smallText}>{ORG_INFO.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PhoneIcon width={18} height={18} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="font-medium text-slate-900">โทรศัพท์</p>
              <a href={`tel:${ORG_INFO.phoneHref}`} className={`${smallText} hover:text-blue-700 hover:underline`}>
                {ORG_INFO.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MailIcon width={18} height={18} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="font-medium text-slate-900">อีเมล</p>
              <a href={`mailto:${ORG_INFO.email}`} className={`${smallText} hover:text-blue-700 hover:underline`}>
                {ORG_INFO.email}
              </a>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400">
          ข้อมูลติดต่อในหน้านี้เป็นตัวอย่าง กรุณาแทนที่ด้วยข้อมูลจริงของหน่วยงานก่อนเผยแพร่ใช้งาน
        </p>
      </main>
      <Footer />
    </>
  );
}
