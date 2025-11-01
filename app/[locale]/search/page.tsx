"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  seller: {
    id: number;
    name: string | null;
  } | null;
}

interface SearchResult {
  items: Item[];
  query: string;
  count: number;
  sort?: string;
  order?: string;
}

export default function SearchPage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Search');
  const homeT = useTranslations('Home');
  
  const query = searchParams?.get('q') || '';

  // 动态响应式网格布局
  const INITIAL_ROWS = 4;
  const [itemsPerRow, setItemsPerRow] = useState(3);
  const INITIAL_DISPLAY = itemsPerRow * INITIAL_ROWS;
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY);

  // 动态计算每行显示的商品数
  useEffect(() => {
    function getItemsPerRow() {
      if (window.innerWidth < 640) return 2;
      if (window.innerWidth < 1024) return 3;
      if (window.innerWidth < 1440) return 4;
      if (window.innerWidth < 1920) return 5;
      return 6; // 超大屏幕自动更多列
    }
    setItemsPerRow(getItemsPerRow());
    function handleResize() {
      setItemsPerRow(getItemsPerRow());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 动态生成 grid-cols class（静态映射，确保 Tailwind 编译）
  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  }[itemsPerRow];

  // 显示的商品列表
  const displayedItems = searchResult ? searchResult.items.slice(0, visibleCount) : [];

  useEffect(() => {
    // 从URL参数获取排序设置
    const sortParam = searchParams?.get('sort') || 'createdAt';
    const orderParam = searchParams?.get('order') || 'desc';
    setSort(sortParam);
    setOrder(orderParam);
    
    if (query.trim()) {
      performSearch(query.trim(), sortParam, orderParam);
    } else {
      setIsLoading(false);
    }
    
    // 重置显示数量到初始值
    setVisibleCount(itemsPerRow * INITIAL_ROWS);
  }, [query, searchParams, itemsPerRow]);

  // 无限滚动监听
  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        searchResult &&
        visibleCount < searchResult.items.length &&
        !isLoading
      ) {
        // 每次加载更多若干行（根据当前屏幕宽度）
        const loadMoreCount = itemsPerRow * 4; // 每次加载4行
        setVisibleCount(prev => Math.min(prev + loadMoreCount, searchResult.items.length));
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchResult, visibleCount, isLoading, itemsPerRow]);

  const performSearch = async (searchQuery: string, sortBy: string = sort, orderBy: string = order) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&sort=${sortBy}&order=${orderBy}`);
      
      if (response.ok) {
        const result = await response.json();
        setSearchResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('search_failed'));
      }
    } catch (err) {
      console.error('搜索请求失败:', err);
      setError(t('search_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    if (sort === value) {
      // 再点一下切换升降序
      const newOrder = order === "asc" ? "desc" : "asc";
      setOrder(newOrder);
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}&sort=${value}&order=${newOrder}`);
    } else {
      setSort(value);
      setOrder("desc"); // 切换字段时默认降序
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}&sort=${value}&order=desc`);
    }
    // 重置显示数量
    setVisibleCount(itemsPerRow * INITIAL_ROWS);
  };

  const SORT_OPTIONS = [
    { label: homeT('sort_latest'), value: 'createdAt' },
    { label: homeT('sort_price'), value: 'price' },
    { label: homeT('sort_title'), value: 'title' },
    { label: homeT('sort_seller'), value: 'seller' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('searching')}</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_query_title')}</h3>
          <p className="text-gray-600 mb-6">{t('no_query_description')}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('back_home')}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('search_error')}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => performSearch(query)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-16 w-full">
      <div className="w-full px-2 sm:px-4">
        {/* 搜索结果标题 */}
        <div className="mb-4 sm:mb-6 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('search_results')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {searchResult && searchResult.count > 0 
              ? `${t('found_results')} - "${searchResult.query}" (${searchResult.count})`
              : `${t('no_results')} - "${query}"`
            }
          </p>
          
          {/* 返回首页链接 */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-3 sm:mt-4 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
            {t('back_home')}
          </Link>
        </div>

        {/* 排序按钮 */}
        {searchResult && searchResult.count > 0 && (
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 items-center max-w-6xl mx-auto">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">{t('sort_by')}:</span>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1 ${sort === option.value ? "" : "opacity-80"}`}
              >
                {option.label}
                {sort === option.value && (
                  <span>
                    {order === "asc" ? (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="sm:w-4 sm:h-4"><path d="M12 8l-6 6h12l-6-6z" fill="currentColor"/></svg>
                    ) : (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="sm:w-4 sm:h-4"><path d="M12 16l6-6H6l6 6z" fill="currentColor"/></svg>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 搜索结果 */}
        {searchResult && searchResult.count > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 w-full max-w-6xl mx-auto mb-6 sm:mb-8 ${gridColsClass}`}>
              {displayedItems.map((item, index) => (
                <Link key={item.id + '-' + index} href={`/${locale}/items/${item.id}`} className="group">
                  <div className="border rounded-lg shadow-md bg-white p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                    {item.imageUrl && (
                      <div className="w-full aspect-square mb-2 overflow-hidden rounded">
                        <Image 
                          src={item.imageUrl + (item.imageUrl.includes('?') ? '&' : '?') + 'w=200&h=200&fit=crop'}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="w-full h-full object-contain bg-white"
                          loading="lazy"
                          style={{ objectFit: 'contain', background: 'white' }}
                        />
                      </div>
                    )}
                    <h2 className="text-base sm:text-lg font-semibold text-blue-600 group-hover:underline mb-1">
                      {item.title}
                    </h2>
                    <p className="text-sm sm:text-base text-green-600 font-bold mb-1">{homeT('currency')}{item.price}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {t('seller')}: {item.seller ? item.seller.name : t('anonymous')}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(item.createdAt).toLocaleDateString(homeT('date_locale'), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2">
                      {item.description || t('no_description')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* 加载中和到底提示 */}
            {visibleCount < searchResult.items.length && (
              <div className="p-4 text-center text-gray-500">
                {t('searching')}
              </div>
            )}
            {visibleCount >= searchResult.items.length && (
              <div className="p-4 text-center text-gray-400">
                {homeT('no_more_items')}
              </div>
            )}
          </>
        ) : searchResult && (
          /* 无搜索结果 */
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_results_title')}</h3>
            <p className="text-gray-600 mb-6">{t('no_results_description')}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>{t('search_tips_title')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('search_tip_1')}</li>
                <li>{t('search_tip_2')}</li>
                <li>{t('search_tip_3')}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
