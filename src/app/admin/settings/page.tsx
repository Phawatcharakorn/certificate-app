import { requireAdmin } from "@/lib/supabase/require-admin";
import { RegistrationPeriodForm } from "./RegistrationPeriodForm";
import { CertificateTemplateForm } from "./CertificateTemplateForm";
import type { RegistrationPeriod, CertificateTemplate } from "@/types/database";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data: periods } = await supabase
    .from("registration_periods")
    .select("*")
    .order("open_date", { ascending: false });

  const { data: templates } = await supabase
    .from("certificate_templates")
    .select("*");

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-xl font-semibold">ตั้งค่าระบบ</h1>

      <div className="flex flex-col gap-4">
        <RegistrationPeriodForm />
        <div className="max-w-sm">
          <h3 className="text-sm font-medium mb-2">ช่วงเวลาที่ตั้งไว้</h3>
          <ul className="text-sm flex flex-col gap-1">
            {((periods as RegistrationPeriod[]) ?? []).map((period) => (
              <li key={period.id} className="text-gray-600">
                {period.open_date} – {period.close_date}{" "}
                {period.is_active ? "(เปิดใช้งาน)" : "(ปิด)"}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <CertificateTemplateForm />
        <div className="max-w-lg">
          <h3 className="text-sm font-medium mb-2">Template ที่มีอยู่</h3>
          <ul className="text-sm flex flex-col gap-2">
            {((templates as CertificateTemplate[]) ?? []).map((template) => (
              <li key={template.id} className="text-gray-600">
                {template.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
