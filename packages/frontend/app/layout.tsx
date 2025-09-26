import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "答题即挖矿 - FHEVM DApp",
  description: "基于FHEVM的答题即挖矿学习问答去中心化应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
