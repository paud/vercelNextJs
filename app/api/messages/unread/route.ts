import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';

// GET /api/messages/unread 获取当前用户所有未读消息数
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }
  const userId = Number(session.user.id);
  // 按发送方分组统计未读消息数
  const unread = await prisma.message.groupBy({
    by: ['senderId'],
    where: { receiverId: userId, read: false },
    _count: { _all: true },
  });
  return NextResponse.json(unread);
}
