import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // 支持所有语言
  const supportedLocales = ['zh', 'en', 'ja', 'vi', 'ne'];
  // 验证locale是否受支持，如果不受支持则使用默认值
  const validLocale = locale && supportedLocales.includes(locale) ? locale : 'zh';
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});