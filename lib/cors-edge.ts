// Next.js 13+ Edge API 路由 CORS 处理
import { NextResponse } from 'next/server';

export function corsEdge(request: Request, allowAll: boolean = false) {
  try {
    const origin = request.headers.get('origin');
    let allowOrigin = '*';
    let forbidden = false;
    if (!allowAll) {
      if (origin && origin.endsWith('.zzzz.tech')) {
        allowOrigin = origin;
      } else if (process.env.CORS_ALLOW_ORIGIN) {
        const allowed = process.env.CORS_ALLOW_ORIGIN.split(',').map(s => s.trim());
        if (origin && allowed.includes(origin)) {
          allowOrigin = origin;
        } else if (origin) {
          forbidden = true;
        }
      } else if (origin) {
        forbidden = true;
      }
    }
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    if (request.method === 'OPTIONS') {
      if (forbidden) {
        return new NextResponse('Forbidden', { status: 403 });
      }
      const optionsRes = new NextResponse(null, { status: 200, headers: response.headers });
      return optionsRes;
    }
    return undefined;
  } catch (err) {
    return new NextResponse('CORS Internal Error', { status: 500 });
  }
}
