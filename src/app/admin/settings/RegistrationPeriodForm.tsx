"use client";

import { useActionState } from "react";
import { createRegistrationPeriod } from "./actions";
import { buttonPrimary, card, input, label } from "@/lib/ui";

export function RegistrationPeriodForm() {
  const [state, formAction, pending] = useActionState(
    createRegistrationPeriod,
    undefined,
  );

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex max-w-sm flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">ตั้งช่วงเวลาเปิดรับสมัคร</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="open_date" className={label}>
          วันที่เปิด
        </label>
        <input
          id="open_date"
          name="open_date"
          type="date"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="close_date" className={label}>
          วันที่ปิด
        </label>
        <input
          id="close_date"
          name="close_date"
          type="date"
          required
          className={input}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="is_active" defaultChecked />
        เปิดใช้งานทันที
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
