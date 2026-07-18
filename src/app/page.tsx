import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { buttonPrimary, buttonSecondary, card } from "@/lib/ui";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { fetchPublicProjects } from "@/lib/queries/public-projects";

const STEPS = [
  {
    title: "1. สมัครสมาชิก",
    description: "ลงทะเบียนด้วยรหัสนิสิตและอีเมล ใช้เวลาไม่ถึงนาที",
  },
  {
    title: "2. เข้าร่วมโครงการ",
    description: "เลือกโครงการกิจกรรมที่เปิดรับ แล้วเข้าร่วมได้จากหน้า dashboard",
  },
  {
    title: "3. รับใบ Certificate",
    description: "เข้าร่วมครบตามเกณฑ์ ยื่นคำร้อง แล้วดาวน์โหลดใบเซอร์ได้ทันที",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: period }, { count: projectCount }, { count: certTypeCount }, { data: faculties }, upcomingProjects] =
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
        .from("certificate_types")
        .select("id", { count: "exact", head: true }),
      supabase.from("faculties").select("id"),
      fetchPublicProjects(supabase, { upcomingOnly: true, limit: 3 }),
    ]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <div
          className="anim-pop-in flex flex-col gap-6 rounded-2xl border border-blue-100 p-8 text-center shadow-md shadow-blue-100/60"
          style={{ background: "linear-gradient(160deg, #eaf2ff 0%, #ffffff 60%)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              ระบบให้รางวัล Certificate นิสิต
            </h1>
            <p className="text-base text-slate-500">
              เข้าร่วมโครงการ สะสมกิจกรรม รับใบเซอร์ทิฟิเคตง่าย ๆ ใน 3 ขั้นตอน
            </p>
          </div>

          <div className="flex flex-col gap-3 text-base font-medium sm:flex-row sm:justify-center">
            {period ? (
              <Link href="/register" className={`${buttonPrimary} px-7 text-base`}>
                เริ่มลงทะเบียนเลย
              </Link>
            ) : (
              <span className="flex h-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-slate-400">
                ขณะนี้ปิดรับสมัคร
              </span>
            )}

            <Link href="/login" className={buttonSecondary}>
              เข้าสู่ระบบนิสิต
            </Link>

            <Link href="/admin/login" className={buttonSecondary}>
              เข้าสู่ระบบแอดมิน
            </Link>
          </div>

          <Link
            href="/certificate-criteria"
            className="mx-auto inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-150 hover:border-blue-300 hover:bg-blue-100 active:scale-95"
          >
            ดูหลักเกณฑ์การมอบ Certificate (Platinum / Gold / Silver)
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${card} anim-slide-up anim-delay-1 flex flex-col gap-1 text-center`}>
            <span className="text-3xl font-semibold text-blue-700">
              {projectCount ?? 0}
            </span>
            <span className="text-sm text-slate-500">โครงการทั้งหมด</span>
          </div>
          <div className={`${card} anim-slide-up anim-delay-2 flex flex-col gap-1 text-center`}>
            <span className="text-3xl font-semibold text-blue-700">
              {certTypeCount ?? 0}
            </span>
            <span className="text-sm text-slate-500">ประเภทใบเซอร์</span>
          </div>
          <div className={`${card} anim-slide-up anim-delay-3 flex flex-col gap-1 text-center`}>
            <span className="text-3xl font-semibold text-blue-700">
              {faculties?.length ?? 0}
            </span>
            <span className="text-sm text-slate-500">คณะที่เข้าร่วมได้</span>
          </div>
        </section>

        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-center font-semibold text-slate-900">
            ใช้งานง่ายใน 3 ขั้นตอน
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="font-medium text-blue-700">{step.title}</p>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {upcomingProjects.length > 0 && (
          <section className={`${card} flex flex-col gap-4`}>
            <h2 className="font-semibold text-slate-900">โครงการที่กำลังจะจัดขึ้น</h2>
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
            <Link
              href="/projects"
              className={`${buttonSecondary} mx-auto`}
            >
              ดูโครงการที่เปิดทั้งหมด
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
