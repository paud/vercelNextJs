"use client";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const SORT_OPTIONS = [
  { label: "最新", value: "createdAt" },
  { label: "价格", value: "price" },
  { label: "标题", value: "title" },
  { label: "卖家", value: "seller" },
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const [order, setOrder] = useState(searchParams.get("order") || "desc");

  // 本地类型声明，替代 Prisma 类型导入
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

  useEffect(() => {
    async function fetchItems() {
      const res = await fetch(`/api/items?sort=${sort}&order=${order}`);
      const data = await res.json();
      setItems(data);
    }
    fetchItems();
  }, [sort, order]);

  function handleSortChange(value: string) {
    setSort(value);
    router.push(`/?sort=${value}&order=${order}`);
  }

  function handleOrderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    const newOrder = checked ? "asc" : "desc";
    setOrder(newOrder);
    router.push(`/?sort=${sort}&order=${newOrder}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="mb-4 w-full max-w-6xl flex flex-wrap items-center justify-between">
        <h1 className="text-xl font-bold text-[#333333] whitespace-nowrap mr-4">
          二手物品市场
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-4 py-2 rounded-lg text-base font-semibold shadow bg-blue-500 text-white hover:bg-blue-600 transition ${sort === option.value ? "" : "opacity-80"}`}
            >
              {option.label}
            </button>
          ))}
          <div className="flex items-center ml-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={order === "asc"}
              onChange={handleOrderChange}
              className="sr-only"
            />
            <div
              className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition ${order === "asc" ? "bg-blue-500" : ""}`}
              onClick={() => handleOrderChange({ target: { checked: order !== "asc" } } as React.ChangeEvent<HTMLInputElement>)}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${order === "asc" ? "translate-x-6" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {items.map((item) => (
          <Link key={item.id} href={`/items/${item.id}`} className="group">
            <div className="border rounded-lg shadow-md bg-white p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
              )}
              <h2 className="text-lg font-semibold text-blue-600 group-hover:underline mb-1">
                {item.title}
              </h2>
              <p className="text-base text-green-600 font-bold mb-1">￥{item.price}</p>
              <p className="text-sm text-gray-500 mb-1">
                卖家: {item.seller ? item.seller.name : "匿名"}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(item.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-700 leading-relaxed line-clamp-2">
                {item.description || "暂无描述"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}