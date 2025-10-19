import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 获取所有地区数据
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        code: true,
        nameJa: true,
        nameEn: true,
        nameZh: true,
        description: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    return NextResponse.json({ 
      regions,
      count: regions.length 
    });

  } catch (error) {
    console.error('获取地区列表错误:', error);
    return NextResponse.json({ 
      error: '获取地区列表失败',
      regions: []
    }, { status: 500 });
  }
}
