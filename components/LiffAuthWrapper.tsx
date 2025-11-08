import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

// 获取 LIFF 相关 localStorage 的 key 列表
const getLiffLocalStorageKeys = (prefix: string) => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.indexOf(prefix) === 0) {
      keys.push(key);
    }
  }
  return keys;
};
// 清理过期的 idToken
const clearExpiredIdToken = (liffId: string) => {
  const keyPrefix = `LIFF_STORE:${liffId}:`;
  const key = keyPrefix + 'decodedIDToken';
  const decodedIDTokenString = localStorage.getItem(key);
  if (!decodedIDTokenString) {
    return;
  }
  const decodedIDToken = JSON.parse(decodedIDTokenString);
  if (new Date().getTime() > decodedIDToken.exp * 1000) {
    const keys = getLiffLocalStorageKeys(keyPrefix);
    keys.forEach(function (key) {
      localStorage.removeItem(key);
    });
  }
};

export default function LiffAuthWrapper() {
  useEffect(() => {
    async function sendIdToken() {
      if (typeof window === 'undefined') return;
      const ua = navigator.userAgent || '';
      if (!ua.includes('Line/') && !ua.includes('LINE/')) return;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!window.liff) {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;
        script.onload = () => sendIdToken();
        document.head.appendChild(script);
        return;
      }
      await window.liff.init({ liffId });
      if (!window.liff.ready) return;
      if (!window.liff.isLoggedIn()) {
        window.liff.login({ redirectUri: window.location.href });
        return;
      }
      clearExpiredIdToken(liffId as string);
      const idToken = window.liff.getIDToken();
      if (!idToken) {
        window.liff.login({ redirectUri: window.location.href });
        return;
      }
      const res = await fetch('/api/auth/liff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) return;
      try {
        const result = await res.json();
        if (result && result.token) {
          await signIn('credentials', {
            redirect: false,
            provider: 'line-liff',
            token: result.token,
          });
        }
      } catch (e) {
        // ignore
      }
    }
    sendIdToken();
  }, []);
  return null;
}