"use client";

import { useActionState } from "react";
import { createAdmin } from "./actions";
import { buttonPrimary, card, input, label } from "@/lib/ui";

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdmin, undefined);

  return (
    <form
      action={formAction}
      key={state?.message}
      className={`${card} flex w-full flex-col gap-4`}
    >
      <h2 className="font-semibold text-slate-900">เพิ่มแอดมินใหม่</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={label}>
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className={label}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={input}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className={label}>
          บทบาท
        </label>
        <input
          id="role"
          name="role"
          defaultValue="admin"
          className={input}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังเพิ่ม..." : "เพิ่มแอดมิน"}
      </button>
    </form>
  );
}
