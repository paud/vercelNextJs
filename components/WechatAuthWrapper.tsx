import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { apiRequest } from '@/lib/request';

function isWechatMiniProgramWebview() {
  // 微信小程序 webview 环境判断
  // 通过 userAgent 或 window.__wxjs_environment 检测
  if (typeof window !== 'undefined') {
    if (window.__wxjs_environment === 'miniprogram') return true;
    if (navigator.userAgent.includes('miniProgram')) return true;
    // 兼容部分微信小程序 UA
    if (/MicroMessenger/i.test(navigator.userAgent) && /miniprogram/i.test(navigator.userAgent)) return true;
  }
  return false;
}

export default function WechatAuthWrapper() {
  const { data: session, status } = useSession();

  // 如果不在微信小程序 webview 环境，直接 return null
  if (!isWechatMiniProgramWebview()) {
    //console.log('WechatAuthWrapper: 非微信小程序 webview 环境，跳过自动登录');
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.zzzz.tech';
    if (typeof document !== 'undefined') {
      //document.cookie = `wechat_miniprogram_code=0d1bXw0w3I1nZ53g8x0w3jqy4x0bXw04; domain=${cookieDomain}; path=/; secure;`;
    }
    return null;
  }

  useEffect(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2 && parts[1]) return parts.pop()?.split(';').shift() || null;
      return null;
    }
    const urlParams = new URLSearchParams(window.location.search);
    console.log('WechatAuthWrapper: window.location.search', window.location.search);
    var code = urlParams.get('code');
    console.log('WechatAuthWrapper: code from url', code);
    if (!code || code === '') {
      //alert('WechatAuthWrapper: code 参数为空，自动登录中止');
      code = getCookie('wechat_miniprogram_code') || localStorage.getItem('wechat_miniprogram_code') || code;
    } else {
      // 存储 code 到 localStorage，供小程序后续查询页面 URL 使用
      //alert(code)
      localStorage.setItem('wechat_miniprogram_code', code);
      // 存储 code 到 cookie，供所有子域名共享
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.zzzz.tech';
      document.cookie = `wechat_miniprogram_code=${code}; domain=${cookieDomain}; path=/; secure;`;
    }
    if (status === 'loading') return; // 等待 session 加载

    // 记录当前用户所处的URL和用户ID
    if (session?.user && typeof window !== 'undefined') {
      const userId = session.user.id;
      const currentUrl = window.location.href;
      const code1 = getCookie('wechat_miniprogram_code') || localStorage.getItem('wechat_miniprogram_code') || code;
      // 可根据实际需求将数据发送到后端或存储
      apiRequest('/api/user-location-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, url: currentUrl, code: code1, title: '超值分享，快来看看吧' }),
      });
    }

    if (session?.user) {
      console.log('WechatAuthWrapper: 已登录，无需重复验证', session.user);
      return;
    }
    async function autoWechatLogin() {

      // 用 code 请求后端，后端只返回 token
      const res = await apiRequest('/api/auth/wechat-miniprogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await res.json();
      console.log('WechatAuthWrapper: 后端返回', result);
      //alert('WechatAuthWrapper: 后端返回' + JSON.stringify(result));
      if (res.status === 400) {
        console.warn('WechatAuthWrapper: 微信认证失败，终止登录流程');
        return;
      }
      if (result && result.token) {
        // 存储 token 到 localStorage，永不过期（仅示例，实际建议后端控制有效期）
        localStorage.setItem('wechat_miniprogram_token', result.token);
        await signIn('credentials', {
          redirect: true,
          provider: 'wechat-miniprogram',
          token: result.token,
        });
      }

    }
    autoWechatLogin();
  }, [session, status]);
  return null;
}
