"use client";

import Link from "next/link";
import { useLocale, useTranslations } from 'next-intl';
import { useCombinedAuth } from '../hooks/useCombinedAuth';
import { useState, useEffect } from 'react';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('Header');
  const { currentUser } = useCombinedAuth();
  const [detectedRegion, setDetectedRegion] = useState<string>('tokyo'); // 默认东京
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // 获取地区显示名称
  const getRegionDisplayName = (region: string) => {
    switch (region) {
      case 'osaka': return t('region_osaka');
      case 'tokyo': return t('region_tokyo');
      case 'kyoto': return t('region_kyoto');
      default: return t('region');
    }
  };

  // 地理定位功能
  useEffect(() => {
    const detectLocation = async () => {
      setIsDetecting(true);
      
      // 检查是否支持地理定位
      if (!navigator.geolocation) {
        console.log('浏览器不支持地理定位，设置默认地区为东京');
        setDetectedRegion('tokyo');
        setIsDetecting(false);
        return;
      }

      // 获取用户位置
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('用户位置:', latitude, longitude);
          
          try {
            // 调用后端API进行地区检测
            const response = await fetch('/api/auto-detect-region', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ latitude, longitude }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.region) {
                setDetectedRegion(data.region);
                setLocationDetected(true);
                console.log('检测到的地区:', data.region);
                
                // 可选：自动跳转到检测到的地区
                // window.location.href = `/${locale}?region=${data.region}`;
              }
            } else {
              console.log('API未返回地区信息，设置默认地区为东京');
              setDetectedRegion('tokyo');
            }
          } catch (error) {
            console.error('地区检测API调用失败:', error);
            console.log('API调用失败，设置默认地区为东京');
            setDetectedRegion('tokyo');
          }
          
          setIsDetecting(false);
        },
        (error) => {
          console.error('地理定位错误:', error.message);
          console.log('地理定位失败，设置默认地区为东京');
          setDetectedRegion('tokyo');
          setIsDetecting(false);
          
          // 根据错误类型给用户提示
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.log('用户拒绝了地理定位请求，使用默认地区东京');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('位置信息不可用，使用默认地区东京');
              break;
            case error.TIMEOUT:
              console.log('地理定位请求超时，使用默认地区东京');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分钟缓存
        }
      );
    };

    // 页面加载时自动检测位置
    detectLocation();
  }, [locale]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {/* 主页 */}
        <Link
          href={`/${locale}`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">{t('home')}</span>
        </Link>

        {/* 地区选择 */}
        <Link
          href={`/${locale}?region=${detectedRegion}`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <div className="relative">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isDetecting && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            {locationDetected && !isDetecting && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            )}
          </div>
          <span className="text-xs font-medium">
            {isDetecting ? '定位中...' : (locationDetected ? getRegionDisplayName(detectedRegion) : t('region'))}
          </span>
        </Link>

        {/* 发布商品 - 登录用户可发布，未登录显示发布引导到登录 */}
        <Link
          href={currentUser ? `/${locale}/items/new` : `/${locale}/auth/signin`}
          className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors py-2"
        >
          <div className="bg-green-500 rounded-full p-2 mb-1">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">
            {t('post')}
          </span>
        </Link>

        {/* 消息 */}
        <Link
          href={`/${locale}/messages`}
          className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium">{t('message')}</span>
        </Link>

        {/* 我的 - 个人中心/登录 */}
        {currentUser ? (
          <Link
            href={`/${locale}/users/profile`}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">{t('profile')}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}/auth/signin`}
            className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors py-2"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium text-green-600">{t('login')}</span>
          </Link>
        )}
      </div>
    </footer>
  );
}
