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
    project: { code: string; name: string } | null;
  }[];
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
      "id, name, description, certificate_type_requirements(project:projects(code, name))",
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
            (type) => (
              <div key={type.id} className={card}>
                <p className="font-medium text-slate-900">{type.name}</p>
                {type.description && (
                  <p className="text-sm text-slate-500">
                    {type.description}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-600">ต้องเข้าครบ:</p>
                <ul className="list-inside list-disc text-sm text-slate-600">
                  {type.certificate_type_requirements.map((req, idx) => (
                    <li key={idx}>
                      {req.project?.code} — {req.project?.name}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </section>
      </main>
    </>
  );
}
