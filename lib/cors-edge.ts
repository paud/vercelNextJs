// Next.js 13+ Edge API 路由 CORS 处理
import { NextResponse } from 'next/server';

export function corsEdge(request: Request) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  return null;
}
