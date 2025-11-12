import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { safeContent, defaultSafeContentOptions } from "@/lib/safeContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth-config";
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const user = verifyJWTEdge(request);
  if (user instanceof Response) return user;

  try {
    const { userId, name, email, phone } = await request.json();
    const safeName = safeContent(name, defaultSafeContentOptions);
    const safeEmail = safeContent(email, defaultSafeContentOptions);
    const safePhone = safeContent(phone, defaultSafeContentOptions);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert userId to number if it's a string (to handle both traditional and OAuth users)
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Ensure userId is a valid number
    if (typeof userIdNum !== 'number' || isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (safeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData: any = {};
    if (safeName !== undefined) {
      updateData.name = safeName.trim() || null;
    }
    if (safeEmail !== undefined) {
      updateData.email = safeEmail.trim();
    }
    if (safePhone !== undefined) {
      updateData.phone = safePhone.trim() || null;
    }

    // 检查邮箱是否已被其他用户使用
    if (safeEmail) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: safeEmail.trim(),
          NOT: {
            id: userIdNum
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // 更新用户信息前打印日志
    console.log('即将更新用户:', { userId: userIdNum, updateData });

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userIdNum },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户资料时出错:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 使用 next-auth 获取当前登录用户 session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }
  return NextResponse.json({ id: user.id, username: user.username, name: user.name, email: user.email });
}
