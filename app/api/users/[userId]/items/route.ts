import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const authUser = await verifyJWTEdge(request);
  if (authUser instanceof Response) return authUser;

  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert userId to number if it's a string (to handle both traditional and OAuth users)
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Ensure userId is a valid number
    if (typeof userIdNum !== 'number' || isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // 获取用户的所有商品
    const items = await prisma.item.findMany({
      where: {
        sellerId: userIdNum
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('获取用户商品时出错:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user items' },
      { status: 500 }
    );
  }
}
