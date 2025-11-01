// OG图片生成的多语言配置
// 这个文件可以在Edge Runtime中使用

export const ogTranslations = {
  zh: {
    siteName: '中古品',
    defaultDescription: '优质二手商品交易平台',
    defaultTag1: '二手精品',
    defaultTag2: '急速交易',
    currency: '¥',
  },
  ja: {
    siteName: '中古品',
    defaultDescription: '高品質な中古品取引プラットフォーム',
    defaultTag1: '中古優良品',
    defaultTag2: '即取引',
    currency: '¥',
  },
  en: {
    siteName: 'Second-hand Market',
    defaultDescription: 'Quality secondhand marketplace',
    defaultTag1: 'Premium Used',
    defaultTag2: 'Quick Deal',
    currency: '$',
  },
  ko: {
    siteName: '중고품',
    defaultDescription: '고품질 중고 거래 플랫폼',
    defaultTag1: '중고 우수품',
    defaultTag2: '빠른 거래',
    currency: '₩',
  },
  vi: {
    siteName: 'Đồ Cũ',
    defaultDescription: 'Nền tảng mua bán đồ cũ chất lượng',
    defaultTag1: 'Hàng Xịn',
    defaultTag2: 'Giao Dịch Nhanh',
    currency: '₫',
  },
  ne: {
    siteName: 'पुरानो सामान',
    defaultDescription: 'गुणस्तरीय पुरानो सामान व्यापार प्लेटफर्म',
    defaultTag1: 'उत्कृष्ट',
    defaultTag2: 'छिटो कारोबार',
    currency: 'रु',
  },
} as const;

export type OGLocale = keyof typeof ogTranslations;

export function getOGTranslation(locale: string) {
  return ogTranslations[locale as OGLocale] || ogTranslations.zh;
}
