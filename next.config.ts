import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 支持所有语言前缀
  i18n: {
    locales: ['zh', 'en', 'ja', 'vi', 'ne'],
    defaultLocale: 'en',
  },
  /* config options here */
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
//export default nextConfig;

