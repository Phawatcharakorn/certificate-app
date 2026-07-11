import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { CreateCertificateTypeForm } from "./CreateCertificateTypeForm";
import type { Project } from "@/types/database";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

interface CertificateTypeRow {
  id: string;
  name: string;
  description: string | null;
  certificate_type_requirements: {
    set_id: string | null;
    project: { code: string; name: string } | null;
  }[];
  certificate_type_sets: { id: string; name: string }[];
}

export default async function AdminCertificateRulesPage() {
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("event_date", { ascending: false });

  const { data: certificateTypes } = await supabase
    .from("certificate_types")
    .select(
      "id, name, description, certificate_type_requirements(set_id, project:projects(code, name)), certificate_type_sets(id, name)",
    );

  return (
    <>
      <Header
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          จัดการเกณฑ์ใบเซอร์
        </h1>

        <CreateCertificateTypeForm projects={(projects as Project[]) ?? []} />

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-slate-900">
            เกณฑ์ใบเซอร์ทั้งหมด
          </h2>
          {((certificateTypes as unknown as CertificateTypeRow[]) ?? []).map(
            (type) => {
              const flatReqs = type.certificate_type_requirements.filter(
                (req) => !req.set_id,
              );

              return (
                <div key={type.id} className={card}>
                  <p className="font-medium text-slate-900">{type.name}</p>
                  {type.description && (
                    <p className="text-sm text-slate-500">
                      {type.description}
                    </p>
                  )}

                  {flatReqs.length > 0 && (
                    <>
                      <p className="mt-2 text-sm text-slate-600">
                        รายการปกติ (ต้องเข้าครบทุกอัน):
                      </p>
                      <ul className="list-inside list-disc text-sm text-slate-600">
                        {flatReqs.map((req, idx) => (
                          <li key={idx}>
                            {req.project?.code} — {req.project?.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {type.certificate_type_sets.map((set) => {
                    const setReqs = type.certificate_type_requirements.filter(
                      (req) => req.set_id === set.id,
                    );
                    return (
                      <div key={set.id} className="mt-2">
                        <p className="text-sm font-medium text-blue-700">
                          ชุด &quot;{set.name}&quot; (เข้าครบชุดนี้ชุดเดียวก็ผ่าน):
                        </p>
                        <ul className="list-inside list-disc text-sm text-slate-600">
                          {setReqs.map((req, idx) => (
                            <li key={idx}>
                              {req.project?.code} — {req.project?.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            },
          )}
        </section>
      </main>
    </>
  );
}
