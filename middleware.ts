import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['zh', 'en', 'ja'];
const DEFAULT_LOCALE = 'zh';

export function middleware(request: NextRequest) {
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
    detected = langs.find(l => SUPPORTED_LOCALES.includes(l.split('-')[0])) || DEFAULT_LOCALE;
  }
  // 重定向到对应语言前缀
  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
