import {
  fetchCurrentPeriodProgress,
  fetchPeriodHistory,
} from "@/lib/queries/certificates";
import { fetchStudentProfile } from "@/lib/queries/profile";
import { requireStudent } from "@/lib/supabase/require-student";
import { CertificatesClient } from "./CertificatesClient";

export default async function CertificatesPage() {
  const { supabase, user } = await requireStudent();

  const [currentPeriod, history, profile] = await Promise.all([
    fetchCurrentPeriodProgress(supabase, user.id),
    fetchPeriodHistory(supabase, user.id),
    fetchStudentProfile(supabase, user.id),
  ]);

  return (
    <CertificatesClient
      userId={user.id}
      initialCurrentPeriod={currentPeriod}
      initialHistory={history}
      profile={profile}
    />
  );
}
