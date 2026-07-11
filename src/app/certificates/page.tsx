import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCertificateProgress } from "@/lib/queries/certificates";
import { CertificatesClient } from "./CertificatesClient";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await fetchCertificateProgress(supabase, user.id);

  return <CertificatesClient userId={user.id} initialData={initialData} />;
}
