import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import ItemDetailClient from "@/components/ItemDetailClient";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ItemDetail' });
  const homeT = await getTranslations({ locale, namespace: 'Home' });
  const messagesT = await getTranslations({ locale, namespace: 'Messages' });
  
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { seller: { select: { name: true, email: true } } },
  });

  if (!item) {
    return <div className="p-8 text-center text-red-500">{t('not_found')}</div>;
  }

  // 多语言对象
  const tObj = {
    contact_seller: t('contact_seller'),
    seller: t('seller'),
    anonymous: t('anonymous'),
    contact: t('contact'),
    no_contact: t('no_contact'),
    published_at: t('published_at'),
    not_found: t('not_found'),
  };
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
    // 可按需补充更多 key
  };

  return <ItemDetailClient item={item} tObj={tObj} homeTObj={homeTObj} messagesTObj={messagesTObj} />;
}
