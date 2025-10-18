import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  console.log('POST /api/items called');
  try {
    const data = await req.json();
    console.log('Request data:', data);
    const { title, description, price, imageUrl } = data;
    
    // Validate required fields
    if (!title || !price) {
      console.log('Validation failed: missing title or price');
      return NextResponse.json({ error: "Title and price are required" }, { status: 400 });
    }
    
    console.log('Creating item with data:', { title, description, price, imageUrl });
    
    // Check if user with ID 1 exists, otherwise create item without seller
    const user = await prisma.user.findUnique({ where: { id: 1 } });
    
    const item = await prisma.item.create({
      data: {
        title,
        description,
        price,
        imageUrl,
        sellerId: user ? 1 : null, // Only set seller if user exists
      },
    });
    
    console.log('Item created successfully:', item);
    return NextResponse.json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    return NextResponse.json({ error: "创建失败", detail: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    function getOrderBy(sort: string, order: string) {
      if (sort === "price") return { price: order };
      if (sort === "title") return { title: order };
      if (sort === "seller") return { seller: { name: order } };
      return { createdAt: order };
    }

    const orderBy = JSON.stringify(getOrderBy(sort, order));

    const items = await prisma.item.findMany({
      orderBy: JSON.parse(orderBy),
      include: { seller: { select: { name: true } } },
    });

    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ error: "接口异常", detail: String(err) }, { status: 500 });
  }
}
