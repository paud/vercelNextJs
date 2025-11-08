'use client';

import { useState } from 'react';

export default function LiffTestPage() {
  const [testMode, setTestMode] = useState<'line-app' | 'browser'>('line-app');
  const [liffId, setLiffId] = useState(process.env.NEXT_PUBLIC_LIFF_ID || '');
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  
  // 检查是否有活跃的测试
  useState(() => {
    if (typeof window !== 'undefined') {
      setIsTestActive(sessionStorage.getItem('liff_test_active') === 'true');
    }
  });
  
  const testInPlace = async () => {
    setTestResult('');
    try {
      setTestResult('🔄 开始测试...\n');
      
      // 配置测试环境
      sessionStorage.setItem('liff_test_mode', testMode);
      sessionStorage.setItem('liff_test_active', 'true');
      
      // 模拟 LIFF SDK
      (window as any).liff = {
        init: async ({ liffId }: { liffId: string }) => {
          console.log('🧪 [Test] LIFF init:', liffId);
          return Promise.resolve();
        },
        isLoggedIn: () => true,
        isInClient: () => testMode === 'line-app',
        getAccessToken: () => 'test_access_token_123456',
        getIDToken: () => 'test_id_token_123456',
        getProfile: async () => ({
          userId: 'U1234567890abcdef',
          displayName: '测试用户',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Hello World'
        }),
        login: () => console.log('🧪 LIFF login called'),
        logout: () => console.log('🧪 LIFF logout called')
      };
      
      setTestResult(prev => prev + '✅ LIFF SDK 模拟完成\n');
      
      // 测试后端 API
      setTestResult(prev => prev + '🔄 调用后端 API...\n');
      
      const response = await fetch('/api/auth/liff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: 'test_access_token_123456',
          idToken: 'test_id_token_123456'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(prev => prev + '✅ 后端 API 调用成功\n');
        setTestResult(prev => prev + '📋 返回数据:\n' + JSON.stringify(data, null, 2) + '\n');
      } else {
        setTestResult(prev => prev + '❌ 后端 API 调用失败\n');
        setTestResult(prev => prev + '错误: ' + JSON.stringify(data, null, 2) + '\n');
      }
      
      setIsTestActive(true);
      
    } catch (error) {
      setTestResult(prev => prev + '❌ 测试失败: ' + (error instanceof Error ? error.message : '未知错误') + '\n');
      console.error('测试错误:', error);
    }
  };
  
  const clearTest = () => {
    sessionStorage.removeItem('liff_test_mode');
    sessionStorage.removeItem('liff_test_active');
    delete (window as any).__LIFF_TEST_MODE__;
    delete (window as any).liff;
    alert('✅ 测试模式已清除！\n页面将刷新。');
    window.location.reload();
  };
  
  const startTest = () => {
    try {
      console.log('🧪 [Test] 开始配置测试环境...');
      
      // 保存测试配置到 sessionStorage
      sessionStorage.setItem('liff_test_mode', testMode);
      sessionStorage.setItem('liff_test_active', 'true');
      console.log('🧪 [Test] 测试配置已保存到 sessionStorage');
      
      // 模拟 LIFF SDK
      (window as any).liff = {
        init: async ({ liffId }: { liffId: string }) => {
          console.log('🧪 [Test] LIFF init:', liffId);
          return Promise.resolve();
        },
        isLoggedIn: () => {
          console.log('🧪 [Test] LIFF isLoggedIn: true');
          return true;
        },
        isInClient: () => {
          const mode = sessionStorage.getItem('liff_test_mode');
          console.log('🧪 [Test] LIFF isInClient:', mode === 'line-app');
          return mode === 'line-app';
        },
        getAccessToken: () => {
          console.log('🧪 [Test] LIFF getAccessToken');
          return 'test_access_token_123456';
        },
        getIDToken: () => {
          console.log('🧪 [Test] LIFF getIDToken');
          return 'test_id_token_123456';
        },
        getProfile: async () => {
          console.log('🧪 [Test] LIFF getProfile');
          return {
            userId: 'U1234567890abcdef',
            displayName: '测试用户',
            pictureUrl: 'https://via.placeholder.com/150',
            statusMessage: 'Hello World'
          };
        },
        login: () => {
          console.log('🧪 [Test] LIFF login called');
          alert('Test: LINE 登录被调用');
        },
        logout: () => {
          console.log('🧪 [Test] LIFF logout called');
          alert('Test: LINE 登出被调用');
          sessionStorage.removeItem('liff_test_mode');
          sessionStorage.removeItem('liff_test_active');
        }
      };
      
      console.log('🧪 [Test] LIFF SDK 模拟完成');
      
      // 模拟 LINE User Agent
      if (testMode === 'line-app') {
        (window as any).__LIFF_TEST_MODE__ = true;
        console.log('🧪 [Test] LINE App 模式已激活');
      }
      
      console.log('🧪 [Test] 测试环境配置完成！');
      
      // 不要立即跳转，让用户选择
      const shouldRedirect = confirm(
        '✅ 测试环境已配置完成！\n\n' +
        '点击"确定"跳转到首页测试\n' +
        '点击"取消"留在当前页面\n\n' +
        '（建议先打开 Console (F12) 再跳转）'
      );
      
      if (shouldRedirect) {
        console.log('🧪 [Test] 准备跳转到首页...');
        window.location.href = '/';
      } else {
        alert('测试环境已就绪！\n你可以手动访问任何页面进行测试。');
      }
      
    } catch (error) {
      console.error('🧪 [Test] 配置测试环境时出错:', error);
      alert('❌ 配置失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">🧪 LIFF 本地测试工具</h1>
          <p className="text-gray-600 mb-8">模拟 LINE App 环境测试 LIFF 登录功能</p>
          
          <div className="space-y-6">
            {/* LIFF ID 配置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LIFF ID
              </label>
              <input
                type="text"
                value={liffId}
                onChange={(e) => setLiffId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2008401854-JByPXB2k"
              />
              <p className="mt-1 text-xs text-gray-500">
                从 .env 文件读取：{process.env.NEXT_PUBLIC_LIFF_ID || '(未配置)'}
              </p>
            </div>
            
            {/* 测试模式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                测试模式
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="line-app"
                    checked={testMode === 'line-app'}
                    onChange={(e) => setTestMode(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">📱 LINE App 环境（模拟）</div>
                    <div className="text-sm text-gray-600">
                      模拟在 LINE App 中打开，会自动触发登录流程
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="browser"
                    checked={testMode === 'browser'}
                    onChange={(e) => setTestMode(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">🌐 普通浏览器</div>
                    <div className="text-sm text-gray-600">
                      在普通浏览器中打开，不会触发 LIFF 登录
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* 测试按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={testInPlace}
                className="bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 font-semibold shadow-md transition-colors"
              >
                🧪 在此测试
              </button>
              
              <button
                onClick={startTest}
                className="bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 font-semibold shadow-md transition-colors"
              >
                🚀 跳转测试
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              "在此测试"直接显示结果 | "跳转测试"跳转到首页
            </p>
            
            {/* 清除测试模式按钮 */}
            {isTestActive && (
              <button
                onClick={clearTest}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
              >
                🧹 清除测试模式
              </button>
            )}
          </div>
        </div>
        
        {/* 测试结果显示 */}
        {testResult && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 mb-6 font-mono text-sm">
            <h3 className="text-white font-semibold mb-3">📊 测试结果</h3>
            <pre className="whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
        
        {/* 测试状态提示 */}
        {isTestActive && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🧪</span>
              <div>
                <p className="font-semibold text-purple-900">测试模式已激活</p>
                <p className="text-sm text-purple-700">
                  当前正在模拟 {sessionStorage.getItem('liff_test_mode') === 'line-app' ? 'LINE App' : '浏览器'} 环境
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 测试说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 测试说明</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ 点击"开始测试"会模拟 LIFF 环境并重定向到首页</li>
            <li>✓ 测试的 access token 是假的，需要配合后端测试模式使用</li>
            <li>✓ 打开浏览器 Console (F12) 查看详细日志</li>
            <li>✓ 真实测试请使用 ngrok + LINE App</li>
          </ul>
        </div>
        
        {/* 后端配置说明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">⚠️ 后端配置（重要）</h3>
          <p className="text-sm text-yellow-800 mb-3">
            测试模式使用假的 token，需要在后端跳过验证。在 <code className="bg-yellow-100 px-2 py-1 rounded">app/api/auth/liff-login/route.ts</code> 添加：
          </p>
          <pre className="bg-yellow-100 p-3 rounded text-xs overflow-x-auto">
{`// 在 POST 函数开头添加
if (process.env.NODE_ENV === 'development' && 
    accessToken === 'test_access_token_123456') {
  // 返回测试用户数据
  return NextResponse.json({
    success: true,
    user: { /* 测试数据 */ }
  });
}`}
          </pre>
        </div>
        
        {/* 真实测试说明 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">🔥 真实环境测试</h3>
          <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
            <li>安装 ngrok: <code className="bg-green-100 px-2 py-1 rounded">choco install ngrok</code></li>
            <li>启动开发服务器: <code className="bg-green-100 px-2 py-1 rounded">npm run dev</code></li>
            <li>运行 ngrok: <code className="bg-green-100 px-2 py-1 rounded">ngrok http 3000</code></li>
            <li>在 LINE Developers Console 更新 LIFF Endpoint URL</li>
            <li>在 LINE App 中打开 LIFF URL 测试</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
