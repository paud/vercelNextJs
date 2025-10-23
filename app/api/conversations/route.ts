import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';

// 获取当前用户的所有会话（与谁有消息往来，最新一条消息、未读数等）
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);

  // 查询所有与当前用户有关的消息
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  // 聚合会话（每个对方用户只保留最新一条消息）
  const conversationMap = new Map();
  for (const msg of messages) {
    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unreadCount: 0,
        messages: [],
      });
    }
    // 统计未读数
    if (!msg.read && msg.receiverId === userId) {
      conversationMap.get(otherUserId).unreadCount++;
    }
    conversationMap.get(otherUserId).messages.push(msg);
  }

  // 查询用户名
  const userIds = Array.from(conversationMap.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, name: true },
  });
  for (const conv of conversationMap.values()) {
    const user = users.find((u: { id: number; username: string | null; name: string | null }) => u.id === conv.userId);
    conv.userName = user?.username || user?.name || `User${conv.userId}`;
  }

  return NextResponse.json(Array.from(conversationMap.values()));
}
