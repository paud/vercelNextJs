import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import ItemDetailClient from "@/components/ItemDetailClient";
import type { Metadata } from 'next';

// 生成动态metadata（包括Open Graph标签用于LINE预览）
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { seller: { select: { name: true } } },
  });

  // 获取翻译
  const t = await getTranslations({ locale, namespace: 'ItemDetail' });
  const homeT = await getTranslations({ locale, namespace: 'Home' });
  const appT = await getTranslations({ locale, namespace: 'Header' });

  if (!item) {
    return {
      title: t('not_found'),
      description: t('not_found'),
    };
  }

  // 使用环境变量构建URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'https://2.zzzz.tech';
  
  const itemUrl = `${baseUrl}/${locale}/items/${item.id}`;
  
  // 构建OG图片URL，包含商品信息
  const ogImageUrl = new URL('/api/og', baseUrl);
  ogImageUrl.searchParams.set('locale', locale); // 添加语言参数
  ogImageUrl.searchParams.set('title', item.title);
  ogImageUrl.searchParams.set('price', item.price.toString());
  if (item.description) {
    ogImageUrl.searchParams.set('description', item.description.substring(0, 100));
  }
  if (item.imageUrl) {
    ogImageUrl.searchParams.set('image', item.imageUrl);
  }
  // 可以添加地区信息
  if (item.region) {
    ogImageUrl.searchParams.set('location', item.region);
  }
  
  const imageUrl = item.imageUrl || ogImageUrl.toString();
  
  // 动态生成描述
  const currency = String(homeT('currency'));
  const description = item.description || `${item.title} - ${t('published_at')}: ${currency}${item.price}`;
  
  // 动态生成关键词和标题
  const appTitle = String(appT('items') || homeT('market_title') || '二手市场');
  const keywords = [
    String(homeT('market_title') || '二手市场'),
    appTitle,
    item.title,
  ].filter(Boolean).join(',');
  
  // Locale映射
  const localeMap: Record<string, string> = {
    'zh': 'zh_CN',
    'ja': 'ja_JP',
    'en': 'en_US',
    'ko': 'ko_KR',
    'vi': 'vi_VN',
    'ne': 'ne_NP',
  };

  return {
    title: `${item.title} - ${appTitle}`,
    description,
    keywords,
    
    // 基础meta标签
    authors: item.seller?.name ? [{ name: item.seller.name }] : undefined,
    creator: item.seller?.name || undefined,
    publisher: appTitle,
    
    // Open Graph标签（Facebook, LINE, 微信等）
    openGraph: {
      title: item.title,
      description,
      url: itemUrl,
      siteName: appTitle,
      images: [
        {
          // 方案1: 直接使用商品原图（推荐用于 LINE 分享）
          url: item.imageUrl || ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      locale: localeMap[locale] || 'zh_CN',
      type: 'website',
      // 添加商品特定信息
      ...(item.price && {
        'product:price:amount': item.price.toString(),
        'product:price:currency': currency.includes('¥') || currency.includes('￥') ? 'CNY' : 'JPY',
      }),
    },
    
    // Twitter Card标签
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description,
      images: [item.imageUrl || ogImageUrl.toString()],
      creator: item.seller?.name || undefined,
    },
    
    // LINE和其他社交媒体专用标签
    other: {
      'line:card': 'summary_large_image',
      'line:image': item.imageUrl || ogImageUrl.toString(),
      'og:image:secure_url': item.imageUrl || ogImageUrl.toString(),
      'og:image:type': 'image/jpeg',
      'og:image:alt': item.title,
      // 商品特定信息
      'product:condition': 'used',
      'product:availability': 'in stock',
      'product:retailer_item_id': item.id.toString(),
    },
    
    // 额外的meta标签
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // 移动端优化
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
  };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  // 获取整个 ItemDetail 多语言对象
  const tAll = await getTranslations({ locale, namespace: 'ItemDetail' });
  // 获取所有 key
  const itemDetailKeys = [
    "not_found", "seller", "contact", "anonymous", "no_contact", "published_at", "contact_seller", "contact_seller_message",
    "share_to_line", "comments", "add_comment", "submit_comment", "empty_comment", "no_comments", "post_comment", "comment_user", "comment_time",
    "login_required_detail", "reply_comment", "submit_reply", "submitting", "cancel"
  ];
  const tObj: Record<string, string> = {};
  itemDetailKeys.forEach(key => {
    tObj[key] = tAll(key);
  });

  const homeT = await getTranslations({ locale, namespace: 'Home' });
  const messagesT = await getTranslations({ locale, namespace: 'Messages' });

  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { seller: { select: { name: true, email: true } } },
  });

  if (!item) {
    return <div className="p-8 text-center text-red-500">{tObj.not_found}</div>;
  }

  const homeTObj = {
    currency: String(homeT('currency')),
    date_locale: String(homeT('date_locale')),
    no_description: String(homeT('no_description')),
  };
  const messagesTObj = {
    chat_with_seller: messagesT('chat_with_seller'),
    about_item: messagesT('about_item'),
    type_message: messagesT('type_message'),
    loading: messagesT('loading'),
    no_conversations: messagesT('no_conversations'),
    reply_comment: tObj.reply_comment,
    submit_reply: tObj.submit_reply,
    submitting: tObj.submitting,
    cancel: tObj.cancel,
    // 可按需补充更多 key
  };

  return <ItemDetailClient item={item} tObj={tObj} homeTObj={homeTObj} messagesTObj={messagesTObj} />;
}
