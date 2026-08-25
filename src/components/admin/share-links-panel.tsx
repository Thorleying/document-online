"use client";

import { useActionState, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import type { ShareLinkAdminDto } from "@/server/documents/dto";
import {
  createShareLinkAction,
  toggleShareLinkAction,
  updateShareLinkAction,
  type ShareLinkFormState,
} from "@/server/documents/share-link-actions";

const fieldClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** 将 ISO 字符串转为 datetime-local 输入框可用的本地时间值。 */
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PublicDocumentWarning() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        该文档可见性为<strong>公开</strong>
        ，任何人都可以通过永久链接直接访问全文。此处为分享链接设置的密码和过期时间
        <strong>不会限制永久链接</strong>
        ，分享链接仅作为渠道统计标记。若需要密码真正生效，请先将文档改为私有。
      </p>
    </div>
  );
}

function FormFeedback({ state }: { state: ShareLinkFormState }) {
  if (state?.message) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.message}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {state.success}
      </p>
    );
  }
  return null;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? (
    <p className="mt-1 text-xs text-red-600">{errors[0]}</p>
  ) : null;
}

type CreateFormProps = {
  documentId: string;
  isPublicDocument: boolean;
};

function CreateShareLinkForm({
  documentId,
  isPublicDocument,
}: CreateFormProps) {
  const [state, formAction, pending] = useActionState<
    ShareLinkFormState,
    FormData
  >(createShareLinkAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="documentId" value={documentId} />
      <FormFeedback state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="new-remark"
            className="mb-1.5 block text-sm font-medium"
          >
            备注
          </label>
          <input
            id="new-remark"
            name="remark"
            maxLength={100}
            placeholder="例如：发给某客户"
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.remark} />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-sm font-medium"
          >
            访问密码（可选）
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="留空表示无需密码"
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.password} />
          {isPublicDocument ? (
            <p className="mt-1 text-xs text-amber-700">
              文档已公开，此密码不会限制永久链接的访问。
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="new-expiresAt"
            className="mb-1.5 block text-sm font-medium"
          >
            过期时间（可选）
          </label>
          <input
            id="new-expiresAt"
            name="expiresAt"
            type="datetime-local"
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.expiresAt} />
          <p className="text-muted-foreground mt-1 text-xs">
            留空表示永不过期。
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "创建中…" : "创建链接"}
      </button>
    </form>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用（如非 HTTPS 环境）时静默，用户仍可手动选中复制
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-border bg-card hover:bg-muted inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          复制链接
        </>
      )}
    </button>
  );
}

function ShareLinkStatusBadges({ link }: { link: ShareLinkAdminDto }) {
  const badge = (cls: string, label: string) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {!link.enabled
        ? badge("bg-muted text-muted-foreground ring-border", "已停用")
        : link.isExpired
          ? badge("bg-amber-50 text-amber-800 ring-amber-200", "已过期")
          : badge("bg-emerald-50 text-emerald-800 ring-emerald-200", "生效中")}
      {link.hasPassword
        ? badge("bg-sky-50 text-sky-800 ring-sky-200", "需密码")
        : null}
    </span>
  );
}

type EditFormProps = {
  documentId: string;
  link: ShareLinkAdminDto;
  onDone: () => void;
};

