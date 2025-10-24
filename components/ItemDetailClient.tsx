"use client";
import { useState } from "react";
import ChatModal from "@/components/ChatModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ItemDetailClient({ item, tObj, homeTObj, messagesTObj }: { item: any, tObj: Record<string, string>, homeTObj: Record<string, string>, messagesTObj: Record<string, string> }) {
  const [showChat, setShowChat] = useState(false);
  const { isLoggedIn, isLoading } = useCurrentUser();
  // 简单 t 函数
  const t = (k: string) => tObj[k] || k;
  const homeT = (k: string) => homeTObj[k] || k;
  const handleContactClick = () => {
    if (isLoading) return; // 用户信息未加载完成时不响应点击
    if (!isLoggedIn) {
      window.location.href = '/users/profile';
    } else {
      setShowChat(true);
    }
  };
  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow mt-2 mb-16 min-h-screen flex flex-col justify-start">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-40 sm:h-64 object-cover rounded mb-3 sm:mb-4"
        />
      )}
      <h1 className="text-xl sm:text-2xl font-bold mb-2">{item.title}</h1>
      <p className="text-lg text-blue-600 font-semibold mb-2">{homeT('currency')}{item.price}</p>
      <button
        className="w-full mb-2 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 shadow-md border border-yellow-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        style={{ fontSize: '1.1rem', letterSpacing: '0.02em' }}
        onClick={handleContactClick}
        disabled={isLoading}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {isLoading ? '...' : t('contact_seller')}
      </button>
      {isLoggedIn && (
        <ChatModal
          open={showChat}
          onClose={() => setShowChat(false)}
          sellerId={item.sellerId}
          itemId={item.id}
          itemTitle={item.title}
          imageUrl={item.imageUrl || undefined}
          messagesTObj={messagesTObj}
        />
      )}
      <p className="text-gray-700 mb-3 sm:mb-4">{item.description || homeT('no_description')}</p>
      <div className="text-sm text-gray-500">
        {t('seller')}：{item.seller?.name || t('anonymous')} <br />
        {t('contact')}：{item.seller?.email || t('no_contact')}
      </div>
      <div className="text-xs text-gray-400 mt-3 sm:mt-4">
        {t('published_at')}：{new Date(item.createdAt).toLocaleString(homeT('date_locale'))}
      </div>
    </div>
  );
}
