import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

// GET /api/messages/conversations 获取当前用户的所有会话（最近联系人+最后一条消息+未读数）
export async function GET(request: Request) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(request);
  if (authUser instanceof Response) return authUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);

  // 查询所有与当前用户有关的会话（去重）
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  // 以对方ID分组，获取每个会话的最后一条消息
  const conversationsMap = new Map();
  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, msg);
    }
  }
  const conversations = Array.from(conversationsMap.values());

  // 查询每个会话的未读消息数
  const unreadCounts = await prisma.message.groupBy({
    by: ['senderId'],
    where: { receiverId: userId, read: false },
    _count: { _all: true },
  }) as Array<{ senderId: number; _count: { _all: number } }>;
  const unreadMap = new Map(unreadCounts.map(u => [u.senderId, u._count._all]));

  // 批量查找所有对方用户信息
  const otherUserIds = conversations.map(msg => (msg.senderId === userId ? msg.receiverId : msg.senderId));
  const users = await prisma.user.findMany({
    where: { id: { in: otherUserIds } },
    select: { id: true, username: true, name: true, email: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  // 拼接返回
  const result = conversations.map(msg => {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const user = userMap.get(otherId);
    let userName = user?.name || user?.username || user?.email || '未知用户';
    return {
      userId: otherId,
      userName,
      lastMessage: msg,
      unread: unreadMap.get(otherId) || 0,
    };
  });

  return NextResponse.json(result);
}
