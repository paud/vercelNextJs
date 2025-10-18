import { cookies } from 'next/headers';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
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
