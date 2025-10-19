"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import UserHeader from '../../../../components/UserHeader';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
}

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('MyItems');
  const homeT = useTranslations('Home');
  
  // 使用统一的认证 hook
  const { user: currentUser } = useCurrentUser();

  const fetchMyItems = async (userId: string | number) => {
    try {
      setIsLoadingItems(true);
      const response = await fetch(`/api/users/${userId}/items`);
      if (response.ok) {
        const userItems = await response.json();
        setItems(userItems);
      } else {
        setMessage(t('fetch_error'));
      }
    } catch (error) {
      console.error('获取用户商品时出错:', error);
      setMessage(t('fetch_error'));
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!currentUser) return;
    
    if (confirm(t('delete_confirm'))) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setItems(items.filter(item => item.id !== itemId));
          setMessage(t('delete_success'));
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(t('delete_error'));
        }
      } catch (error) {
        console.error('删除商品时出错:', error);
        setMessage(t('delete_error'));
      }
    }
  };

  useEffect(() => {
    if (!currentUser) return; // UserHeader 已经处理了认证检查

    // 获取当前用户的商品
    fetchMyItems(currentUser.id);
    setIsLoadingItems(false);
  }, [currentUser]);

  if (isLoadingItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <UserHeader>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <Link
            href={`/${locale}/users/profile`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
            {t('back_profile')}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-2">{t('subtitle')} ({items.length} {t('items_count')})</p>
            </div>
            <Link
              href={`/${locale}/items/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('add_new_item')}
            </Link>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {message}
          </div>
        )}

        {/* 商品列表 */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_items_title')}</h3>
            <p className="text-gray-600 mb-6">{t('no_items_description')}</p>
            <Link
              href={`/${locale}/items/new`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('add_first_item')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xl font-bold text-green-600 mb-2">{homeT('currency')}{item.price}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description || t('no_description')}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {t('published_at')} {new Date(item.createdAt).toLocaleDateString(homeT('date_locale'), {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  
                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/${locale}/items/${item.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition"
                    >
                      {t('view_details')}
                    </Link>
                    <Link
                      href={`/${locale}/items/${item.id}/edit`}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </UserHeader>
  );
}
