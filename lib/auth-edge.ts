// Next.js 13+ Edge API 路由 JWT 鉴权
import { NextResponse } from 'next/server';
import { getToken, decode } from "next-auth/jwt";
import { NextRequest } from 'next/server';


const secret = process.env.NEXTAUTH_SECRET || '';

/**这个鉴权永远返回null的原因在于，必须在.zzzz.tech的主域名下的api，才能解析主域名的cookie，而不能在子域名下解析主域名的cookie。所以在子域名下调用这个函数，永远拿不到cookie，从而返回null。
 解决办法是把需要鉴权的API都放在主域名下，或者使用其他鉴权方式，比如在请求头里传token等。
 *
 * 通用 JWT 验证函数
 * 可用于：
 * - Next.js Middleware (NextRequest)
 * - API Route (Node.js req)
 * - Cloudflare Worker / Edge runtime
 * - 直接传入 token 字符串
 */
export async function verifyJWTEdge(request: NextRequest) {
  if (!secret) {
    throw new Error("[verifyJWTEdge] Missing JWT secret");
  }
  // 输出 cookie 和 JWT_SECRET 日志
  console.log('[verifyJWTEdge] cookies:', request.cookies.getAll());

  // ✅ 1. 如果传入的是 token 字符串
  if (typeof request === "string") {
    return await decode({ token: request, secret });
  }

  // ✅ 4. 如果传入 cookies 数组（例如你上面的格式）
  if (Array.isArray(request?.cookies.getAll && request.cookies.getAll())) {
    const cookieValue =
      request.cookies.getAll().find(c => c.name === "next-auth.session-token")?.value ||
      request.cookies.getAll().find(c => c.name === "__Secure-next-auth.session-token")?.value;

    if (!cookieValue) return null;
    console.log('[verifyJWTEdge] cookies:', cookieValue);
    console.log('[verifyJWTEdge] JWT_SECRET:', secret);

    // Manually decode the token from the cookie value since we don't have a full NextApiRequest
    const token = await decode({ token: cookieValue, secret });
    console.log('[verifyJWTEdge] NextAuth token decoded:', token);
    return token;
  }

  // ✅ 2. 如果是带 headers 的对象（自定义环境）
  if (request && request.headers) {
    const token = await getToken({ req: request, secret });
    console.log('[verifyJWTEdge] NextAuth token decoded:', token);
    return token;
  }

  // ✅ 3. 如果是 NextRequest（middleware 中）
  if (request?.cookies && typeof request.cookies.get === "function") {
    const token = await getToken({ req: request, secret });
    return token;
  }


  console.warn("[verifyJWTEdge] Unrecognized input type:", request);
  return null;
}






