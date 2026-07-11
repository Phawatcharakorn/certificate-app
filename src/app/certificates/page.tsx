import { fetchCertificateProgress } from "@/lib/queries/certificates";
import { requireStudent } from "@/lib/supabase/require-student";
import { CertificatesClient } from "./CertificatesClient";

export default async function CertificatesPage() {
  const { supabase, user } = await requireStudent();

  const initialData = await fetchCertificateProgress(supabase, user.id);

  return <CertificatesClient userId={user.id} initialData={initialData} />;
}
