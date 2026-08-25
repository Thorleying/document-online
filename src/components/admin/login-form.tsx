"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { loginAction, type LoginFormState } from "@/server/auth/actions";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors duration-200 focus:border-ring focus:ring-2 focus:ring-ring/25 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/15";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p
      id={id}
      role="alert"
      className="text-danger mt-1.5 flex items-center gap-1 text-xs"
    >
      <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    undefined,
  );
  const [visible, setVisible] = useState(false);

  const formError = state?.errors?.form?.[0];
  const usernameError = state?.errors?.username?.[0];
  const passwordError = state?.errors?.password?.[0];

  return (
    <form action={action} className="space-y-5">
      {formError ? (
        <p
          role="alert"
          className="border-danger/30 bg-danger/8 text-danger flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm"
        >
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {formError}
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
          aria-invalid={usernameError ? true : undefined}
          aria-describedby={usernameError ? "username-error" : undefined}
          className={inputClass}
        />
        <FieldError id="username-error" message={usernameError} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-1.5 block text-sm font-medium"
        >
          密码
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "隐藏密码" : "显示密码"}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg transition-colors duration-200 outline-none focus-visible:ring-2"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <FieldError id="password-error" message={passwordError} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-60"
      >
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            登录中…
          </>
        ) : (
          "登录"
        )}
      </button>
    </form>
  );
}
