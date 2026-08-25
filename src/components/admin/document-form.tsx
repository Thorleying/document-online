"use client";

import { useActionState } from "react";
import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/enums";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_VISIBILITY_LABELS,
} from "@/lib/document-labels";
import type { DocumentEditorDto } from "@/server/documents/dto";
import type { DocumentFormState } from "@/server/documents/actions";

const fieldClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

type FieldsProps = {
  initial?: DocumentEditorDto;
  errors?: Record<string, string[]>;
};

function DocumentMetaFields({ initial, errors }: FieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          标题
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initial?.title ?? ""}
          required
          className={fieldClass}
        />
        {errors?.title?.[0] ? (
          <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
          Slug（永久链接）
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug ?? ""}
          placeholder="my-document"
          className={`${fieldClass} font-mono`}
        />
        {errors?.slug?.[0] ? (
          <p className="mt-1 text-xs text-red-600">{errors.slug[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
          状态
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? DocumentStatus.DRAFT}
          className={fieldClass}
        >
          {Object.values(DocumentStatus).map((s) => (
            <option key={s} value={s}>
              {DOCUMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="visibility"
          className="mb-1.5 block text-sm font-medium"
        >
          可见性
        </label>
        <select
          id="visibility"
          name="visibility"
          defaultValue={initial?.visibility ?? DocumentVisibility.PRIVATE}
          className={fieldClass}
        >
          {Object.values(DocumentVisibility).map((v) => (
            <option key={v} value={v}>
              {DOCUMENT_VISIBILITY_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 pt-6">
        <input
          id="allowIndex"
          name="allowIndex"
          type="checkbox"
          defaultChecked={initial?.allowIndex ?? false}
          className="border-border text-accent focus:ring-accent h-4 w-4 rounded"
        />
        <label htmlFor="allowIndex" className="text-muted-foreground text-sm">
          允许搜索引擎索引（仅公开且已发布时生效）
        </label>
      </div>
    </div>
  );
}

function DocumentBodyFields({ initial, errors }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="summary" className="mb-1.5 block text-sm font-medium">
          摘要
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={initial?.summary ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="contentMd" className="mb-1.5 block text-sm font-medium">
          Markdown 正文
        </label>
        <textarea
          id="contentMd"
          name="contentMd"
          rows={20}
          required
          defaultValue={initial?.contentMd ?? ""}
          className={`${fieldClass} font-mono leading-relaxed`}
        />
        {errors?.contentMd?.[0] ? (
          <p className="mt-1 text-xs text-red-600">{errors.contentMd[0]}</p>
        ) : null}
      </div>
    </>
  );
}

type DocumentFormProps = {
  initial?: DocumentEditorDto;
  action: (
    prev: DocumentFormState,
    formData: FormData,
  ) => Promise<DocumentFormState>;
  submitLabel: string;
};

export function DocumentForm({
  initial,
  action,
  submitLabel,
}: DocumentFormProps) {
  const [state, formAction, pending] = useActionState<
    DocumentFormState,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state?.message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <DocumentMetaFields initial={initial} errors={state?.errors} />
      <DocumentBodyFields initial={initial} errors={state?.errors} />

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}
