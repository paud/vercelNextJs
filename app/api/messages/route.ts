import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';

// 获取消息列表（支持与某用户的对话、分页）
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const searchParams = req.nextUrl.searchParams;
  const withUserId = Number(searchParams.get('with'));
  const take = Number(searchParams.get('take') || 30);
  const skip = Number(searchParams.get('skip') || 0);

  if (!withUserId) {
    return NextResponse.json({ error: 'Missing with param' }, { status: 400 });
  }

  // 查询双方的消息
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: withUserId },
        { senderId: withUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    skip,
    take,
  });
  return NextResponse.json(messages);
}

// 发送消息
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const body = await req.json();
  const { receiverId, content } = body;
  if (!receiverId || !content) {
    return NextResponse.json({ error: 'Missing receiverId or content' }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId: Number(receiverId),
      content,
    },
  });
  return NextResponse.json(message);
}
