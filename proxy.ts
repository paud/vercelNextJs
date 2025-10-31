import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'vi', 'ne', 'ko'];
const DEFAULT_LOCALE = 'en';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 已有语言前缀则直接通过
  const hasLocalePrefix = SUPPORTED_LOCALES.some((locale) => pathname.startsWith(`/${locale}`));
  if (hasLocalePrefix) {
    return NextResponse.next();
  }
  
  // 检测浏览器语言
  const acceptLang = request.headers.get('accept-language');
  let detected = DEFAULT_LOCALE;
  if (acceptLang) {
    const langs = acceptLang.split(',').map(l => l.split(';')[0].trim());
    // 处理语言代码映射，比如 zh-CN -> zh, zh-TW -> zh 等
    detected = langs.find(l => {
      const lang = l.split('-')[0]; // 取主语言代码
      return SUPPORTED_LOCALES.includes(lang);
    })?.split('-')[0] || DEFAULT_LOCALE;
  }
  
  // 重定向到对应语言前缀
  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico|manifest.json|service-worker.js|pwa-install.bundle.js|nsfw-model).*)'],
};
