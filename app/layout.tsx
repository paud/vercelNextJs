// app/layout.tsx
import "./globals.css";
import "./layout.css";
import Providers from "./providers";
import { siteConfig, getDefaultSiteConfig } from "@/lib/site-config";
import type { Metadata } from 'next';

// 使用环境变量
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://preview.zzzz.tech';

// 获取默认语言的配置
const config = getDefaultSiteConfig();

// 重要：根 layout 只设置通用 metadata，不设置 images
// 让子页面（如商品详情页）完全控制 og:image
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL), // 设置 base URL，确保相对路径正确解析
  title: {
    default: config.title,
    template: `%s - ${config.name}`, // 允许子页面自定义标题
  },
  description: config.description,
  keywords: config.keywords,
  
  // Open Graph (适用于LINE、Facebook、Twitter等)
  openGraph: {
    title: config.title,
    description: config.description,
    url: APP_URL,
    siteName: config.name,
    locale: "zh_CN",
    type: "website",
    // ⚠️ 不在根 layout 设置 images，避免覆盖子页面的动态图片
  },
  
  // Twitter Card (也会被LINE使用)
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description,
    // ⚠️ 不在根 layout 设置 images，避免覆盖子页面的动态图片
  },
  
  // 额外的meta标签
  other: {
    // LINE特定标签
    "line:card": "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full force-light-theme">
      <head>
        {process.env.NODE_ENV === 'development' && (
          <script src="/liff-simulator-helper.js"></script>
        )}
        <link rel="manifest" href="/manifest.json" />
        {/* PWA相关 */}
        <meta name="theme-color" content={siteConfig.themeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon@192.png" />
        
        {/* LINE特定优化 */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* ⚠️ 移除了硬编码的 OG 标签，让 Next.js metadata 系统自动处理 */}
        {/* 子页面（如商品详情页）会通过 generateMetadata 动态生成正确的 OG 标签 */}
      </head>
      <body className="bg-white text-gray-900 force-light-theme">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
