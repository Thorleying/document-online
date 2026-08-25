import { describe, expect, it } from "vitest";
import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";
import {
  evaluateDocumentAccess,
  shouldAllowSearchIndex,
} from "@/server/documents/access";

describe("evaluateDocumentAccess", () => {
  const publishedPublic = {
    status: DocumentStatus.PUBLISHED,
    visibility: DocumentVisibility.PUBLIC,
    deletedAt: null,
  };

  const publishedPrivate = {
    ...publishedPublic,
    visibility: DocumentVisibility.PRIVATE,
  };

  it("永久链接：public 已发布文档允许访问", () => {
    expect(
      evaluateDocumentAccess(publishedPublic, { kind: "permanent" }),
    ).toEqual({ allowed: true });
  });

  it("永久链接：private 文档与不存在表现一致", () => {
    expect(
      evaluateDocumentAccess(publishedPrivate, { kind: "permanent" }),
    ).toEqual({ allowed: false, reason: "not_found" });
  });

  it("分享链接：停用返回 share_disabled", () => {
    expect(
      evaluateDocumentAccess(publishedPrivate, {
        kind: "share",
        shareLink: {
          enabled: false,
          expiresAt: null,
          passwordHash: null,
          passwordVerified: true,
        },
      }),
    ).toEqual({ allowed: false, reason: "share_disabled" });
  });

  it("分享链接：过期返回 share_expired", () => {
    expect(
      evaluateDocumentAccess(publishedPrivate, {
        kind: "share",
        shareLink: {
          enabled: true,
          expiresAt: new Date(Date.now() - 1000),
          passwordHash: null,
          passwordVerified: true,
        },
      }),
    ).toEqual({ allowed: false, reason: "share_expired" });
  });

  it("分享链接：需要密码且未验证", () => {
    expect(
      evaluateDocumentAccess(publishedPrivate, {
        kind: "share",
        shareLink: {
          enabled: true,
          expiresAt: null,
          passwordHash: "hash",
          passwordVerified: false,
        },
      }),
    ).toEqual({ allowed: false, reason: "password_required" });
  });
});

describe("shouldAllowSearchIndex", () => {
  it("仅 public + published + allowIndex 为 true", () => {
    expect(
      shouldAllowSearchIndex({
        status: DocumentStatus.PUBLISHED,
        visibility: DocumentVisibility.PUBLIC,
        deletedAt: null,
        allowIndex: true,
      }),
    ).toBe(true);

    expect(
      shouldAllowSearchIndex({
        status: DocumentStatus.PUBLISHED,
        visibility: DocumentVisibility.PRIVATE,
        deletedAt: null,
        allowIndex: true,
      }),
    ).toBe(false);
  });
});
