import { describe, expect, it } from "vitest";
import { decryptSession, encryptSession } from "@/server/auth/session";

describe("session JWT", () => {
  it("签发后可解析出 userId", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = await encryptSession({
      userId: "42",
      expiresAt,
    });

    const payload = await decryptSession(token);
    expect(payload?.userId).toBe("42");
  });

  it("篡改 token 后解析失败", async () => {
    const token = await encryptSession({
      userId: "1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    const payload = await decryptSession(`${token}x`);
    expect(payload).toBeUndefined();
  });
});
