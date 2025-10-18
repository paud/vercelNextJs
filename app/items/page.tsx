import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-6">全部商品</h1>
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
