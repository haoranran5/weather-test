import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "全球天气预报 - 实时天气查询与城市排行榜",
  description: "基于OpenWeatherMap API的全球天气查询应用，提供实时天气信息、全球最热最冷城市TOP10、湿度排行榜、空气质量指数等功能",
  keywords: "天气预报,全球天气,城市排行榜,温度,湿度,空气质量,AQI,实时天气",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
