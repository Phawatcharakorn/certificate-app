import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { fetchPublicProjects } from "@/lib/queries/public-projects";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const projects = await fetchPublicProjects(supabase);

  return (
    <>
      <Header
        right={
          <Link href="/" className="underline hover:text-white">
            กลับหน้าแรก
          </Link>
        }
      />
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
