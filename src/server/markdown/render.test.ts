import { describe, expect, it } from "vitest";
import { renderMarkdownToSafeHtml } from "@/server/markdown/render";

describe("renderMarkdownToSafeHtml", () => {
  it("移除 script 标签", async () => {
    const html = await renderMarkdownToSafeHtml(
      "# Hello\n\n<script>alert(1)</script>",
    );
    expect(html).not.toContain("<script");
    expect(html).toContain("Hello");
  });

  it("移除 img onerror 事件属性", async () => {
    const html = await renderMarkdownToSafeHtml(
      '<img src="x" onerror="alert(1)" alt="x">',
    );
    expect(html).not.toMatch(/onerror/i);
  });

  it("移除 javascript: 协议链接", async () => {
    const html = await renderMarkdownToSafeHtml("[click](javascript:alert(1))");
    expect(html).not.toMatch(/javascript:/i);
  });
});
