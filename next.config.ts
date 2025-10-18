import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 仅保留其他 Next.js 配置项，无需 i18n 属性
  /* config options here */
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
//export default nextConfig;

