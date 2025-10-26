/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = withNextIntl(
  withPWA({
    dest: 'public',       // 生成 service worker 的位置
    register: true,       // 自动注册
    skipWaiting: true,    // 立即接管新 SW
    disable: process.env.NODE_ENV === 'development', // 本地禁用PWA
    //sw: 'service-worker.js', // 自定义 SW 文件名
  })({
    reactStrictMode: true,
    async rewrites() {
      return [
        // 允许带语言前缀的静态资源访问
        /*
        {
          source: '/manifest.json',
          destination: '/manifest.json',
        },
        {
          source: '/service-worker.js',
          destination: '/service-worker.js',
        },
        {
          source: '/pwa-install.bundle.js',
          destination: '/pwa-install.bundle.js',
        },
        {
          source: '/favicon.ico',
          destination: '/favicon.ico',
        },*/
        {
          source: '/:locale/:file*.:ext(png|jpg|jpeg|gif|webp)',
          destination: '/:file*.:ext',
        },
        /*{
          // 多语言静态文件映射，排除 .js 和 sw.js
          //source: '/:locale/:file((?!sw\\.js$).*)',
          //source: '/:locale/:file((?!.*\\.js$)(?!sw\\.js$).*)',
          //source: '/:locale/:file*((?!sw\\.js$)(?!.*\\.js$)(?!/api/).*)',
          //source: '/:locale/:file.:ext(png|jpg|jpeg|gif|ico|icon|webp|html|htm)',
          //destination: '/:file*',
          source: '/:locale/:path*',
          destination: '/:path*',
          has: [
            {
              type: 'header',
              key: 'accept',
              value: '(image|html|javascript|css|icon|webp|manifest)',
            },
          ],
        },*/
      ];
    },
    
  })
);

export default nextConfig;
