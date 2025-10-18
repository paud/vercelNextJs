import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ItemDetail' });
  const homeT = await getTranslations({ locale, namespace: 'Home' });
  
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { seller: { select: { name: true, email: true } } },
  });

  if (!item) {
    return <div className="p-8 text-center text-red-500">{t('not_found')}</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
      <p className="text-lg text-blue-600 font-semibold mb-2">{homeT('currency')}{item.price}</p>
      <p className="text-gray-700 mb-4">{item.description || homeT('no_description')}</p>
      <div className="text-sm text-gray-500">
        {t('seller')}：{item.seller?.name || t('anonymous')} <br />
        {t('contact')}：{item.seller?.email || t('no_contact')}
      </div>
      <div className="text-xs text-gray-400 mt-4">
        {t('published_at')}：{new Date(item.createdAt).toLocaleString(homeT('date_locale'))}
      </div>
    </div>
  );
}
