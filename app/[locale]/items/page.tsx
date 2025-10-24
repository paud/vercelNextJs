import prisma from "@/lib/prisma";
import ItemsListClient from "@/components/ItemsListClient";
import { getTranslations } from 'next-intl/server';

export default async function ItemsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ItemsList' });
  const homeT = await getTranslations({ locale, namespace: 'Home' });
  
  const items = await prisma.item.findMany({
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  // 补充 locale 字段，便于跳转
  const itemsWithLocale = items.map(item => ({ ...item, locale }));

  // 只传递需要的文案对象
  const tObj = {
    page_title: t('page_title'),
    seller: t('seller'),
    anonymous: t('anonymous'),
    no_description: t('no_description'),
  };
  // 强制转为字符串，防止热更新或类型推断异常
  const homeTObj = {
    currency: String(homeT('currency')),
    date_locale: String(homeT('date_locale')),
  };

  return <ItemsListClient items={itemsWithLocale} tObj={tObj} homeTObj={homeTObj} />;
}
