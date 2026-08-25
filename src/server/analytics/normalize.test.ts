import { describe, expect, it } from "vitest";
import {
  DIRECT_SOURCE_LABEL,
  detectDeviceType,
  refererSource,
  truncateColumn,
} from "@/server/analytics/normalize";

describe("refererSource", () => {
  it("空值归为直接访问", () => {
    expect(refererSource(null)).toBe(DIRECT_SOURCE_LABEL);
    expect(refererSource("")).toBe(DIRECT_SOURCE_LABEL);
  });

  it("合法 URL 取 host", () => {
    expect(refererSource("https://www.google.com/search?q=docshare")).toBe(
      "www.google.com",
    );
    expect(refererSource("http://example.com:8080/path")).toBe(
      "example.com:8080",
    );
  });

  it("自定义 scheme 也取 host", () => {
    expect(refererSource("android-app://com.tencent.mm")).toBe(
      "com.tencent.mm",
    );
  });

  it("无法解析的字符串原样返回并截断", () => {
    expect(refererSource("not a url")).toBe("not a url");
    expect(refererSource("x".repeat(200))).toHaveLength(100);
  });
});

describe("detectDeviceType", () => {
  it("无 UA 返回 null", () => {
    expect(detectDeviceType(null)).toBeNull();
  });

  it("识别移动端、平板与桌面", () => {
    expect(
      detectDeviceType(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
      ),
    ).toBe("mobile");
    expect(
      detectDeviceType("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)"),
    ).toBe("tablet");
    expect(
      detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"),
    ).toBe("desktop");
  });
});

describe("truncateColumn", () => {
  it("null 与短值原样返回", () => {
    expect(truncateColumn(null, 45)).toBeNull();
    expect(truncateColumn("abc", 45)).toBe("abc");
  });

  it("超长值截断到列上限", () => {
    expect(truncateColumn("x".repeat(600), 500)).toHaveLength(500);
  });
});
