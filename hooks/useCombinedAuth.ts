"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useAuth as useTraditionalAuth } from './useAuth';

interface CombinedUser {
  id: string;
  username?: string;
  email: string;
  name: string | null;
  image?: string | null;
  phone?: string | null;
  createdAt?: string;
  provider: 'traditional' | 'oauth';
}

export function useCombinedAuth() {
  const { data: session, status } = useSession();
  const traditionalAuth = useTraditionalAuth();
  const [currentUser, setCurrentUser] = useState<CombinedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading' || traditionalAuth.isLoading) {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      // NextAuth user with database session
      const userId = session.user.id?.toString() || '';
      
      // 如果 session 中没有 id，说明 session callback 可能还没完成
      // 但我们仍然设置用户，只是标记 id 为临时值
      if (!userId) {
        console.warn('[useCombinedAuth] Session user exists but id is missing:', session.user);
      }

      setCurrentUser({
        id: userId,
        email: session.user.email || '',
        name: session.user.name || null,
        image: session.user.image || null,
        username: (session.user as any).username || session.user.email?.split('@')[0] || 'User',
        phone: null, // OAuth users don't have phone by default
        createdAt: new Date().toISOString(), // Default to current time for OAuth users
        provider: 'oauth'
      });
      setIsLoading(false);
    } else if (traditionalAuth.currentUser) {
      // Traditional auth user  
      setCurrentUser({
        id: traditionalAuth.currentUser.id.toString(),
        username: traditionalAuth.currentUser.username,
        email: traditionalAuth.currentUser.email,
        name: traditionalAuth.currentUser.name,
        phone: traditionalAuth.currentUser.phone || null,
        createdAt: traditionalAuth.currentUser.createdAt,
        provider: 'traditional'
      });
      setIsLoading(false);
    } else {
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [session, status, traditionalAuth.currentUser, traditionalAuth.isLoading]);

  const logout = async (locale?: string) => {
    if (currentUser?.provider === 'oauth') {
      await signOut({ callbackUrl: locale ? `/${locale}/auth/signin` : '/auth/signin' });
    } else {
      traditionalAuth.logout();
    }
  };

  return {
    currentUser,
    isLoading,
    logout,
    setCurrentUser // 暴露 setCurrentUser
  };
}
