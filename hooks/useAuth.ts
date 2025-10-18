"use client";

import { useState, useEffect } from 'react';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
  phone?: string | null;
  createdAt?: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserLogin = () => {
    try {
      setIsLoading(true);
      console.log('useAuth: 检查用户登录状态');
      
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userInfo='));
      
      console.log('useAuth: 找到的userInfo cookie:', userInfoCookie);
      
      if (userInfoCookie) {
        const cookieValue = userInfoCookie.split('=')[1];
        const userInfo = JSON.parse(decodeURIComponent(cookieValue));
        console.log('useAuth: 解析的用户信息:', userInfo);
        setCurrentUser(userInfo);
      } else {
        console.log('useAuth: 没有找到userInfo cookie');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('useAuth: 检查用户登录时出错:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // 删除cookie
      document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    checkUserLogin();
    
    // 监听storage事件（可以用于跨标签页同步）
    const handleStorageChange = () => {
      checkUserLogin();
    };
    
    // 监听页面焦点事件
    const handleFocus = () => {
      checkUserLogin();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // 每隔5秒检查一次cookie状态（用于调试）
    const interval = setInterval(checkUserLogin, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  return {
    currentUser,
    isLoading,
    checkUserLogin,
    logout
  };
}
