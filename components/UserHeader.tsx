"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCombinedAuth } from '../hooks/useCombinedAuth';

interface UserHeaderProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function UserHeader({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/signin' 
}: UserHeaderProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Profile');
  const headerT = useTranslations('Header');
  const { currentUser, isLoading, logout } = useCombinedAuth();
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [unreadSys, setUnreadSys] = useState(0);

  // 认证检查和重定向逻辑
  useEffect(() => {
    if (!requireAuth) return; // 如果不需要认证，跳过检查
    if (isLoading) return; // 等待认证检查完成
    
    if (!currentUser) {
      router.push(`/${locale}${redirectTo}`);
      return;
    }
  }, [currentUser, isLoading, locale, router, requireAuth, redirectTo]);

  // 获取未读消息和通知数
  useEffect(() => {
    // 获取未读私信数
    fetch('/api/messages/unread')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadMsg(data.reduce((sum, u) => sum + (u._count?._all || 0), 0));
        }
      })
      .catch(() => {});
    // 获取未读系统通知数
    fetch('/api/system-notifications')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadSys(data.filter((n: any) => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 如果需要认证但正在加载，显示加载状态
  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 如果需要认证但用户未登录，不渲染内容（等待重定向）
  if (requireAuth && !currentUser) {
    return null;
  }

  return (
    <>
      {/* 移动端优化的用户导航栏 */}
      <div className="bg-white shadow-sm border-b user-header">
        <div className="px-4 py-3">
          {/* 顶部：用户信息栏 */}
          <div className="flex items-center justify-between mb-3">
            <Link 
              href={`/${locale}/users/profile`}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
              </div>
            </Link>
            
            {/* 退出登录按钮 */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={headerT('logout')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 713-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* 底部：功能按钮 */}
          <div className="flex space-x-2">
            <Link
              href={`/${locale}/items/new`}
              className="flex-1 flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {headerT('items_new')}
            </Link>
            <Link
              href={`/${locale}/users/my-items`}
              className="flex-1 flex items-center justify-center py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 01-2 2v2M7 7h10" />
              </svg>
              {headerT('my_items')}
            </Link>
            <Link
              href={`/${locale}/messages`}
              className="flex items-center justify-center py-3 px-4 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
              title={headerT('message')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadMsg > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-md select-none transition-all" style={{zIndex:2}}>
                  {unreadMsg > 99 ? '99+' : unreadMsg}
                </span>
              )}
            </Link>
            <Link
              href={`/${locale}/system-notifications`}
              className="flex items-center justify-center py-3 px-4 text-gray-700 border border-gray-300 rounded-lg hover:bg-orange-50 transition-colors relative"
              title={headerT('system_notification', { defaultValue: '通知' })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
              </svg>
              {unreadSys > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-md select-none transition-all" style={{zIndex:2}}>
                  {unreadSys > 99 ? '99+' : unreadSys}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* 页面内容 */}
      {children}
    </>
  );
}
