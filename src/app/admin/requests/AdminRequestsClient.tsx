"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAdminRequests,
  type AdminRequestRow,
} from "@/lib/queries/admin-requests";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { markProcessing, rejectRequest } from "./actions";
import { generateCertificate } from "./generate-actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  buttonDanger,
  buttonSecondarySolid,
  tableCell,
  tableCellHead,
  tableHeadRow,
  tableRow,
  tableWrap,
} from "@/lib/ui";
import { TIER_LABEL } from "@/lib/certificate-tier";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  processing: "processing",
  completed: "success",
  rejected: "danger",
};

export function AdminRequestsClient({
  initialData,
}: {
  initialData: AdminRequestRow[];
}) {
  const supabase = createClient();
  const queryKey = ["admin-requests"];

  const { data: requests } = useQuery({
    queryKey,
    queryFn: () => fetchAdminRequests(supabase),
    initialData,
  });

  useRealtimeInvalidate(
    "admin-requests-changes",
    [{ table: "certificate_requests" }],
    queryKey,
  );

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "คิวคำร้องขอใบเซอร์" }]}
        backHref="/admin"
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          คิวคำร้องขอใบเซอร์
        </h1>

        {requests.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีคำร้อง</p>
        )}

        <div className={tableWrap}>
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className={tableHeadRow}>
                <th className={tableCellHead}>นิสิต</th>
                <th className={tableCellHead}>ปีการศึกษา / ระดับ</th>
                <th className={tableCellHead}>วันที่ยื่น</th>
                <th className={tableCellHead}>สถานะ</th>
                <th className={tableCellHead}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={`${tableRow} align-top`}>
                  <td className={`${tableCell} text-slate-900`}>
                    {request.student?.full_name}
                    <br />
                    <span className="text-slate-500">
                      {request.student?.student_code}
                    </span>
                  </td>
                  <td className={tableCell}>
                    {request.period?.name}
                    {request.tier && (
                      <span className="ml-1 text-slate-500">
                        ({TIER_LABEL[request.tier]})
                      </span>
                    )}
                  </td>
                  <td className={tableCell}>
                    {new Date(request.requested_at).toLocaleDateString(
                      "th-TH",
                    )}
                  </td>
                  <td className={tableCell}>
                    <Badge tone={STATUS_TONE[request.status]}>
                      {STATUS_LABEL[request.status]}
                    </Badge>
                  </td>
                  <td className={tableCell}>
                    <div className="flex flex-col gap-2">
                      {request.status === "pending" && (
                        <>
                          <form action={markProcessing.bind(null, request.id)}>
                            <button type="submit" className={buttonSecondarySolid}>
                              รับเรื่อง
                            </button>
                          </form>
                          <form action={rejectRequest.bind(null, request.id)}>
                            <button type="submit" className={buttonDanger}>
                              ปฏิเสธ
                            </button>
                          </form>
                        </>
                      )}

                      {request.status === "processing" && (
                        <form
                          action={generateCertificate.bind(null, request.id)}
                        >
                          <button type="submit" className={buttonSecondarySolid}>
                            Generate PDF
                          </button>
                        </form>
                      )}

                      {request.status === "completed" &&
                        request.certificate_file_url && (
                          <a
                            href={request.certificate_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline"
                          >
                            เปิดไฟล์
                          </a>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
