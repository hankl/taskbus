import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskBus",
  description: "AI agent task orchestration MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

