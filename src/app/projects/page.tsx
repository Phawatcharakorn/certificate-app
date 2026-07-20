import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/require-admin";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { fetchPublicProjects } from "@/lib/queries/public-projects";
import { fetchStudentProfile } from "@/lib/queries/profile";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [projects, { data: { user } }] = await Promise.all([
    fetchPublicProjects(supabase),
    supabase.auth.getUser(),
  ]);

  let studentProfile = null;
  let isAdmin = false;
  if (user) {
    const [profile, adminCheck] = await Promise.all([
      fetchStudentProfile(supabase, user.id),
      checkIsAdmin(supabase, user.id),
    ]);
    if (profile.fullName || profile.studentCode) studentProfile = profile;
    isAdmin = adminCheck;
  }

  return (
    <>
      {studentProfile ? (
        <StudentHeader
          active="projects"
          name={studentProfile.fullName ?? studentProfile.nickname ?? "นิสิต"}
          subtitle={
            studentProfile.studentCode
              ? `รหัสนิสิต ${studentProfile.studentCode}`
              : undefined
          }
        />
      ) : (
        <PublicHeader active="projects" isAdmin={isAdmin} />
      )}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          โครงการที่เปิดทั้งหมด
        </h1>

        {projects.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีโครงการในระบบ</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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
      </main>
    </>
  );
}
