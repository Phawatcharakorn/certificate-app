import { requireAdmin } from "@/lib/supabase/require-admin";
import { fetchAdminRequests } from "@/lib/queries/admin-requests";
import { AdminRequestsClient } from "./AdminRequestsClient";

export default async function AdminRequestsPage() {
  const { supabase } = await requireAdmin();
  const initialData = await fetchAdminRequests(supabase);

  return <AdminRequestsClient initialData={initialData} />;
}
