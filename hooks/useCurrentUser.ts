"use client";

import { useCombinedAuth } from './useCombinedAuth';

/**
 * 用于获取当前已认证用户信息的简化 hook
 * 这个 hook 假设用户已经通过 UserHeader 的认证检查
 */
export function useCurrentUser() {
  const { currentUser } = useCombinedAuth();
  
  // 这里可以添加更多的用户相关逻辑
  return {
    user: currentUser,
    isLoggedIn: !!currentUser,
  };
}
