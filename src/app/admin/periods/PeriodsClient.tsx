"use client";

import { useActionState, useState } from "react";
import { createPeriod, closePeriod } from "./actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { buttonPrimary, card, input, label } from "@/lib/ui";
import { Modal } from "@/components/ui/Modal";
import { TIER_LABEL } from "@/lib/certificate-tier";
import type { AcademicPeriod } from "@/types/database";
import type { ClosedPeriodSummary } from "./page";

function CreatePeriodForm() {
  const [state, formAction, pending] = useActionState(createPeriod, undefined);

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex w-full flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">เปิดปีการศึกษาใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={label}>
          ชื่อปีการศึกษา
        </label>
        <input
          id="name"
          name="name"
          placeholder="เช่น ปีการศึกษา 2569"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="open_date" className={label}>
          วันที่เปิด
        </label>
        <input id="open_date" name="open_date" type="date" required className={input} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-700">{state.message}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังบันทึก..." : "เปิดปีการศึกษา"}
      </button>
    </form>
  );
}

function ClosePeriodButton({ period }: { period: AcademicPeriod }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        ปิดปีการศึกษา
      </button>

      <Modal
        open={confirming}
        onClose={() => !pending && setConfirming(false)}
        title="ยืนยันปิดปีการศึกษา"
      >
        <p className="text-sm text-slate-600">
          การปิดปีการศึกษาจะคำนวณและล็อกระดับใบเซอร์ของนิสิตทุกคนตามผลปัจจุบัน
          ย้อนกลับไม่ได้ ยืนยันหรือไม่?
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              try {
                await closePeriod(period.id);
                setConfirming(false);
              } catch (e) {
                setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
              } finally {
                setPending(false);
              }
            }}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "กำลังปิด..." : "ยืนยันปิดปีการศึกษา"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
        </div>
      </Modal>
    </>
  );
}

export function PeriodsClient({
  openPeriod,
  openPeriodProjectCount,
  closedPeriods,
}: {
  openPeriod: AcademicPeriod | null;
  openPeriodProjectCount: number;
  closedPeriods: ClosedPeriodSummary[];
}) {
  return (
    <>
      <AdminHeader crumbs={[{ label: "จัดการปีการศึกษา" }]} backHref="/admin" />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">จัดการปีการศึกษา</h1>

        {openPeriod ? (
          <section className={`${card} flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  ปีการศึกษาปัจจุบัน (เปิดอยู่)
                </p>
                <h2 className="font-semibold text-slate-900">{openPeriod.name}</h2>
                <p className="text-sm text-slate-500">
                  เปิดเมื่อ {openPeriod.open_date} · โครงการทั้งหมด {openPeriodProjectCount} โครงการ
                </p>
              </div>
            </div>
            <ClosePeriodButton period={openPeriod} />
          </section>
        ) : (
          <CreatePeriodForm />
        )}

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-slate-900">ปีการศึกษาที่ปิดแล้ว</h2>
          {closedPeriods.length === 0 && (
            <p className="text-sm text-slate-500">ยังไม่มีปีการศึกษาที่ปิดแล้ว</p>
          )}
          {closedPeriods.map((period) => (
            <div key={period.id} className={card}>
              <p className="font-medium text-slate-900">{period.name}</p>
              <p className="text-sm text-slate-500">
                ปิดเมื่อ {period.close_date} · นิสิตทั้งหมด {period.totalStudents} คน
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {(["platinum", "gold", "silver"] as const).map((tier) => (
                  <span key={tier} className="text-slate-600">
                    {TIER_LABEL[tier]}: {period.tierCounts[tier]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
