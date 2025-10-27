"use client";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";

function HomeContent() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const [order, setOrder] = useState(searchParams.get("order") || "desc");

  type ItemWithSeller = {
    id: number;
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    createdAt: string;
    seller?: { name?: string };
  };
  const [items, setItems] = useState<ItemWithSeller[]>([]);

  // 初始值设为3，避免SSR访问window
  const [itemsPerRow, setItemsPerRow] = useState(3);
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
  const INITIAL_ROWS = 4;
  const LOAD_MORE_ROWS = 4;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const visibleCount = visibleRows * itemsPerRow;

  useEffect(() => {
    async function fetchItems() {
      const res = await fetch(`/api/items?sort=${sort}&order=${order}`);
      const data = await res.json();
      setItems(data);
    }
    fetchItems();
  }, [sort, order]);

  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        visibleCount < items.length
      ) {
        setVisibleRows((rows) => rows + LOAD_MORE_ROWS);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, visibleCount]);

  function handleSortChange(value: string) {
    if (sort === value) {
      // 再点一下切换升降序
      const newOrder = order === "asc" ? "desc" : "asc";
      setOrder(newOrder);
      router.push(`/${locale}?sort=${value}&order=${newOrder}`);
    } else {
      setSort(value);
      setOrder("desc"); // 切换字段时默认降序
      router.push(`/${locale}?sort=${value}&order=desc`);
    }
  }

  const SORT_OPTIONS = [
    { label: t('sort_latest'), value: 'createdAt' },
    { label: t('sort_price'), value: 'price' },
    { label: t('sort_title'), value: 'title' },
    { label: t('sort_seller'), value: 'seller' },
  ];

  function SkeletonCard() {
    return (
      <div className="border rounded-lg shadow-md bg-gray-200 animate-pulse p-3 sm:p-4 flex flex-col">
        <div className="w-full aspect-square mb-2 overflow-hidden rounded bg-gray-300" />
        <div className="h-5 bg-gray-300 rounded mb-2 w-2/3" />
        <div className="h-4 bg-gray-300 rounded mb-1 w-1/2" />
        <div className="h-3 bg-gray-300 rounded mb-1 w-1/3" />
        <div className="h-3 bg-gray-300 rounded mb-2 w-1/4" />
        <div className="h-4 bg-gray-300 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-2 pb-16 px-2 sm:px-4">
      <div className="mb-3 sm:mb-4 w-full max-w-6xl flex flex-wrap items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold text-[#333333] whitespace-nowrap mr-2 sm:mr-4">
          {t('market_title')}
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold shadow bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1 ${sort === option.value ? "" : "opacity-80"}`}
            >
              {option.label}
              {sort === option.value && (
                <span>
                  {order === "asc" ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 8l-6 6h12l-6-6z" fill="currentColor"/></svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16l6-6H6l6 6z" fill="currentColor"/></svg>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* 动态 grid-cols-x */}
      <div className={`grid gap-4 sm:gap-6 w-full max-w-6xl mb-6 sm:mb-8 ${gridColsClass}`}>
        {items.length === 0
          ? Array.from({ length: visibleCount }).map((_, i) => <SkeletonCard key={i} />)
          : items.slice(0, visibleCount).map((item) => (
              <Link key={item.id} href={`/${locale}/items/${item.id}`} className="group">
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
                  <p className="text-sm sm:text-base text-green-600 font-bold mb-1">¥{item.price}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    {t('seller')}: {item.seller ? item.seller.name : t('anonymous')}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(item.createdAt).toLocaleDateString(t('date_locale'), {
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
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
