import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';

// DELETE /api/system-notifications/delete  批量删除系统通知 { ids: number[] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
  }
  // 只允许删除属于自己的或全员的通知
  const result = await prisma.systemNotification.deleteMany({
    where: {
      id: { in: ids },
      OR: [
        { userId: null },
        { userId: userId },
      ],
    },
  });
  return NextResponse.json({ count: result.count });
}
