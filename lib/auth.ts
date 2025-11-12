import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || '';

export function verifyJWT(req: any, res: any): null | object {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
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
