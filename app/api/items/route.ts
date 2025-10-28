import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { safeContent, defaultSafeContentOptions } from "@/lib/safeContent";

export async function POST(req: Request) {
  console.log('POST /api/items called');
  try {
    const data = await req.json();
    console.log('Request data:', data);
    const { title, description, price, imageUrl, sellerId } = data;
    const safeTitle = safeContent(title, defaultSafeContentOptions);
    const safeDescription = safeContent(description, defaultSafeContentOptions);
    const safeImageUrl = safeContent(imageUrl, defaultSafeContentOptions);
    
    // Validate required fields
    if (!safeTitle || !price) {
      console.log('Validation failed: missing title or price');
      return NextResponse.json({ 
        error: "Title and price are required",
        message: "商品标题和价格为必填项"
      }, { status: 400 });
    }
    
    // Strict validation: sellerId is absolutely required (no anonymous posting)
    if (!sellerId) {
      console.log('Validation failed: missing sellerId - anonymous posting not allowed');
      return NextResponse.json({ 
        error: "User authentication required",
        message: "禁止匿名发布商品，请先登录"
      }, { status: 401 });
    }
    
    // Convert sellerId to number if it's a string (to handle both traditional and OAuth users)
    const sellerIdNum = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
    
    // Ensure sellerId is a valid number
    if (typeof sellerIdNum !== 'number' || isNaN(sellerIdNum) || sellerIdNum <= 0) {
      console.log('Validation failed: invalid sellerId format');
      return NextResponse.json({ 
        error: "Invalid user ID",
        message: "用户ID格式无效"
      }, { status: 400 });
    }
    
    console.log('Creating item with data:', { title, description, price, imageUrl, sellerId: sellerIdNum });
    
    // Verify the seller exists and is active
    const user = await prisma.user.findUnique({ where: { id: sellerIdNum } });
    if (!user) {
      console.log('Validation failed: user not found');
      return NextResponse.json({ 
        error: "User not found",
        message: "用户不存在或已被删除"
      }, { status: 404 });
    }
    
    const item = await prisma.item.create({
      data: {
        title: safeTitle,
        description: safeDescription,
        price,
        imageUrl: safeImageUrl,
        sellerId: sellerIdNum,
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
    const limit = parseInt(searchParams.get("limit") || "8", 10); // 默认每页8条
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    function getOrderBy(sort: string, order: string) {
      if (sort === "price") return { price: order };
      if (sort === "title") return { title: order };
      if (sort === "seller") return { seller: { name: order } };
      return { createdAt: order };
    }

    const orderBy = JSON.stringify(getOrderBy(sort, order));

    // 查询总数
    const total = await prisma.item.count();
    // 查询分页数据
    const items = await prisma.item.findMany({
      orderBy: JSON.parse(orderBy),
      include: { seller: { select: { name: true } } },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: "接口异常", detail: String(err) }, { status: 500 });
  }
}
