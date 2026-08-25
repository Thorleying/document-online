"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/server/auth/actions";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      {state?.errors?.form?.[0] ? (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {state.errors.form[0]}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="username"
          className="text-foreground mb-1.5 block text-sm font-medium"
        >
          用户名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
        />
        {state?.errors?.username?.[0] ? (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.username[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-1.5 block text-sm font-medium"
        >
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
        {state?.errors?.password?.[0] ? (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
