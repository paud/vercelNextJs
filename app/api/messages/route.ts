import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';
import { safeContent, defaultSafeContentOptions } from "@/lib/safeContent";
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

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

  console.log('API /api/messages GET:', { userId, withUserId });

  if (!withUserId) {
    return NextResponse.json({ error: 'Missing with param' }, { status: 400 });
  }

  // 查询双方的消息，带上商品信息字段
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
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      content: true,
      createdAt: true,
      read: true,
      readAt: true,
      itemId: true,
      itemTitle: true,
      imageUrl: true,
    },
  });
  console.log('API /api/messages GET: messages.length =', messages.length);
  return NextResponse.json(messages);
}

// 发送消息
export async function POST(req: NextRequest) {
  const corsRes = corsEdge(req);
  if (corsRes) return corsRes;
  const authUser = await verifyJWTEdge(req);
  if (authUser instanceof Response) return authUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const body = await req.json();
  const { receiverId, content, itemId } = body;
  const safe = safeContent(content, defaultSafeContentOptions);
  if (!receiverId || !safe) {
    return NextResponse.json({ error: 'Missing receiverId or content' }, { status: 400 });
  }
  let itemTitle = undefined;
  let imageUrl = undefined;
  if (itemId) {
    const item = await prisma.item.findUnique({ where: { id: Number(itemId) }, select: { title: true, imageUrl: true } });
    if (item) {
      itemTitle = item.title;
      imageUrl = item.imageUrl;
    }
  }
  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId: Number(receiverId),
      content: safe,
      itemId: itemId ? Number(itemId) : undefined,
      itemTitle,
      imageUrl,
    },
  });
  return NextResponse.json(message);
}
