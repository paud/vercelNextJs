import { cookies } from 'next/headers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/nextauth-config";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    // First, check for NextAuth session (OAuth users)
    const session = await getServerSession(authOptions);
    if (session?.user) {
      // Convert NextAuth user to our UserInfo format
      return {
        id: parseInt(session.user.id as string), // NextAuth user.id might be string
        username: (session.user as any).username || session.user.email?.split('@')[0] || 'user',
        email: session.user.email!,
        name: session.user.name || null
      };
    }

    // Fallback to traditional cookie-based auth
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
    // First, check for NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return parseInt(session.user.id as string);
    }

    // Fallback to traditional cookie-based auth
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
