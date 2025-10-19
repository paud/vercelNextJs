"use client";

import Link from "next/link";
import { useLocale, useTranslations } from 'next-intl';
import { useCombinedAuth } from '../hooks/useCombinedAuth';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('Header');
  const { currentUser } = useCombinedAuth();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {/* 主页 */}
        <Link
          href={`/${locale}`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">{t('home')}</span>
        </Link>

        {/* 商品列表 */}
        <Link
          href={`/${locale}/items`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs font-medium">{t('items')}</span>
        </Link>

        {/* 发布商品 - 仅登录用户可见 */}
        {currentUser ? (
          <Link
            href={`/${locale}/items/new`}
            className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors py-2"
          >
            <div className="bg-green-500 rounded-full p-2 mb-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600">{t('post')}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}/auth/signin`}
            className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors py-2"
          >
            <div className="bg-green-500 rounded-full p-2 mb-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600">{t('login')}</span>
          </Link>
        )}

        {/* 搜索 */}
        <Link
          href={`/${locale}/search`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium">{t('search')}</span>
        </Link>

        {/* 我的 - 个人中心 */}
        {currentUser ? (
          <Link
            href={`/${locale}/users/profile`}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">{t('profile')}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}/auth/signin`}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">{t('login')}</span>
          </Link>
        )}
      </div>
    </footer>
  );
}
