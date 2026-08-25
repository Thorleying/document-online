"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/server/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.errors?.form?.[0] ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.errors.form[0]}
        </p>
      ) : null}

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium">
          用户名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        {state?.errors?.username?.[0] ? (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.username[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
