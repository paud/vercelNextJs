"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { useCombinedAuth } from '../hooks/useCombinedAuth';

export default function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [region, setRegion] = useState('osaka');
  const [isClient, setIsClient] = useState(false);
  const { currentUser, isLoading, logout } = useCombinedAuth();
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    console.log('Header组件初始化');
    console.log('currentUser:', currentUser);
    console.log('isLoading:', isLoading);
  }, []);

  useEffect(() => {
    console.log('Header: currentUser状态变化:', currentUser);
  }, [currentUser]);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push(`/${locale}`);
  }

  // 处理弹出菜单的点击外部关闭
  useEffect(() => {
    function handleClickOutsideMenus(event: MouseEvent) {
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) {
        setRegionMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (regionMenuOpen || langMenuOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenus);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenus);
    };
  }, [regionMenuOpen, langMenuOpen, userMenuOpen]);

  function handleSearch() {
    if (search.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleLocaleChange(newLocale: string) {
    setLangMenuOpen(false);
    const segments = pathname.split('/').filter(Boolean);
    if (["zh", "en", "ja"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push("/" + segments.join("/"));
  }

  function handleRegionChange(newRegion: string) {
    setRegion(newRegion);
    setRegionMenuOpen(false);
    router.push(`/${locale}?region=${newRegion}`);
  }

  if (!isClient) {
    return (
      <header className="w-full bg-white shadow-md py-4 px-8">
        <div>加载中...</div>
      </header>
    );
  }

  return (
    <div className="w-full bg-white shadow-md py-3 px-4">
      {/* 第一行：地域、语言、用户 */}
      <div className="flex items-center justify-between w-full">
        {/* 左侧：地域选择 */}
        <div className="relative" ref={regionMenuRef}>
          <button
            onClick={() => setRegionMenuOpen(!regionMenuOpen)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-sm"
          >
            {region === 'osaka' && (
              <>
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-gray-700">{t('region_osaka')}</span>
              </>
            )}
            {region === 'tokyo' && (
              <>
                <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-gray-700">{t('region_tokyo')}</span>
              </>
            )}
            {region === 'kyoto' && (
              <>
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"/>
                </svg>
                <span className="text-gray-700">{t('region_kyoto')}</span>
              </>
            )}
            <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {regionMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[140px]">
              <button
                onClick={() => handleRegionChange('osaka')}
                className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {t('region_osaka')}
              </button>
              <button
                onClick={() => handleRegionChange('tokyo')}
                className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {t('region_tokyo')}
              </button>
              <button
                onClick={() => handleRegionChange('kyoto')}
                className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-lg"
              >
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"/>
                </svg>
                {t('region_kyoto')}
              </button>
            </div>
          )}
        </div>

        {/* 右侧：语言选择和用户功能 */}
        <div className="flex items-center space-x-3">
          {/* 语言选择 */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {locale === 'zh' && (
                <>
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor"/>
                    <circle cx="8" cy="8" r="1.5" fill="yellow"/>
                    <circle cx="10.5" cy="6.5" r="0.5" fill="yellow"/>
                    <circle cx="11" cy="9" r="0.5" fill="yellow"/>
                    <circle cx="10" cy="10.5" r="0.5" fill="yellow"/>
                    <circle cx="8.5" cy="10" r="0.5" fill="yellow"/>
                  </svg>
                  中文
                </>
              )}
              {locale === 'en' && (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#012169"/>
                    <path d="M2 4l20 16M22 4L2 20" stroke="white" strokeWidth="1"/>
                    <path d="M12 4v16M2 12h20" stroke="white" strokeWidth="2"/>
                    <path d="M12 4v16M2 12h20" stroke="#C8102E" strokeWidth="1"/>
                  </svg>
                  EN
                </>
              )}
              {locale === 'ja' && (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="white"/>
                    <circle cx="12" cy="12" r="4" fill="#BC002D"/>
                  </svg>
                  日本語
                </>
              )}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[140px]">
                <button
                  onClick={() => handleLocaleChange('zh')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor"/>
                    <circle cx="8" cy="8" r="1.5" fill="yellow"/>
                    <circle cx="10.5" cy="6.5" r="0.5" fill="yellow"/>
                    <circle cx="11" cy="9" r="0.5" fill="yellow"/>
                    <circle cx="10" cy="10.5" r="0.5" fill="yellow"/>
                    <circle cx="8.5" cy="10" r="0.5" fill="yellow"/>
                  </svg>
                  中文
                </button>
                <button
                  onClick={() => handleLocaleChange('en')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#012169"/>
                    <path d="M2 4h20v16H2z" fill="#012169"/>
                    <path d="M2 4l20 16M22 4L2 20" stroke="white" strokeWidth="1"/>
                    <path d="M2 4l20 16M22 4L2 20" stroke="#C8102E" strokeWidth="0.5"/>
                    <path d="M12 4v16M2 12h20" stroke="white" strokeWidth="2"/>
                    <path d="M12 4v16M2 12h20" stroke="#C8102E" strokeWidth="1"/>
                  </svg>
                  English
                </button>
                <button
                  onClick={() => handleLocaleChange('ja')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="white"/>
                    <circle cx="12" cy="12" r="4" fill="#BC002D"/>
                  </svg>
                  日本語
                </button>
              </div>
            )}
          </div>

          {/* 用户功能区域 */}
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="ml-2 text-gray-700 max-w-[100px] truncate">
                  {currentUser.name || currentUser.username}
                </span>
                <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[160px]">
                  <Link
                    href={`/${locale}/users/profile`}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 rounded-t-lg"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('profile')}
                  </Link>
                  <Link
                    href={`/${locale}/items/new`}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('items_new')}
                  </Link>
                  <Link
                    href={`/${locale}/users/my-items`}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {t('my_items')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-600 transition rounded-b-lg"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/${locale}/auth/signin`}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>

      {/* 第二行：搜索栏 */}
      <div className="flex w-full items-center mt-3">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition flex items-center text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="ml-2">{t('search')}</span>
        </button>
      </div>
    </div>
  );
}
