import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Map locales to available message files
  const localeMap: Record<string, string> = {
    'zh': 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'ja': 'ja',
    'ja-JP': 'ja'
  };
  
  const supportedLocales = ['zh', 'en', 'ja'];
  const mappedLocale = localeMap[locale || ''] || 'zh';
  const safeLocale = supportedLocales.includes(mappedLocale) ? mappedLocale : 'zh';
  
  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default
  };
});