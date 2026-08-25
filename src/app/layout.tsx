import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在线文档阅读与分享",
  description: "Markdown 文档发布、分享链接与浏览统计",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
