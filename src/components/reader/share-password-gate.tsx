"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, Lock } from "lucide-react";
import { ShareAccessCard } from "@/components/reader/share-access-card";
import {
  verifySharePasswordAction,
  type ShareGateFormState,
} from "@/server/documents/share-actions";

type SharePasswordGateProps = {
  token: string;
};

export function SharePasswordGate({ token }: SharePasswordGateProps) {
  const [state, action, pending] = useActionState<ShareGateFormState, FormData>(
    verifySharePasswordAction,
    undefined,
  );
  const [visible, setVisible] = useState(false);
  const error = state?.error;

  return (
    <ShareAccessCard
      icon={Lock}
      title="此文档受密码保护"
      description="分享者为这份文档设置了访问密码，输入正确密码后即可阅读。"
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label
            htmlFor="share-password"
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            访问密码
          </label>
          <div className="relative">
            <input
              id="share-password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="off"
              required
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "share-password-error" : undefined}
              placeholder="请输入密码"
              className="border-border bg-card focus:border-accent focus:ring-accent/25 w-full rounded-lg border px-3.5 py-2.5 pr-11 text-sm transition-colors duration-200 outline-none focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "隐藏密码" : "显示密码"}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center transition-colors duration-200"
            >
              {visible ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          {error ? (
            <p
              id="share-password-error"
              role="alert"
              className="text-danger mt-2 flex items-center gap-1.5 text-sm"
            >
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-11 w-full cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-default disabled:opacity-60"
        >
          {pending ? "验证中…" : "解锁阅读"}
        </button>
      </form>
    </ShareAccessCard>
  );
}
