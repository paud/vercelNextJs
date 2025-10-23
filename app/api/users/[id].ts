import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users/[id] 获取用户基本信息
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = Number(params.id);
  if (!userId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, name: true, image: true, email: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}
