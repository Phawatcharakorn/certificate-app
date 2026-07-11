import { requireAdmin } from "@/lib/supabase/require-admin";
import { CreateCertificateTypeForm } from "./CreateCertificateTypeForm";
import type { Project } from "@/types/database";

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
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-xl font-semibold">จัดการเกณฑ์ใบเซอร์</h1>

      <CreateCertificateTypeForm projects={(projects as Project[]) ?? []} />

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">เกณฑ์ใบเซอร์ทั้งหมด</h2>
        {((certificateTypes as unknown as CertificateTypeRow[]) ?? []).map(
          (type) => (
            <div key={type.id} className="border rounded p-4">
              <p className="font-medium">{type.name}</p>
              {type.description && (
                <p className="text-sm text-gray-500">{type.description}</p>
              )}
              <p className="text-sm mt-2">ต้องเข้าครบ:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
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
  );
}
