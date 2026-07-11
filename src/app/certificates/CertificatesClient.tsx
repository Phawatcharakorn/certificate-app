"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCertificateProgress,
  type CertificateProgress,
} from "@/lib/queries/certificates";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { requestCertificate } from "./actions";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

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
    <>
      <Header
        right={
          <Link href="/dashboard" className="underline hover:text-white">
            กลับหน้าหลัก
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          สถานะใบ Certificate
        </h1>

        {progress.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีเกณฑ์ใบเซอร์ในระบบ</p>
        )}

        <ul className="flex flex-col gap-4">
          {progress.map((item) => (
            <li
              key={item.certificateTypeId}
              className={`${card} stagger-card`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{item.name}</p>
                <span className="text-sm text-slate-500">
                  {item.matched}/{item.total} ({item.percent}%)
                </span>
              </div>
              {item.description && (
                <p className="mb-2 text-sm text-slate-500">
                  {item.description}
                </p>
              )}
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
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
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    ยื่นคำร้องขอใบเซอร์
                  </button>
                </form>
              )}

              {item.request && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-slate-700">
                    สถานะคำร้อง:{" "}
                    <strong>{STATUS_LABEL[item.request.status]}</strong>
                  </span>
                  {item.request.status === "completed" &&
                    item.request.certificate_file_url && (
                      <a
                        href={item.request.certificate_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline"
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
    </>
  );
}
