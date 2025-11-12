import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || '';

function getCookieFromReq(req: any, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function verifyJWT(req: any, res: any): string | JwtPayload | null {
  // 优先从 Authorization header 获取 JWT
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  } else {
    // 其次从 cookie 获取 JWT（next-auth.session-token 或 jwt）
    token = getCookieFromReq(req, 'next-auth.session-token') || getCookieFromReq(req, 'jwt');
  }
  if (!token) {
    res.status(401).json({ error: 'Missing JWT token' });
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as string | JwtPayload;
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get('userInfo');
    
    if (!userInfoCookie) {
      return null;
    }
    
    return JSON.parse(userInfoCookie.value) as UserInfo;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    
    if (!userIdCookie) {
      return null;
    }
    
    return parseInt(userIdCookie.value);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const userId = await getUserId();
  return userId !== null;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('userInfo');
}
