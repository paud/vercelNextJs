import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import ItemDetailClient from "@/components/ItemDetailClient";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  // 获取整个 ItemDetail 多语言对象
  const tAll = await getTranslations({ locale, namespace: 'ItemDetail' });
  // 获取所有 key
  const itemDetailKeys = [
    "not_found", "seller", "contact", "anonymous", "no_contact", "published_at", "contact_seller", "contact_seller_message",
    "comments", "add_comment", "submit_comment", "empty_comment", "no_comments", "post_comment", "comment_user", "comment_time",
    "login_required_detail"
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
    // 可按需补充更多 key
  };

  return <ItemDetailClient item={item} tObj={tObj} homeTObj={homeTObj} messagesTObj={messagesTObj} />;
}
