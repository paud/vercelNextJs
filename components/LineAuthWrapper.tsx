'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface LineAuthWrapperProps {
  children: React.ReactNode;
}

interface Liff {
  init: (config: { liffId: string; withLoginOnExternalBrowser?: boolean }) => Promise<void>;
  isLoggedIn: () => boolean;
  login: (config?: { redirectUri?: string; scope?: string }) => Promise<void>;
  getAccessToken: () => string | null;
  getIDToken: () => string | null;
}

export default function LineAuthWrapper({ children }: LineAuthWrapperProps) {
  const { data: session, status } = useSession();
  const [liffReady, setLiffReady] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data || '');
    setDebugLogs(prev => [...prev, logMessage + (data ? `: ${JSON.stringify(data, null, 2)}` : '')]);
  };

  useEffect(() => {
    // 如果已经通过 NextAuth 登录，不需要 LIFF 静默登录
    if (status === 'authenticated') {
      addLog('用户已通过 NextAuth 登录，跳过 LIFF 登录');
      setLiffReady(true);
      return;
    }

    // 只在未登录时进行 LIFF 静默登录
    if (status === 'unauthenticated') {
      addLog('用户未登录，开始 LIFF 初始化');
      initLiff();
    }
  }, [status]);
  const initLiff = async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        addLog('❌ LIFF ID 未配置');
        setLiffReady(true);
        return;
      }

      addLog('LIFF ID', liffId);

      // 动态加载 LIFF SDK
      if (!(window as any).liff) {
        addLog('正在加载 LIFF SDK...');
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        addLog('✅ LIFF SDK 加载成功');
      }

      // 初始化 LIFF，只请求 openid
      const liff = (window as any).liff as Liff;
      addLog('开始初始化 LIFF...');
      await liff.init({
        liffId,
        withLoginOnExternalBrowser: false // 外部浏览器不强制登录
      });

      addLog('✅ LIFF 初始化成功');

      // 检查登录状态
      const isLoggedIn = liff.isLoggedIn();
      addLog('LIFF 登录状态', { isLoggedIn });
      
      if (!isLoggedIn) {
        addLog('用户未登录 LIFF，进行自动授权...');
        // 对于只有 openid 的 LIFF，这应该是静默的（不弹窗）
        await liff.login({ 
          redirectUri: window.location.href 
        });
        // login 会重定向，所以下面的代码不会执行
        return;
      }
      
      // 已登录，进行静默登录验证
      addLog('开始静默登录验证...');
      const success = await handleSilentLogin();
      
      if (!success) {
        addLog('❌ Token 验证失败，可能需要重新授权');
        // 如果验证失败，可以尝试强制重新登录
        // await liff.login({ redirectUri: window.location.href });
      }

      setLiffReady(true);

    } catch (error: any) {
      addLog('❌ LIFF 初始化失败', { error: error.message || String(error) });
      setLiffReady(true); // 即使失败也继续加载应用
    }
  };

  const handleSilentLogin = async (): Promise<boolean> => {
    try {
      const liff = (window as any).liff as Liff;
      
      // 获取 access token 和 ID token
      const accessToken = liff.getAccessToken();
      const idToken = liff.getIDToken();

      addLog('Token 信息', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length,
        hasIdToken: !!idToken,
        idTokenLength: idToken?.length
      });

      // 解析 ID Token 查看 openid 信息
      if (idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            addLog('ID Token 内容', {
              sub: payload.sub, // 这就是 openid (用户ID)
              email: payload.email,
              name: payload.name,
              picture: payload.picture
            });
          }
        } catch (e) {
          addLog('⚠️ 无法解析 ID Token');
        }
      } else {
        addLog('⚠️ 未获取到 ID Token - 可能 LIFF 未配置 openid scope');
      }

      if (!accessToken) {
        addLog('❌ 无法获取 access token');
        return false;
      }

      const requestBody = {
        accessToken,
        idToken,
        mode: 'verify',
      };

      addLog('发送请求到后端', {
        mode: requestBody.mode,
        hasAccessToken: !!requestBody.accessToken,
        hasIdToken: !!requestBody.idToken
      });

      // 调用后端 API 进行验证和登录
      const response = await fetch('/api/auth/liff-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      addLog('后端响应状态', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        const errorText = await response.text();
        addLog('❌ 后端验证失败', {
          status: response.status,
          error: errorText.substring(0, 200)
        });
        return false;
      }

      const data = await response.json();
      addLog('✅ 静默登录成功', { user: data.user?.email || data.user?.name });
      
      // 登录成功后可以刷新页面或更新状态
      setTimeout(() => {
        addLog('准备刷新页面...');
        window.location.reload();
      }, 2000);
      
      return true;
      
    } catch (error: any) {
      addLog('❌ 静默登录失败', { error: error.message || String(error) });
      return false;
    }
  };

  // 等待 session 状态确定
  if (status === 'loading' || !liffReady) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-2xl w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Loading...</p>
          
          {/* 调试日志面板 */}
          {debugLogs.length > 0 && (
            <div className="mt-4 text-left bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">调试日志:</h3>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                  {showDebug ? '隐藏' : '显示'}
                </button>
              </div>
              {showDebug && (
                <div className="space-y-1">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono whitespace-pre-wrap break-all">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 始终显示调试按钮 */}
      {debugLogs.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg text-sm"
          >
            {showDebug ? '隐藏日志' : '显示日志'}
          </button>
          {showDebug && (
            <div className="absolute bottom-14 right-0 w-96 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-xl p-4">
              <h3 className="font-bold text-sm mb-2">调试日志:</h3>
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono whitespace-pre-wrap break-all border-b pb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {children}
    </>
  );
}
