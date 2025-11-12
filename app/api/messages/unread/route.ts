import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

// GET /api/messages/unread 获取当前用户所有未读消息数
export async function GET(req: NextRequest) {
  const corsRes = corsEdge(req);
  if (corsRes) return corsRes;
  const authUser = await verifyJWTEdge(req);
  if (authUser instanceof Response) return authUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }
  
  const userId = Number(session.user.id);
  
  // 验证 userId 是有效数字
  if (isNaN(userId) || userId <= 0) {
    console.error('Invalid userId:', session.user.id);
    return NextResponse.json([], { status: 400 });
  }
  
  try {
    // 直接查询未读消息，不使用 groupBy（避免 Prisma 的 groupBy bug）
    const unreadMessages = await prisma.message.findMany({
      where: { 
        receiverId: userId, 
        read: false 
      },
      select: {
        senderId: true,
      },
    });

    // 手动分组统计
    const unreadCount = unreadMessages.reduce((acc: Record<number, number>, msg: { senderId: number }) => {
      acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // 转换为数组格式
    const result = Object.entries(unreadCount).map(([senderId, count]) => ({
      senderId: Number(senderId),
      _count: { _all: count }
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    return NextResponse.json([], { status: 500 });
  }
}
