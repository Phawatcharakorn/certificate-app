"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAdminRequests,
  type AdminRequestRow,
} from "@/lib/queries/admin-requests";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { markProcessing, rejectRequest } from "./actions";
import { generateCertificate } from "./generate-actions";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

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
    <>
      <Header
        homeHref="/admin"
        right={
          <Link href="/admin" className="underline hover:text-white">
            กลับภาพรวม
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          คิวคำร้องขอใบเซอร์
        </h1>

        {requests.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีคำร้อง</p>
        )}

        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="py-2 pr-4">นิสิต</th>
                <th className="py-2 pr-4">ใบเซอร์</th>
                <th className="py-2 pr-4">วันที่ยื่น</th>
                <th className="py-2 pr-4">สถานะ</th>
                <th className="py-2 pr-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-50 align-top"
                >
                  <td className="py-2 pr-4 text-slate-900">
                    {request.student?.full_name}
                    <br />
                    <span className="text-slate-500">
                      {request.student?.student_code}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {request.certificate_type?.name}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {new Date(request.requested_at).toLocaleDateString(
                      "th-TH",
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {STATUS_LABEL[request.status]}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-col gap-2">
                      {request.status === "pending" && (
                        <>
                          <form action={markProcessing.bind(null, request.id)}>
                            <button
                              type="submit"
                              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              รับเรื่อง
                            </button>
                          </form>
                          <form action={rejectRequest.bind(null, request.id)}>
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              ปฏิเสธ
                            </button>
                          </form>
                        </>
                      )}

                      {request.status === "processing" && (
                        <form
                          action={generateCertificate.bind(null, request.id)}
                        >
                          <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
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
