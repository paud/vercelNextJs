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
  const [detectedCity, setDetectedCity] = useState<string>(''); // 市级位置信息
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<any[]>([]);

  // 获取地区显示名称
  const getRegionDisplayName = (region: string) => {
    // 首先尝试从数据库获取的地区数据中查找
    const regionData = availableRegions.find(r => r.code === region);
    if (regionData) {
      switch (locale) {
        case 'zh': return regionData.nameZh || regionData.nameEn || regionData.nameJa;
        case 'en': return regionData.nameEn || regionData.nameJa;
        case 'ja': return regionData.nameJa;
        default: return regionData.nameEn || regionData.nameJa;
      }
    }
    
    // 如果数据库中没有找到，使用翻译文件的备选方案
    switch (region) {
      case 'osaka': return t('region_osaka');
      case 'tokyo': return t('region_tokyo');
      case 'kyoto': return t('region_kyoto');
      default: return t('region');
    }
  };

  // 获取可用地区列表
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/regions');
        if (response.ok) {
          const data = await response.json();
          setAvailableRegions(data.regions || []);
          console.log('获取到地区数据:', data.regions?.length || 0, '个');
        } else {
          console.error('获取地区列表失败');
        }
      } catch (error) {
        console.error('获取地区列表错误:', error);
      }
    };

    fetchRegions();
  }, []);

  // 地理定位功能
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
            body: JSON.stringify({ latitude, longitude, locale }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Footer: API返回数据:', data);
            
            // 使用新的市一级信息API响应
            if (data.cityInfo) {
              const cityInfo = data.cityInfo;
              setLocationDetected(true);
              
              // 直接使用API返回的当前语言地址信息
              const displayLocation = cityInfo.fullCityAddress || 
                (locale === 'en' ? 'Tokyo' : locale === 'ja' ? '東京都' : '东京都');
              
              console.log('Footer: 检测到的市级位置:', displayLocation);
              
              // 保存市级位置信息
              setDetectedCity(displayLocation);
              
              // 将定位结果保存到 localStorage 供 Header 使用
              const locationData = {
                city: displayLocation,
                region: data.region || 'tokyo',
                timestamp: Date.now()
              };
              localStorage.setItem('detectedLocation', JSON.stringify(locationData));
              
              // 调用Header的回调函数
              if ((window as any).headerLocationCallback) {
                (window as any).headerLocationCallback(locationData);
              }
              
              // 如果仍有地区代码，保留原有逻辑
              if (data.region) {
                setDetectedRegion(data.region);
              }
              
              // 可选：自动跳转到检测到的地区
              // window.location.href = `/${locale}?region=${data.region}`;
            } else {
              console.log('Footer: API未返回市级信息，设置默认地区为东京');
              setDetectedRegion('tokyo');
            }
          } else {
            console.log('API响应错误，设置默认地区为东京');
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

  useEffect(() => {
    // 页面加载时自动检测位置
    detectLocation();
  }, [locale]);

  // 注册重新定位回调函数
  useEffect(() => {
    const handleReLocationRequest = () => {
      console.log('Footer: 接收到重新定位请求（回调）');
      // 重置状态并重新开始定位
      setIsDetecting(false);
      setLocationDetected(false);
      setDetectedCity('');
      setDetectedRegion('tokyo');
      
      // 开始新的定位流程
      setTimeout(() => {
        detectLocation();
      }, 100);
    };

    // 将重新定位函数挂载到window对象上
    (window as any).footerReLocationCallback = handleReLocationRequest;
    
    return () => {
      delete (window as any).footerReLocationCallback;
    };
  }, []);

  useEffect(() => {
    // 调试 currentUser 变化
    console.log('Footer: currentUser 变化', currentUser);
  }, [currentUser]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50 rounded-t-xl app-footer px-1 sm:px-4 max-w-md mx-auto"
      style={{
        maxWidth: '100vw',
        minHeight: '56px',
        boxShadow: '0 -2px 12px 0 rgba(0,0,0,0.06)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div className="flex items-center justify-between py-1 px-1 gap-1">
        {/* 主页 */}
        <Link
          href={`/${locale}`}
          className="flex flex-col items-center flex-1 text-gray-700 hover:text-blue-600 transition-colors py-1 min-w-0"
          style={{ minWidth: 0 }}
        >
          <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[11px] font-medium truncate w-full text-center">{t('home')}</span>
        </Link>

        {/* 地区选择 */}
        <Link
          href={`/${locale}?region=${detectedRegion}`}
          className="flex flex-col items-center flex-1 text-gray-700 hover:text-blue-600 transition-colors py-1 min-w-0"
          style={{ minWidth: 0 }}
        >
          <div className="relative">
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isDetecting && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            {locationDetected && !isDetecting && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            )}
          </div>
          <span className="text-[11px] font-medium truncate w-full text-center">
            {isDetecting ? t('locating') : (detectedCity || getRegionDisplayName(detectedRegion))}
          </span>
        </Link>

        {/* 发布商品 - 登录用户可发布，未登录显示发布引导到登录 */}
        <Link
          href={currentUser ? `/${locale}/items/new` : `/${locale}/auth/signin`}
          className="flex flex-col items-center flex-1 text-gray-700 hover:text-green-600 transition-colors py-1 min-w-0"
          style={{ minWidth: 0 }}
        >
          <div className="bg-green-500 rounded-full p-1.5 mb-0.5 flex items-center justify-center" style={{ boxShadow: '0 2px 8px 0 rgba(16,185,129,0.10)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-green-600 truncate w-full text-center">
            {t('post')}
          </span>
        </Link>

        {/* 消息 */}
        <Link
          href={`/${locale}/messages`}
          className="flex flex-col items-center flex-1 text-gray-700 hover:text-blue-600 transition-colors py-1 min-w-0"
          style={{ minWidth: 0 }}
        >
          <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[11px] font-medium truncate w-full text-center">{t('message')}</span>
        </Link>

        {/* 我的 - 个人中心/登录 */}
       
          <Link
            href={`/${locale}/users/profile`}
            className="flex flex-col items-center flex-1 text-gray-700 hover:text-blue-600 transition-colors py-1 min-w-0"
            style={{ minWidth: 0 }}
          >
            <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium truncate w-full text-center">{t('profile')}</span>
          </Link>

      </div>
    </footer>
  );
}
