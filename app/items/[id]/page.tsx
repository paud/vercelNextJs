import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: Number(params.id) },
    include: { seller: { select: { name: true, email: true } } },
  });

  if (!item) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="max-w-xl w-full bg-white rounded shadow p-6">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover rounded mb-4" />
        )}
        <h1 className="text-2xl font-bold mb-2 text-blue-700">{item.title}</h1>
        <p className="text-lg text-green-600 font-bold mb-2">￥{item.price}</p>
        <p className="text-gray-700 mb-4">{item.description || "暂无描述"}</p>
        <div className="text-sm text-gray-500 mb-2">
          卖家: {item.seller ? item.seller.name : "匿名"}
        </div>
        {item.seller?.email && (
          <div className="text-sm text-gray-500 mb-2">联系方式: {item.seller.email}</div>
        )}
        <div className="text-xs text-gray-400">
          发布时间: {new Date(item.createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
