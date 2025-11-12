import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth-config";
import fs from "fs";
import path from "path";
import { safeContent, defaultSafeContentOptions } from "@/lib/safeContent";
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

function getLocaleMessages(locale: string) {
  const supported = ["en", "zh", "ko"];
  const lang = supported.includes(locale) ? locale : "en";
  try {
    const filePath = path.join(process.cwd(), "messages", `${lang}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getAnonymous() {
  return "Anonymous";
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const corsRes = corsEdge(req);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(req);
  if (authUser instanceof Response) return authUser;

  try {
    const { id } = await context.params;
    const itemId = Number(id);
    // 检查 item 是否存在
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json([]); // item 不存在，返回空评论
    }
    // 获取所有评论，包含用户信息和 replies
    const comments = await prisma.comment.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, name: true, id: true } },
        replies: {
          include: { user: { select: { username: true, name: true, id: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    // 构建嵌套结构
    type CommentNode = {
      id: number;
      user: string;
      userId: number|null;
      content: string;
      createdAt: string;
      parentId: number|null;
      replies: CommentNode[];
    };
    const buildTree = (list: any[], parentId: number|null = null): CommentNode[] =>
      list.filter(c => c.parentId === parentId).map((c: any) => ({
        id: c.id,
        user: c.user?.username || c.user?.name || getAnonymous(),
        userId: c.user?.id || null,
        content: c.content,
        createdAt: c.createdAt,
        parentId: c.parentId,
        replies: buildTree(list, c.id),
      }));
    return NextResponse.json(buildTree(comments));
  } catch (e) {
    return NextResponse.json([], { status: 200 }); // 捕获异常也返回空数组
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  const itemId = Number(id);
  const { content, parentId } = await req.json();
  const safe = safeContent(content, defaultSafeContentOptions);
  if (!safe || typeof safe !== "string" || safe.length < 1) {
    return NextResponse.json({ error: "empty_comment" }, { status: 400 });
  }
  const comment = await prisma.comment.create({
    data: {
      itemId,
      userId: Number(session.user.id),
      content: safe,
      parentId: parentId ?? null,
    },
    include: { user: { select: { username: true, name: true, id: true } } },
  });
  return NextResponse.json({
    id: comment.id,
    user: comment.user?.username || comment.user?.name || getAnonymous(),
    userId: comment.user?.id || comment.userId,
    content: comment.content,
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    replies: [],
  });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  const commentId = Number(id);
  // 查找评论，确保是本人
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "comment_not_found" }, { status: 404 });
  }
  if (comment.userId !== Number(session.user.id)) {
    return NextResponse.json({ error: "no_permission" }, { status: 403 });
  }
  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
