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
      setCurrentUser({
        id: session.user.id?.toString() || '',
        email: session.user.email || '',
        name: session.user.name || null,
        image: session.user.image || null,
        username: (session.user as any).username || session.user.email?.split('@')[0] || 'user',
        phone: null, // Google users don't have phone by default
        createdAt: new Date().toISOString(), // Default to current time for OAuth users
        provider: 'oauth'
      });
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
    } else {
      setCurrentUser(null);
    }

    setIsLoading(false);
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
