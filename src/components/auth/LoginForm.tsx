"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";
import { buttonPrimary, input, label } from "@/lib/ui";

export function LoginForm({
  action,
  submitLabel,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={label}>
          อีเมล
        </label>
        <input id="email" name="email" type="email" required className={input} />
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
          className={input}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "กำลังเข้าสู่ระบบ..." : submitLabel}
      </button>
    </form>
  );
}
