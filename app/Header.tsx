"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [region, setRegion] = useState('osaka');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function handleSearch() {
    if (search.trim()) {
      router.push(`/posts?title=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value;
    const segments = pathname.split('/').filter(Boolean);
    if (["zh", "en", "ja"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push("/" + segments.join("/"));
  }

  function handleRegionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRegion = e.target.value;
    setRegion(newRegion);
    // 跳转到当前语言首页并带上地域参数
    router.push(`/${locale}?region=${newRegion}`);
  }

  return (
    <header className="w-full bg-white shadow-md py-4 px-8">
      <nav className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          {/* 地域选择下拉菜单（多语言） */}
          <div className="flex items-center">
            <select
              title="region"
              value={region}
              onChange={handleRegionChange}
              className="px-2 py-1 rounded border bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-4"
            >
              <option value="osaka">{t('region_osaka')}</option>
              <option value="tokyo">{t('region_tokyo')}</option>
              <option value="kyoto">{t('region_kyoto')}</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            {/* 语言选择下拉菜单 */}
            <div className="flex items-center">
              <select
                title="language"
                value={locale}
                onChange={handleLocaleChange}
                className="px-2 py-1 rounded border bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            {/* 原菜单，仅保留导航项 */}
            <div className="relative mr-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="bg-blue-500 text-white font-bold rounded-lg px-6 py-3 text-lg shadow-lg hover:bg-blue-600 focus:outline-none transition-all transform hover:scale-105 flex items-center"
                aria-label="Open menu"
              >
                <svg
                  className="w-8 h-8 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
                <span>{t('menu') || '菜单'}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-10 overflow-hidden">
                  <Link
                    href={`/${locale}/items`}
                    className="block px-6 py-4 text-blue-700 text-lg font-semibold hover:bg-blue-50 hover:text-blue-800 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('items_list')}
                  </Link>
                  <Link
                    href={`/${locale}/items/new`}
                    className="block px-6 py-4 text-blue-700 text-lg font-semibold hover:bg-blue-50 hover:text-blue-800 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('items_new')}
                  </Link>
                </div>
              )}
            </div>
            <Link
              href={`/${locale}/users/new`}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {isClient ? t('register') || 'Register' : 'Register'}
            </Link>
          </div>
        </div>
        <div className="flex w-full items-center mt-2">
          <input
            type="text"
            placeholder={isClient ? t('search') : 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32 md:min-w-48 max-w-md border rounded-l px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600 transition h-full"
            onClick={handleSearch}
          >
            {t('search')}
          </button>
        </div>
      </nav>
    </header>
  );
}
