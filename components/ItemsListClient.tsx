"use client";
import Link from "next/link";

export default function ItemsListClient({ items, tObj, homeTObj }: { items: any[], tObj: Record<string, string>, homeTObj: Record<string, string> }) {
  // 直接用对象取值，避免函数
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-2 pb-16 px-2 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{tObj['page_title']}</h1>
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {items.map((item) => (
          <Link key={item.id} href={`/${item.locale}/items/${item.id}`} className="group">
            <div className="border rounded-lg shadow-md bg-white p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-28 sm:h-40 object-cover rounded mb-2" />
              )}
              <h2 className="text-base sm:text-lg font-semibold text-blue-600 group-hover:underline mb-1">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base text-green-600 font-bold mb-1">{homeTObj['currency']}{item.price}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {tObj['seller']}: {item.seller ? item.seller.name : tObj['anonymous']}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(item.createdAt).toLocaleDateString(homeTObj['date_locale'], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2">
                {item.description || tObj['no_description']}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
