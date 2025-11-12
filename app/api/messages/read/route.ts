import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth-config';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

// 批量将与某用户的消息标记为已读
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
  const { withUserId } = await req.json();
  if (!withUserId) {
    return NextResponse.json({ error: 'Missing withUserId' }, { status: 400 });
  }
  // 将所有对方发给当前用户且未读的消息设为已读
  await prisma.message.updateMany({
    where: {
      senderId: withUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true, readAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
