"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ContactSellerMessageOpener({ sellerId, itemId, itemTitle, imageUrl }: { sellerId: number, itemId: number, itemTitle: string, imageUrl?: string }) {
  const router = useRouter();
  const t = useTranslations('ItemDetail');
  return (
    <button
      className="w-full mb-2 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      onClick={() => {
        // 跳转到消息页面并自动打开与卖家的会话，并带上商品信息和图片
        let url = `/messages?with=${sellerId}&itemId=${itemId}&itemTitle=${encodeURIComponent(itemTitle)}`;
        if (imageUrl) url += `&imageUrl=${encodeURIComponent(imageUrl)}`;
        router.push(url);
      }}
    >
      {t('contact_seller')}
    </button>
  );
}
