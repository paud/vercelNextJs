import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    if (!query || query.trim() === '') {
      return NextResponse.json({ 
        items: [],
        message: "Search query is required"
      });
    }
    
    const searchTerm = query.trim();
    console.log('搜索查询:', searchTerm, '排序:', sort, '顺序:', order);
    
    // 构建排序对象
    function getOrderBy(sort: string, order: string) {
      const sortOrder = order as 'asc' | 'desc';
      if (sort === "price") return { price: sortOrder };
      if (sort === "title") return { title: sortOrder };
      if (sort === "seller") return { seller: { name: sortOrder } };
      return { createdAt: sortOrder };
    }

    const orderBy = getOrderBy(sort, order);
    
    // 在商品标题中搜索（不区分大小写）
    const items = await prisma.item.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive' // 不区分大小写搜索
        }
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: orderBy
    });
    
    console.log(`找到 ${items.length} 个匹配的商品`);
    
    return NextResponse.json({
      items,
      query: searchTerm,
      count: items.length,
      sort,
      order
    });
    
  } catch (error) {
    console.error('搜索错误:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: '搜索失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
