import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // 确保locale参数被正确使用
  const supportedLocales = ['zh', 'en', 'ja'];
  
  // 验证locale是否受支持，如果不受支持则使用默认值
  const validLocale = locale && supportedLocales.includes(locale) ? locale : 'zh';
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});