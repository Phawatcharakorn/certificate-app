"use client";

import { useActionState } from "react";
import { createRegistrationPeriod } from "./actions";

export function RegistrationPeriodForm() {
  const [state, formAction, pending] = useActionState(
    createRegistrationPeriod,
    undefined,
  );

  return (
    <form
      action={formAction}
      key={state?.message}
      className="flex flex-col gap-4 max-w-sm border rounded p-6"
    >
      <h2 className="font-semibold">ตั้งช่วงเวลาเปิดรับสมัคร</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="open_date">วันที่เปิด</label>
        <input
          id="open_date"
          name="open_date"
          type="date"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="close_date">วันที่ปิด</label>
        <input
          id="close_date"
          name="close_date"
          type="date"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_active" defaultChecked />
        เปิดใช้งานทันที
      </label>

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.message && (
        <p className="text-green-700 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
