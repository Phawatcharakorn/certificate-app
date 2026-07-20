import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/require-admin";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";
import {
  bannerGradient,
  formatThaiDate,
} from "@/components/dashboard/ProjectCard";
import {
  fetchProjectDetail,
  fetchStudentParticipationForProject,
} from "@/lib/queries/project-detail";
import { isProjectEligible } from "@/lib/queries/dashboard";
import { joinProject, cancelParticipation } from "@/app/dashboard/actions";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  LockIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from "@/components/icons";

const PARTICIPATION_STATUS_LABEL: Record<string, string> = {
  registered: "ลงทะเบียนแล้ว",
  attended: "เข้าร่วมแล้ว (ผ่าน)",
  absent: "ขาดร่วมกิจกรรม",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const project = await fetchProjectDetail(supabase, id);
  if (!project) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStudent = false;
  let studentFacultyId: string | null = null;
  let studentName = "";
  let studentSubtitle: string | undefined;
  let participation = null as Awaited<
    ReturnType<typeof fetchStudentParticipationForProject>
  >;

  let isAdmin = false;

  if (user) {
    const { data: student } = await supabase
      .from("students")
      .select("faculty_id, full_name, nickname, student_code")
      .eq("id", user.id)
      .maybeSingle();

    if (student) {
      isStudent = true;
      studentFacultyId = student.faculty_id as string;
      studentName = student.nickname ?? student.full_name;
      studentSubtitle = student.student_code
        ? `รหัสนิสิต ${student.student_code}`
        : undefined;
      participation = await fetchStudentParticipationForProject(
        supabase,
        user.id,
        id,
      );
    } else {
      isAdmin = await checkIsAdmin(supabase, user.id);
    }
  }

  const eligible = isProjectEligible(project, studentFacultyId);
  const hasCapacity = project.capacity !== null;
  const remaining = hasCapacity
    ? project.capacity! - project.participantCount
    : null;
  const isFull = hasCapacity && remaining !== null && remaining <= 0;

  const facultyNames = project.project_faculties
    .map((pf) => pf.faculties?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {isStudent ? (
        <StudentHeader active="projects" name={studentName} subtitle={studentSubtitle} />
      ) : (
        <PublicHeader isAdmin={isAdmin} />
      )}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-sm text-slate-500"
        >
          <Link
            href={isStudent ? "/dashboard" : "/"}
            className="hover:text-blue-700 hover:underline"
          >
            หน้าหลัก
          </Link>
          <ChevronRightIcon width={14} height={14} />
          <Link href="/projects" className="hover:text-blue-700 hover:underline">
            โครงการทั้งหมด
          </Link>
          <ChevronRightIcon width={14} height={14} />
          <span className="truncate font-medium text-slate-700">
            {project.name}
          </span>
        </nav>

        <div className="anim-fade-in overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
          <div
            className={`relative flex h-56 items-end overflow-hidden text-white sm:h-72 ${
              project.cover_image_url
                ? "bg-slate-800"
                : `bg-gradient-to-br ${bannerGradient(project.code)}`
            }`}
          >
            {project.cover_image_url && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.cover_image_url}
                  alt={project.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </>
            )}
            <div className="relative flex flex-col gap-1 p-5 sm:p-6">
              <span className="w-fit rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
                {project.code}
              </span>
              <h1 className="text-xl font-bold sm:text-2xl">{project.name}</h1>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={CalendarIcon} label="วันที่จัดงาน">
                {formatThaiDate(project.event_date)}
              </InfoRow>
              <InfoRow icon={MapPinIcon} label="สถานที่">
                {project.location ?? "ไม่ระบุสถานที่"}
              </InfoRow>
              {project.duration && (
                <InfoRow icon={ClockIcon} label="ระยะเวลา">
                  {project.duration}
                </InfoRow>
              )}
              {project.responsible_person && (
                <InfoRow icon={UserIcon} label="ผู้รับผิดชอบ">
                  {project.responsible_person}
                </InfoRow>
              )}
              {project.organizer_office && (
                <InfoRow icon={BuildingIcon} label="หน่วยงานผู้จัด">
                  {project.organizer_office}
                </InfoRow>
              )}
              <InfoRow icon={UsersIcon} label="ที่นั่ง">
                {hasCapacity
                  ? `${project.participantCount}/${project.capacity} คน${isFull ? " (เต็มแล้ว)" : ""}`
                  : `ไม่จำกัด (เข้าร่วมแล้ว ${project.participantCount} คน)`}
              </InfoRow>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">
                คณะที่เข้าร่วมได้:{" "}
              </span>
              {project.target_faculty_mode === "all"
                ? "ทุกคณะ"
                : facultyNames || "ไม่ระบุ"}
            </div>

            {project.description && (
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-slate-900">
                  รายละเอียดโครงการ
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {project.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="border-t border-slate-100 pt-5">
              {!user ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/login" className={`${buttonPrimary} flex-1`}>
                    เข้าสู่ระบบเพื่อเข้าร่วม
                  </Link>
                  <Link href="/register" className={`${buttonSecondary} flex-1`}>
                    สมัครสมาชิกนิสิตใหม่
                  </Link>
                </div>
              ) : !isStudent ? (
                <p className="text-sm text-slate-500">
                  บัญชีนี้ไม่ใช่บัญชีนิสิต จึงไม่สามารถเข้าร่วมโครงการได้
                </p>
              ) : participation ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <StatusPill status={participation.status} />
                  {participation.status === "registered" && (
                    <form
                      action={cancelParticipation.bind(
                        null,
                        participation.id,
                        project.id,
                      )}
                    >
                      <button
                        type="submit"
                        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-95 sm:w-auto"
                      >
                        ยกเลิกลงทะเบียน
                      </button>
                    </form>
                  )}
                </div>
              ) : !eligible ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                  <LockIcon width={16} height={16} />
                  โครงการนี้จำกัดเฉพาะบางคณะ คุณไม่มีสิทธิ์เข้าร่วม
                </div>
              ) : isFull ? (
                <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
                  โครงการนี้เต็มแล้ว
                </div>
              ) : (
                <form action={joinProject.bind(null, project.id)}>
                  <button type="submit" className={`${buttonPrimary} w-full`}>
                    เข้าร่วมโครงการ
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/projects"
          className="mx-auto flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeftIcon width={16} height={16} />
          กลับไปดูโครงการทั้งหมด
        </Link>
      </main>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon width={16} height={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-sm font-medium text-slate-800">{children}</span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const style: Record<string, string> = {
    registered: "bg-blue-50 text-blue-700",
    attended: "bg-green-50 text-green-700",
    absent: "bg-red-50 text-red-700",
  };
  const icon: Record<string, typeof CheckCircleIcon> = {
    registered: ClockIcon,
    attended: CheckCircleIcon,
    absent: XCircleIcon,
  };
  const Icon = icon[status] ?? ClockIcon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${style[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      <Icon width={15} height={15} strokeWidth={2.5} />
      {PARTICIPATION_STATUS_LABEL[status] ?? status}
    </span>
  );
}
