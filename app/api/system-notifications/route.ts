import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';

// GET /api/system-notifications 获取当前用户的系统通知（包含全员和个人）
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const notifications = await prisma.systemNotification.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(notifications);
}

// POST /api/system-notifications 仅管理员可用，创建系统通知
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // 这里可扩展为管理员校验
  const { userId, title, content, type } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
  }
  const notification = await prisma.systemNotification.create({
    data: {
      userId: userId ? Number(userId) : null,
      title,
      content,
      type,
    },
  });
  return NextResponse.json(notification);
}
