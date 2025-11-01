'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

declare global {
  interface Window {
    liff?: any;
  }
}

/**
 * 智能 LINE 登录按钮
 * 
 * 自动检测环境：
 * - 在 LINE App 中：使用 LIFF 登录（无跳转）
 * - 在浏览器中：使用 LINE Login（跳转授权）
 */
export default function LineLoginButton() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const [isInLine, setIsInLine] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检测是否在 LINE App 中
    const checkLineEnvironment = () => {
      const liff = window.liff;
      if (liff && liff.isInClient && liff.isInClient()) {
        setIsInLine(true);
      }
      setLoading(false);
    };

    // 等待 LIFF SDK 加载
    if (window.liff) {
      checkLineEnvironment();
    } else {
      // 如果 LIFF SDK 还没加载，等待一下
      setTimeout(checkLineEnvironment, 500);
    }
  }, []);

  const handleLogin = async () => {
    if (isInLine && window.liff) {
      // 方式 1: 使用 LIFF 登录（在 LINE App 中）
      try {
        const liff = window.liff;
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          // 已经登录，获取用户信息
          const profile = await liff.getProfile();
          console.log('LIFF 用户信息:', profile);
          
          // TODO: 调用你的 API，将 LIFF 用户信息同步到你的数据库
          // 创建 session
        }
      } catch (error) {
        console.error('LIFF 登录失败:', error);
        // 降级到普通 LINE Login
        signIn('line', { callbackUrl: `/${locale}/users/profile` });
      }
    } else {
      // 方式 2: 使用 LINE Login（在普通浏览器中）
      signIn('line', { callbackUrl: `/${locale}/users/profile` });
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        <span>{t('loading')}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34b] text-white rounded-lg transition-colors font-medium"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
          fill="currentColor"
        />
      </svg>
      <span>{t('line_login')}</span>
      {isInLine && (
        <span className="text-xs opacity-80">({t('line_login_fast')})</span>
      )}
    </button>
  );
}
