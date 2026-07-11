"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCertificateProgress,
  type CertificateProgress,
} from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { requestCertificate } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ถูกปฏิเสธ",
};

export function CertificatesClient({
  userId,
  initialData,
}: {
  userId: string;
  initialData: CertificateProgress[];
}) {
  const supabase = createClient();
  const queryKey = ["certificates", userId];

  const { data: progress } = useQuery({
    queryKey,
    queryFn: () => fetchCertificateProgress(supabase, userId),
    initialData,
  });

  useRealtimeInvalidate(
    "certificates-changes",
    [
      { table: "certificate_requests", filter: `student_id=eq.${userId}` },
      { table: "participations", filter: `student_id=eq.${userId}` },
    ],
    queryKey,
  );

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">สถานะใบ Certificate</h1>

      {progress.length === 0 && (
        <p className="text-sm text-gray-500">ยังไม่มีเกณฑ์ใบเซอร์ในระบบ</p>
      )}

      <ul className="flex flex-col gap-4">
        {progress.map((item) => (
          <li key={item.certificateTypeId} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.name}</p>
              <span className="text-sm text-gray-500">
                {item.matched}/{item.total} ({item.percent}%)
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 mb-2">{item.description}</p>
            )}
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className="h-2 bg-black rounded"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            {item.isComplete && !item.request && (
              <form
                action={requestCertificate.bind(null, item.certificateTypeId)}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="bg-black text-white rounded px-4 py-2 text-sm"
                >
                  ยื่นคำร้องขอใบเซอร์
                </button>
              </form>
            )}

            {item.request && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm">
                  สถานะคำร้อง:{" "}
                  <strong>{STATUS_LABEL[item.request.status]}</strong>
                </span>
                {item.request.status === "completed" &&
                  item.request.certificate_file_url && (
                    <a
                      href={item.request.certificate_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      ดาวน์โหลด PDF
                    </a>
                  )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
