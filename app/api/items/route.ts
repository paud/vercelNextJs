import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();
  const { title, description, price, imageUrl } = data;
  // TODO: 获取当前登录用户ID，暂用 sellerId: 1
  try {
    const item = await prisma.item.create({
      data: {
        title,
        description,
        price,
        imageUrl,
        sellerId: 1, // 实际项目应从会话获取
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  function getOrderBy(sort: string, order: string) {
    if (sort === "price") return { price: order };
    if (sort === "title") return { title: order };
    if (sort === "seller") return { seller: { name: order } };
    return { createdAt: order };
  }

  const orderBy = getOrderBy(sort, order);

  const items = await prisma.item.findMany({
    orderBy,
    include: { seller: { select: { name: true } } },
  });

  return NextResponse.json(items);
}
