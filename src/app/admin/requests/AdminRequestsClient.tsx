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

const STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
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
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">คิวคำร้องขอใบเซอร์</h1>

      {requests.length === 0 && (
        <p className="text-sm text-gray-500">ยังไม่มีคำร้อง</p>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">นิสิต</th>
            <th className="py-2 pr-4">ใบเซอร์</th>
            <th className="py-2 pr-4">วันที่ยื่น</th>
            <th className="py-2 pr-4">สถานะ</th>
            <th className="py-2 pr-4">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b align-top">
              <td className="py-2 pr-4">
                {request.student?.full_name}
                <br />
                <span className="text-gray-500">
                  {request.student?.student_code}
                </span>
              </td>
              <td className="py-2 pr-4">{request.certificate_type?.name}</td>
              <td className="py-2 pr-4">
                {new Date(request.requested_at).toLocaleDateString("th-TH")}
              </td>
              <td className="py-2 pr-4">{STATUS_LABEL[request.status]}</td>
              <td className="py-2 pr-4">
                <div className="flex flex-col gap-2">
                  {request.status === "pending" && (
                    <>
                      <form action={markProcessing.bind(null, request.id)}>
                        <button
                          type="submit"
                          className="bg-black text-white rounded px-3 py-1 text-xs"
                        >
                          รับเรื่อง
                        </button>
                      </form>
                      <form action={rejectRequest.bind(null, request.id)}>
                        <button
                          type="submit"
                          className="border rounded px-3 py-1 text-xs"
                        >
                          ปฏิเสธ
                        </button>
                      </form>
                    </>
                  )}

                  {request.status === "processing" && (
                    <form action={generateCertificate.bind(null, request.id)}>
                      <button
                        type="submit"
                        className="bg-black text-white rounded px-3 py-1 text-xs"
                      >
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
                        className="text-xs underline"
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
    </main>
  );
}
