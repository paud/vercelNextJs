// 网站全局配置
// 这些配置用于根layout和其他无法使用next-intl的地方

export const siteConfig = {
  // 网站基本信息
  name: {
    zh: '中古品',
    ja: '中古品',
    en: 'Second-hand Market',
  },
  
  // 默认语言（用于根layout）
  defaultLocale: 'zh',
  
  // 标题
  title: {
    zh: '中古品 - 二手交易平台',
    ja: '中古品 - 中古品取引プラットフォーム',
    en: 'Second-hand Market - Quality Marketplace',
  },
  
  // 描述
  description: {
    zh: '优质二手商品交易平台，买卖闲置物品，环保又省钱',
    ja: '高品質な中古品取引プラットフォーム、不用品の売買で環境にやさしく節約',
    en: 'Quality secondhand marketplace for buying and selling pre-owned items',
  },
  
  // 关键词
  keywords: {
    zh: '二手交易,中古品,闲置物品,二手市场',
    ja: '中古品取引,リユース,不用品,中古市場',
    en: 'secondhand,used items,marketplace,pre-owned',
  },
  
  // OG图片alt文本
  ogImageAlt: {
    zh: '中古品二手交易平台',
    ja: '中古品取引プラットフォーム',
    en: 'Second-hand Marketplace',
  },
  
  // PWA相关
  themeColor: '#faf7fb',
  
  // 社交媒体
  social: {
    twitter: '@secondhand_market', // 如果有的话
  },
} as const;

// 获取默认语言的配置
export function getDefaultSiteConfig() {
  const locale = siteConfig.defaultLocale;
  return {
    name: siteConfig.name[locale],
    title: siteConfig.title[locale],
    description: siteConfig.description[locale],
    keywords: siteConfig.keywords[locale],
    ogImageAlt: siteConfig.ogImageAlt[locale],
  };
}

// 根据locale获取配置
export function getSiteConfig(locale: keyof typeof siteConfig.name = 'zh') {
  return {
    name: siteConfig.name[locale] || siteConfig.name.zh,
    title: siteConfig.title[locale] || siteConfig.title.zh,
    description: siteConfig.description[locale] || siteConfig.description.zh,
    keywords: siteConfig.keywords[locale] || siteConfig.keywords.zh,
    ogImageAlt: siteConfig.ogImageAlt[locale] || siteConfig.ogImageAlt.zh,
  };
}
