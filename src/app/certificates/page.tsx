import { fetchCertificateProgress } from "@/lib/queries/certificates";
import { fetchStudentProfile } from "@/lib/queries/profile";
import { requireStudent } from "@/lib/supabase/require-student";
import { CertificatesClient } from "./CertificatesClient";

export default async function CertificatesPage() {
  const { supabase, user } = await requireStudent();

  const [initialData, profile] = await Promise.all([
    fetchCertificateProgress(supabase, user.id),
    fetchStudentProfile(supabase, user.id),
  ]);

  return (
    <CertificatesClient
      userId={user.id}
      initialData={initialData}
      profile={profile}
    />
  );
}
