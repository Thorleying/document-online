import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    viewLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    docDailyStat: {
      upsert: vi.fn(),
    },
    document: {
      update: vi.fn(),
    },
    shareLink: {
      update: vi.fn(),
    },
  };

  return {
    tx,
    resolveViewTarget: vi.fn(),
    transaction: vi.fn(async (fn: (client: typeof tx) => Promise<void>) =>
      fn(tx),
    ),
  };
});

vi.mock("@/server/documents/view-target", () => ({
  resolveViewTarget: mocks.resolveViewTarget,
}));

vi.mock("@/server/db/client", () => ({
  prisma: { $transaction: mocks.transaction },
}));

import { trackView, type TrackViewInput } from "@/server/analytics/record";

const baseInput: TrackViewInput = {
  target: { kind: "permanent", slug: "demo" },
  visitorId: "visitor-1",
  ip: "1.2.3.4",
  ua: "Mozilla/5.0",
  referer: null,
};

describe("trackView 冗余计数回写", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.viewLog.findFirst.mockResolvedValue(null);
  });

  it("目标不可见时不写任何计数", async () => {
    mocks.resolveViewTarget.mockResolvedValue(null);

    await expect(trackView(baseInput)).resolves.toBe(false);

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.tx.document.update).not.toHaveBeenCalled();
    expect(mocks.tx.shareLink.update).not.toHaveBeenCalled();
  });

  it("永久链接：documents.viewCount +1，不动 share_links", async () => {
    mocks.resolveViewTarget.mockResolvedValue({
      documentId: BigInt(42),
      shareLinkId: null,
    });

    await expect(trackView(baseInput)).resolves.toBe(true);

    expect(mocks.tx.document.update).toHaveBeenCalledTimes(1);
    expect(mocks.tx.document.update).toHaveBeenCalledWith({
      where: { id: BigInt(42) },
      data: { viewCount: { increment: 1 } },
    });
    expect(mocks.tx.shareLink.update).not.toHaveBeenCalled();
  });

  it("分享链接：documents 与 share_links 的 viewCount 各 +1", async () => {
    mocks.resolveViewTarget.mockResolvedValue({
      documentId: BigInt(42),
      shareLinkId: BigInt(7),
    });

    await expect(
      trackView({ ...baseInput, target: { kind: "share", token: "t-1" } }),
    ).resolves.toBe(true);

    expect(mocks.tx.document.update).toHaveBeenCalledWith({
      where: { id: BigInt(42) },
      data: { viewCount: { increment: 1 } },
    });
    expect(mocks.tx.shareLink.update).toHaveBeenCalledTimes(1);
    expect(mocks.tx.shareLink.update).toHaveBeenCalledWith({
      where: { id: BigInt(7) },
      data: { viewCount: { increment: 1 } },
    });
  });

  it("计数与明细写入发生在同一事务内", async () => {
    mocks.resolveViewTarget.mockResolvedValue({
      documentId: BigInt(42),
      shareLinkId: BigInt(7),
    });

    await trackView({ ...baseInput, target: { kind: "share", token: "t-1" } });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.tx.viewLog.create).toHaveBeenCalledTimes(1);
    expect(mocks.tx.docDailyStat.upsert).toHaveBeenCalledTimes(1);
  });
});
