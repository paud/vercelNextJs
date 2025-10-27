"use client";
import Link from "next/link";
import Image from "next/image";

export default function ItemsListClient({ items, tObj, homeTObj }: { items: any[], tObj: Record<string, string>, homeTObj: Record<string, string> }) {
  function SkeletonCard() {
    return (
      <div className="border rounded-lg shadow-md bg-gray-200 animate-pulse p-3 sm:p-4 flex flex-col">
        <div className="w-full h-28 sm:h-40 mb-2 overflow-hidden rounded bg-gray-300" />
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
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{tObj['page_title']}</h1>
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {items.length === 0
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Link key={item.id} href={`/${item.locale}/items/${item.id}`} className="group">
                <div className="border rounded-lg shadow-md bg-white p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} width={200} height={160} className="w-full h-28 sm:h-40 object-cover rounded mb-2" loading="lazy" />
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
