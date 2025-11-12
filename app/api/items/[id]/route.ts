import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(request);
  if (authUser instanceof Response) return authUser;

  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const itemId = parseInt(id);
    
    // 首先检查商品是否存在
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // 删除商品前，先删除相关 Comment
    await prisma.comment.deleteMany({
      where: { itemId: itemId }
    });
    // 删除商品前，先将相关 Message 的 itemId 设为 null
    await prisma.message.updateMany({
      where: { itemId: itemId },
      data: { itemId: null }
    });

    // 删除商品
    await prisma.item.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('删除商品时出错:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('获取商品详情时出错:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(request);
  if (authUser instanceof Response) return authUser;

  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const itemId = parseInt(id);
    const data = await request.json();
    const { title, description, price, imageUrl } = data;

    // 验证必填字段
    if (!title || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Title and price are required' },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // 更新商品
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrl,
        updatedAt: new Date()
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('更新商品时出错:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
