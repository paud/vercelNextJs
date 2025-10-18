"use client";

import { useEffect, useState } from 'react';

export default function CookieDebugger() {
  const [cookies, setCookies] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');

  useEffect(() => {
    const checkCookies = () => {
      const allCookies = document.cookie;
      setCookies(allCookies);
      
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userInfo='));
      
      if (userInfoCookie) {
        try {
          const cookieValue = userInfoCookie.split('=')[1];
          const parsed = JSON.parse(decodeURIComponent(cookieValue));
          setUserInfo(JSON.stringify(parsed, null, 2));
        } catch (error) {
          setUserInfo('Error parsing user info: ' + error);
        }
      } else {
        setUserInfo('No userInfo cookie found');
      }
    };

    checkCookies();
    const interval = setInterval(checkCookies, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2">Cookie Debug</h3>
      <div className="mb-2">
        <strong>All Cookies:</strong>
        <pre className="whitespace-pre-wrap break-all">{cookies || 'No cookies'}</pre>
      </div>
      <div>
        <strong>User Info:</strong>
        <pre className="whitespace-pre-wrap">{userInfo}</pre>
      </div>
    </div>
  );
}
