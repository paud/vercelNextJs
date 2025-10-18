import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, phone } = await request.json();

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
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }
    if (email !== undefined) {
      updateData.email = email.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim(),
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
