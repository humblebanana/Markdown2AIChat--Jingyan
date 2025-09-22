import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "京言 - Markdown 转 AI 聊天界面预览",
  description: "将 Markdown 内容一键渲染为高保真移动端 AI 聊天界面预览，所见即所得，支持截图导出，适合演示、评审与分享。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
