// Next.js 13+ Edge API 路由 JWT 鉴权
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || '';

import { NextRequest } from 'next/server';

export async function verifyJWTEdge(request: NextRequest) {
  // 使用 NextAuth 官方 getToken 方法自动解析 session-token
  const token = await getToken({ req: request, secret: JWT_SECRET });
  return token;
  if (!token) {
    console.warn('[verifyJWTEdge] Missing or invalid NextAuth token');
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
  }
  console.log('[verifyJWTEdge] NextAuth token decoded:', token);
  return token;
}