function ShareLinkEditForm({ documentId, link, onDone }: EditFormProps) {
  const [state, formAction, pending] = useActionState<
    ShareLinkFormState,
    FormData
  >(updateShareLinkAction, undefined);

  return (
    <form
      action={formAction}
      className="border-border bg-muted/30 mt-3 space-y-4 rounded-lg border p-4"
    >
      <input type="hidden" name="id" value={link.id} />
      <input type="hidden" name="documentId" value={documentId} />
      <FormFeedback state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor={`remark-${link.id}`}
            className="mb-1.5 block text-sm font-medium"
          >
            备注
          </label>
          <input
            id={`remark-${link.id}`}
            name="remark"
            maxLength={100}
            defaultValue={link.remark}
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.remark} />
        </div>

        <div>
          <label
            htmlFor={`password-${link.id}`}
            className="mb-1.5 block text-sm font-medium"
          >
            新密码
          </label>
          <input
            id={`password-${link.id}`}
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={link.hasPassword ? "留空保持不变" : "留空表示不设密码"}
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.password} />
          {link.hasPassword ? (
            <label className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="clearPassword"
                className="border-border text-accent focus:ring-accent h-3.5 w-3.5 rounded"
              />
              移除密码
            </label>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`expiresAt-${link.id}`}
            className="mb-1.5 block text-sm font-medium"
          >
            过期时间
          </label>
          <input
            id={`expiresAt-${link.id}`}
            name="expiresAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(link.expiresAt)}
            className={fieldClass}
          />
          <FieldError errors={state?.errors?.expiresAt} />
          <p className="text-muted-foreground mt-1 text-xs">
            清空表示永不过期。
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          收起
        </button>
      </div>
    </form>
  );
}

type RowProps = {
  documentId: string;
  link: ShareLinkAdminDto;
};

function ShareLinkRow({ documentId, link }: RowProps) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground text-sm font-medium">
          {link.remark || "未命名链接"}
        </span>
        <ShareLinkStatusBadges link={link} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <code className="text-muted-foreground bg-muted/50 min-w-0 flex-1 truncate rounded-md px-2 py-1.5 font-mono text-xs">
          {link.url}
        </code>
        <CopyLinkButton url={link.url} />
      </div>

      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="tabular-nums">
          浏览量 {link.viewCount.toLocaleString("zh-CN")}
        </span>
        <span>
          {link.expiresAt
            ? `${formatDateTime(link.expiresAt)} 过期`
            : "永不过期"}
        </span>
        <span>创建于 {formatDateTime(link.createdAt)}</span>
        <span className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-accent hover:underline"
          >
            {editing ? "收起" : "编辑"}
          </button>
          <form action={toggleShareLinkAction} className="inline">
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="documentId" value={documentId} />
            <input
              type="hidden"
              name="enabled"
              value={link.enabled ? "false" : "true"}
            />
            <button
              type="submit"
              className={
                link.enabled
                  ? "text-red-600 hover:text-red-800"
                  : "text-emerald-700 hover:text-emerald-900"
              }
            >
              {link.enabled ? "停用" : "启用"}
            </button>
          </form>
        </span>
      </div>

      {editing ? (
        <ShareLinkEditForm
          documentId={documentId}
          link={link}
          onDone={() => setEditing(false)}
        />
      ) : null}
    </li>
  );
}

type ShareLinksPanelProps = {
  documentId: string;
  isPublicDocument: boolean;
  links: ShareLinkAdminDto[];
};

export function ShareLinksPanel({
  documentId,
  isPublicDocument,
  links,
}: ShareLinksPanelProps) {
  return (
    <div className="space-y-6">
      {isPublicDocument ? <PublicDocumentWarning /> : null}

      <section className="border-border bg-card rounded-xl border p-4 shadow-sm sm:p-6">
        <h2 className="text-foreground mb-4 text-base font-semibold">
          新建分享链接
        </h2>
        <CreateShareLinkForm
          documentId={documentId}
          isPublicDocument={isPublicDocument}
        />
      </section>

      <section className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <h2 className="text-foreground px-4 pt-5 text-base font-semibold sm:px-6">
          已有链接（{links.length}）
        </h2>
        {links.length === 0 ? (
          <p className="text-muted-foreground px-4 py-6 text-sm sm:px-6">
            还没有分享链接。创建后可将链接发给指定读者。
          </p>
        ) : (
          <ul className="divide-border mt-3 divide-y">
            {links.map((link) => (
              <ShareLinkRow key={link.id} documentId={documentId} link={link} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
