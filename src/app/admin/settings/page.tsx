import { requireAdmin } from "@/lib/supabase/require-admin";
import { RegistrationPeriodForm } from "./RegistrationPeriodForm";
import { CertificateTemplateForm } from "./CertificateTemplateForm";
import type { RegistrationPeriod, CertificateTemplate } from "@/types/database";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { card } from "@/lib/ui";
import { TIER_LABEL } from "@/lib/certificate-tier";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data: periods } = await supabase
    .from("registration_periods")
    .select("*")
    .order("open_date", { ascending: false });

  const { data: templates } = await supabase
    .from("certificate_templates")
    .select("*");

  const templateList = (templates as CertificateTemplate[]) ?? [];

  return (
    <>
      <AdminHeader crumbs={[{ label: "ตั้งค่าระบบ" }]} backHref="/admin" />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">ตั้งค่าระบบ</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <RegistrationPeriodForm />
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                ช่วงเวลาที่ตั้งไว้
              </h3>
              <ul className="flex flex-col gap-1 text-sm">
                {((periods as RegistrationPeriod[]) ?? []).map((period) => (
                  <li key={period.id} className="text-slate-600">
                    {period.open_date} – {period.close_date}{" "}
                    {period.is_active ? "(เปิดใช้งาน)" : "(ปิด)"}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`${card} flex flex-col gap-2`}>
            <h3 className="text-sm font-medium text-slate-700">
              Template ที่มีอยู่
            </h3>
            {templateList.length === 0 && (
              <p className="text-sm text-slate-400">ยังไม่มี template</p>
            )}
            <ul className="flex flex-col gap-2 text-sm">
              {templateList.map((template) => (
                <li key={template.id} className="text-slate-600">
                  {template.tier ? TIER_LABEL[template.tier] : "-"} — {template.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CertificateTemplateForm existingTemplates={templateList} />
      </main>
    </>
  );
}
