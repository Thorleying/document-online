import "server-only";

import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

/**
 * 将 Markdown 转为已净化的 HTML。
 * 禁止 allowDangerousHtml；脚本与事件属性会被 rehype-sanitize 移除。
 *
 * @param markdown - 原始 Markdown 源文本
 * @returns 可安全存入 content_html 的 HTML 字符串
 * @throws 解析或转换失败时抛出，调用方应阻止写入半成品
 */
export async function renderMarkdownToSafeHtml(
  markdown: string,
): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
