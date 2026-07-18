import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  buttonSecondary,
  cardGlass,
  eyebrow,
  headingLg,
  headingXl,
  smallText,
} from "@/lib/ui";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { fetchPublicProjects } from "@/lib/queries/public-projects";
import {
  BadgeIcon,
  BuildingIcon,
  CheckCircleIcon,
  FileTextIcon,
  SendIcon,
} from "@/components/icons";

const STEPS = [
  {
    icon: SendIcon,
    title: "1. สมัครสมาชิก",
    description: "ลงทะเบียนด้วยรหัสนิสิตและอีเมล ใช้เวลาไม่ถึงนาที",
  },
  {
    icon: CheckCircleIcon,
    title: "2. เข้าร่วมโครงการ",
    description: "เลือกโครงการกิจกรรมที่เปิดรับ แล้วเข้าร่วมได้จากหน้า dashboard",
  },
  {
    icon: BadgeIcon,
    title: "3. รับใบ Certificate",
    description: "เข้าร่วมครบตามเกณฑ์ ยื่นคำร้อง แล้วดาวน์โหลดใบเซอร์ได้ทันที",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: period }, { count: projectCount }, { count: closedPeriodCount }, { data: faculties }, upcomingProjects] =
    await Promise.all([
      supabase
        .from("registration_periods")
        .select("id")
        .eq("is_active", true)
        .lte("open_date", today)
        .gte("close_date", today)
        .limit(1)
        .maybeSingle(),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("academic_periods")
        .select("id", { count: "exact", head: true })
        .eq("status", "closed"),
      supabase.from("faculties").select("id"),
      fetchPublicProjects(supabase, { upcomingOnly: true, limit: 3 }),
    ]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 p-6 sm:p-8">
        <div
          className="anim-pop-in relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-[0_24px_60px_-24px_rgba(13,60,86,0.55)] sm:p-12"
          style={{
            background:
              "linear-gradient(120deg, #0d2f4e 0%, #0f5c52 55%, #0d7a6a 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-3">
            <span className={`${eyebrow} text-teal-100/85`}>
              มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
            </span>
            <h1 className={`${headingXl} text-white`}>
              ระบบให้รางวัล Certificate นิสิต
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-teal-50/85">
              เข้าร่วมโครงการ สะสมกิจกรรม รับใบเซอร์ทิฟิเคตง่าย ๆ ใน 3 ขั้นตอน
            </p>
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-3 text-base font-medium sm:flex-row sm:justify-center">
            {period ? (
              <Link
                href="/register"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-teal-900 shadow-lg shadow-black/20 transition-all duration-150 hover:shadow-xl hover:shadow-black/25 active:scale-95"
              >
                เริ่มลงทะเบียนเลย
              </Link>
            ) : (
              <span className="flex h-14 items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/5 px-6 text-teal-100/70">
                ขณะนี้ปิดรับสมัคร
              </span>
            )}

            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95"
            >
              เข้าสู่ระบบนิสิต
            </Link>
          </div>

          <Link
            href="/certificate-criteria"
            className="relative mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-teal-100/90 underline underline-offset-4 transition hover:text-white"
          >
            ดูหลักเกณฑ์การมอบ Certificate (Platinum / Gold / Silver)
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={FileTextIcon}
            value={projectCount ?? 0}
            label="โครงการทั้งหมด"
            delay="anim-delay-1"
          />
          <StatCard
            icon={BadgeIcon}
            value={closedPeriodCount ?? 0}
            label="ปีการศึกษาที่ผ่านมา"
            delay="anim-delay-2"
          />
          <StatCard
            icon={BuildingIcon}
            value={faculties?.length ?? 0}
            label="คณะที่เข้าร่วมได้"
            delay="anim-delay-3"
          />
        </section>

        <section className={`${cardGlass} flex flex-col gap-6`}>
          <h2 className={`text-center ${headingLg} text-slate-900`}>ใช้งานง่ายใน 3 ขั้นตอน</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-800 text-white shadow-md shadow-teal-900/20">
                  <step.icon width={20} height={20} />
                </span>
                <p className="font-semibold tracking-tight text-slate-900">
                  {step.title}
                </p>
                <p className={smallText}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {upcomingProjects.length > 0 && (
          <section className={`${cardGlass} flex flex-col gap-5`}>
            <h2 className={`${headingLg} text-slate-900`}>โครงการที่กำลังจะจัดขึ้น</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingProjects.map((project) => (
                <div key={project.id} className="stagger-card">
                  <ProjectCard
                    code={project.code}
                    name={project.name}
                    description={project.description}
                    eventDate={project.event_date}
                    location={project.location}
                    duration={project.duration}
                    capacity={project.capacity}
                    joinedCount={project.participantCount}
                    coverImageUrl={project.cover_image_url}
                    href={`/projects/${project.id}`}
                  />
                </div>
              ))}
            </div>
            <Link href="/projects" className={`${buttonSecondary} mx-auto`}>
              ดูโครงการที่เปิดทั้งหมด
            </Link>
          </section>
        )}

        <Link
          href="/admin/login"
          className="mx-auto text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
        >
          เข้าสู่ระบบแอดมิน
        </Link>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: typeof FileTextIcon;
  value: number;
  label: string;
  delay?: string;
}) {
  return (
    <div
      className={`${cardGlass} anim-slide-up ${delay ?? ""} flex items-center gap-4 p-5`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-blue-800 text-white shadow-md shadow-slate-900/10">
        <Icon width={20} height={20} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        <span className={smallText}>{label}</span>
      </div>
    </div>
  );
}
