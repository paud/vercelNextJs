import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

// POST /api/system-notifications/read  批量标记系统通知为已读 { ids: number[] }
export async function POST(req: NextRequest) {
  const corsRes = corsEdge(req);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(req);
  if (authUser instanceof Response) return authUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
  }
  // 只允许标记属于自己的或全员的通知
  const result = await prisma.systemNotification.updateMany({
    where: {
      id: { in: ids },
      OR: [
        { userId: null },
        { userId: userId },
      ],
    },
    data: { read: true },
  });
  return NextResponse.json({ count: result.count });
}
