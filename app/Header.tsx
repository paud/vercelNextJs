"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { useCombinedAuth } from '../hooks/useCombinedAuth';
import InstallPWAButton from "@/components/InstallPWAButton";


export default function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [region, setRegion] = useState('tokyo'); // 默认东京
  const [detectedCity, setDetectedCity] = useState<string>(''); // 市级位置信息
  const [isClient, setIsClient] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [availableRegions, setAvailableRegions] = useState<any[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'region' | 'prefecture' | 'city' | 'ward'>('region');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [userSelectedRegion, setUserSelectedRegion] = useState(false); // 跟踪用户是否手动选择过地区
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 使用认证 hooks
  const { currentUser, isLoading, logout } = useCombinedAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取地区显示名称
  const getRegionDisplayName = (regionCode: string) => {
    const regionData = availableRegions.find(r => r.code === regionCode);
    if (regionData) {
      switch (locale) {
        case 'zh': return regionData.nameZh || regionData.nameEn || regionData.nameJa;
        case 'en': return regionData.nameEn || regionData.nameJa || regionData.nameZh;
        case 'ja': return regionData.nameJa || regionData.nameEn || regionData.nameZh; // 修复：添加回退逻辑
        default: return regionData.nameEn || regionData.nameJa || regionData.nameZh;
      }
    }

    // 如果数据库中没有找到，使用翻译文件的备选方案，默认显示东京
    switch (regionCode) {
      case 'osaka': return t('region_osaka');
      case 'tokyo': return t('region_tokyo');
      case 'kyoto': return t('region_kyoto');
      default: return t('region_tokyo'); // 默认显示东京
    }
  };

  // 获取地区图标颜色
  const getRegionIconColor = (regionCode: string) => {
    switch (regionCode) {
      case 'osaka': return 'text-blue-500';
      case 'tokyo': return 'text-red-500';
      case 'kyoto': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // 地理定位功能
  const detectLocation = async () => {
    setIsDetectingLocation(true);

    // 检查是否支持地理定位
    if (!navigator.geolocation) {
      console.log('Header: 浏览器不支持地理定位，设置默认地区为东京');
      setRegion('tokyo');
      setDetectedCity(t('region_tokyo'));
      setIsDetectingLocation(false);
      return;
    }

    // 获取用户位置
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Header: 用户位置:', latitude, longitude);

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
            console.log('Header: API返回数据:', data);              // 使用简化的API响应
            if (data.cityInfo) {
              const cityInfo = data.cityInfo;
              setLocationDetected(true);

              // 直接使用API返回的对应语言的地址信息
              const fullAddress = cityInfo.fullCityAddress || t('region_tokyo');

              // 提取最终的地区名称
              const finalLocationName = extractFinalLocationName(fullAddress);

              console.log('Header: 检测到的完整地址:', fullAddress);
              console.log('Header: 提取的最终地区名称:', finalLocationName);

              // 保存最终地区名称
              setDetectedCity(finalLocationName);

              // 如果仍有地区代码，保留原有逻辑
              if (data.region) {
                setRegion(data.region);
                // 更新URL参数
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('region', data.region);
                window.history.replaceState({}, '', currentUrl.toString());
              } else {
                setRegion('tokyo'); // 默认设置
              }
            } else {
              console.log('Header: API未返回市级信息，设置默认地区为东京');
              setRegion('tokyo');
              setDetectedCity(t('region_tokyo'));
            }
          } else {
            console.log('Header: API响应错误，设置默认地区为东京');
            setRegion('tokyo');
            setDetectedCity(t('region_tokyo'));
          }
        } catch (error) {
          console.error('Header: 地区检测API调用失败:', error);
          console.log('Header: API调用失败，设置默认地区为东京');
          setRegion('tokyo');
          setDetectedCity(t('region_tokyo'));
        }

        setIsDetectingLocation(false);
      },
      (error) => {
        console.error('Header: 地理定位错误:', error.message);
        console.log('Header: 地理定位失败，设置默认地区为东京');
        setRegion('tokyo');
        setDetectedCity(t('region_tokyo'));
        setIsDetectingLocation(false);

        // 根据错误类型给用户提示
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('Header: 用户拒绝了地理定位请求，使用默认地区东京');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Header: 位置信息不可用，使用默认地区东京');
            break;
          case error.TIMEOUT:
            console.log('Header: 地理定位请求超时，使用默认地区东京');
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

  // 从URL参数读取地区设置，如果没有则进行地理定位
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlRegion = searchParams.get('region');

    if (urlRegion) {
      console.log('Header: 从URL获取地区:', urlRegion);
      setRegion(urlRegion);
      setUserSelectedRegion(true); // 标记为用户选择（通过URL参数）
    } else {
      // 如果URL中没有地区参数，保持默认东京，等候Footer的定位结果
      console.log('Header: URL中无地区参数，等候Footer定位结果');
    }
  }, [pathname, userSelectedRegion]);

  // 获取可用地区列表
  useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const response = await fetch('/api/regions');
        if (response.ok) {
          const data = await response.json();
          setAvailableRegions(data.regions || []);
          console.log('Header获取到地区数据:', data.regions?.length || 0, '个');
        } else {
          console.error('Header获取地区列表失败，设置默认地区为东京');
          setRegion('tokyo');
          setDetectedCity(t('region_tokyo'));
        }
      } catch (error) {
        console.error('Header获取地区列表错误:', error);
        console.log('获取地区失败，设置默认地区为东京');
        setRegion('tokyo');
        setDetectedCity(t('region_tokyo'));
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []); // 只在组件初始化时运行一次

  // 验证当前地区是否在数据库中
  useEffect(() => {
    if (availableRegions.length > 0 && region) {
      const currentRegionExists = availableRegions.some((r: any) => r.code === region);
      if (!currentRegionExists && !userSelectedRegion) {
        console.log('当前地区不在数据库中，设置为东京');
        setRegion('tokyo');
        setDetectedCity(t('region_tokyo'));
      }
    }
  }, [availableRegions, region, userSelectedRegion]);

  // 加载树形地区数据
  const loadTreeData = async () => {
    if (treeData.length > 0) return; // 避免重复加载

    setRegionsLoading(true);
    try {
      const response = await fetch('/api/regions/tree');
      if (response.ok) {
        const data = await response.json();
        setTreeData(data.treeData || []);
        console.log('树形地区数据加载成功:', data.treeData?.length || 0, '个地区');
      } else {
        console.error('获取地区树形数据失败:', response.status);
      }
    } catch (error) {
      console.error('加载地区树形数据错误:', error);
    } finally {
      setRegionsLoading(false);
    }
  };

  // 获取多语言地区名称
  const getLocationName = (item: any) => {
    switch (locale) {
      case 'zh': return item.nameZh || item.nameEn || item.nameJa;
      case 'en': return item.nameEn || item.nameJa || item.nameZh;
      case 'ja': return item.nameJa || item.nameEn || item.nameZh; // 修复：添加回退逻辑
      default: return item.nameEn || item.nameJa || item.nameZh;
    }
  };

  // 构建选择路径显示
  const getSelectionPath = () => {
    const pathParts = [];

    if (selectedRegion) {
      pathParts.push(getLocationName(selectedRegion));
    }

    if (selectedPrefecture) {
      pathParts.push(getLocationName(selectedPrefecture));
    }

    if (selectedCity) {
      pathParts.push(getLocationName(selectedCity));
    }

    return pathParts.join(' - ');
  };

  // 提取最终地区名称（去除上级地区信息）
  const extractFinalLocationName = (fullAddress: string) => {
    // 如果地址包含分隔符，提取最后一部分
    const parts = fullAddress.split(/[-·\s]/);
    // 返回最后一个非空部分
    const finalPart = parts.filter(part => part.trim()).pop();
    return finalPart || fullAddress;
  };

  // 检查是否有子级别
  const hasSubLevels = (item: any) => {
    if (currentLevel === 'region') {
      return true; // 地区总是有都道府県
    }
    if (currentLevel === 'prefecture') {
      return true; // 都道府県总是有市区町村
    }
    if (currentLevel === 'city') {
      return item.Ward && item.Ward.length > 0; // 检查是否有区
    }
    return false;
  };

  // 处理地区选择
  const handleLocationSelect = (item: any, level: string) => {
    console.log('选择位置:', item, '级别:', level);

    if (level === 'region') {
      setSelectedRegion(item);
      setSelectedPrefecture(null);
      setSelectedCity(null);
      setSelectedPath([item.code]);
      setCurrentLevel('prefecture');
    } else if (level === 'prefecture') {
      setSelectedPrefecture(item);
      setSelectedCity(null);
      setSelectedPath([...selectedPath.slice(0, 1), item.code]);
      setCurrentLevel('city');
    } else if (level === 'city') {
      setSelectedCity(item);
      setSelectedPath([...selectedPath.slice(0, 2), item.code]);
      setCurrentLevel('ward');
    } else {
      // 最终选择，关闭弹窗并更新地区
      const fullPath = [...selectedPath.slice(0, 3), item.code];
      const locationName = getLocationName(item);
      setDetectedCity(locationName);
      setRegionMenuOpen(false);

      // 更新URL参数（使用选择的最具体位置）
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('location', fullPath.join('-'));
      window.history.replaceState({}, '', currentUrl.toString());
    }
  };

  // 处理当前级别的选择（确定按钮）
  const handleCurrentLevelSelection = () => {
    let selectedItem = null;
    let finalLocationName = ''; // 用于Header左上角显示的最终地区名称

    // 根据当前级别选择最合适的项目
    if (currentLevel === 'region') {
      // 在地区级别，必须先选择一个地区
      const currentData = getCurrentLevelData();
      if (selectedRegion) {
        selectedItem = selectedRegion;
        finalLocationName = getLocationName(selectedRegion);
      } else if (currentData.length > 0) {
        selectedItem = currentData[0];
        finalLocationName = getLocationName(selectedItem);
      }
    } else if (currentLevel === 'prefecture') {
      // 在都道府县级别
      if (selectedPrefecture) {
        selectedItem = selectedPrefecture;
        finalLocationName = getLocationName(selectedPrefecture); // 只显示都道府县名称
      } else if (selectedRegion) {
        // 如果没有选择都道府县，但有地区，选择第一个都道府县
        const currentData = getCurrentLevelData();
        if (currentData.length > 0) {
          selectedItem = currentData[0];
          finalLocationName = getLocationName(selectedItem); // 只显示都道府县名称
        } else {
          // 如果没有都道府县数据，回退到地区
          selectedItem = selectedRegion;
          finalLocationName = getLocationName(selectedRegion);
        }
      }
    } else if (currentLevel === 'city') {
      // 在市级别
      if (selectedCity) {
        selectedItem = selectedCity;
        finalLocationName = getLocationName(selectedCity); // 只显示市名称
      } else if (selectedPrefecture) {
        // 如果没有选择市，但有都道府县，选择第一个市
        const currentData = getCurrentLevelData();
        if (currentData.length > 0) {
          selectedItem = currentData[0];
          finalLocationName = getLocationName(selectedItem); // 只显示市名称
        } else {
          // 如果没有市数据，回退到都道府县
          selectedItem = selectedPrefecture;
          finalLocationName = getLocationName(selectedPrefecture);
        }
      }
    } else if (currentLevel === 'ward') {
      // 在区级别
      const currentData = getCurrentLevelData();
      if (currentData.length > 0) {
        // 如果有区数据，选择第一个区
        selectedItem = currentData[0];
        finalLocationName = getLocationName(selectedItem); // 只显示区名称
      } else if (selectedCity) {
        // 如果没有区数据，回退到市
        selectedItem = selectedCity;
        finalLocationName = getLocationName(selectedCity);
      }
    }

    if (selectedItem) {
      // 设置选中的地区显示名称（只显示最终地区名称）
      console.log('Header: 设置地区显示名称:', finalLocationName, 'selectedItem:', selectedItem);
      console.log('Header: 当前detectedCity状态:', detectedCity);

      if (finalLocationName) {
        setDetectedCity(finalLocationName);
        console.log('Header: 成功设置detectedCity为:', finalLocationName);
      } else {
        console.log('Header: finalLocationName为空，使用selectedItem的名称');
        const fallbackName = getLocationName(selectedItem);
        setDetectedCity(fallbackName);
        console.log('Header: 使用fallback设置detectedCity为:', fallbackName);
      }

      // 设置地区代码（优先使用 code，回退到 id）
      setRegion(selectedItem.code || selectedItem.id || 'tokyo');

      // 标记用户已手动选择地区
      setUserSelectedRegion(true);

      // 关闭弹窗
      setRegionMenuOpen(false);

      // 重置选择状态
      setCurrentLevel('region');
      setSelectedRegion(null);
      setSelectedPrefecture(null);
      setSelectedCity(null);
      setSelectedPath([]);

      // 更新URL参数
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('region', selectedItem.code || selectedItem.id);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newUrl);

      console.log('选择了地区:', finalLocationName, selectedItem);
    }
  };

  // 处理最终选择
  const handleFinalSelection = (item: any) => {
    // 根据当前级别构建地区路径
    let fullPath = '';
    let displayName = '';

    if (currentLevel === 'region') {
      // 选择了地区
      fullPath = getLocationName(item);
      displayName = getLocationName(item);
    } else if (currentLevel === 'prefecture') {
      // 选择了都道府县
      fullPath = `${selectedRegion ? getLocationName(selectedRegion) + '-' : ''}${getLocationName(item)}`;
      displayName = getLocationName(item);
    } else if (currentLevel === 'city') {
      // 选择了城市
      fullPath = `${selectedRegion ? getLocationName(selectedRegion) + '-' : ''}${selectedPrefecture ? getLocationName(selectedPrefecture) + '-' : ''}${getLocationName(item)}`;
      displayName = getLocationName(item);
    } else if (currentLevel === 'ward') {
      // 选择了区
      fullPath = `${selectedRegion ? getLocationName(selectedRegion) + '-' : ''}${selectedPrefecture ? getLocationName(selectedPrefecture) + '-' : ''}${selectedCity ? getLocationName(selectedCity) + '-' : ''}${getLocationName(item)}`;
      displayName = getLocationName(item);
    }

    // 更新显示的地区名称
    setRegion(item.code || 'tokyo');
    setDetectedCity(displayName);

    // 关闭弹窗
    setRegionMenuOpen(false);

    // 重置选择状态
    setCurrentLevel('region');
    setSelectedRegion(null);
    setSelectedPrefecture(null);
    setSelectedCity(null);
    setSelectedPath([]);

    // 更新URL参数
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('region', item.code || item.id || 'tokyo');
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // 处理项目点击 - 简化的单击选择逻辑
  const handleItemClick = (item: any) => {
    // 如果有子级别，则进入下一级
    if (hasSubLevels(item)) {
      handleLocationSelect(item, currentLevel);
    } else {
      // 如果没有子级别，则直接选择该项目
      handleFinalSelection(item);
    }
  };

  // 返回上一级
  const handleBackLevel = () => {
    if (currentLevel === 'prefecture') {
      setCurrentLevel('region');
      setSelectedPath([]);
    } else if (currentLevel === 'city') {
      setCurrentLevel('prefecture');
      setSelectedPath(selectedPath.slice(0, 1));
    } else if (currentLevel === 'ward') {
      setCurrentLevel('city');
      setSelectedPath(selectedPath.slice(0, 2));
    }
  };

  // 获取当前显示的数据
  const getCurrentLevelData = () => {
    if (currentLevel === 'region') {
      return treeData;
    } else if (currentLevel === 'prefecture') {
      const region = treeData.find(r => r.code === selectedPath[0]);
      return region?.prefectures || [];
    } else if (currentLevel === 'city') {
      const region = treeData.find(r => r.code === selectedPath[0]);
      const prefecture = region?.prefectures?.find((p: any) => p.code === selectedPath[1]);
      return prefecture?.cities || [];
    } else if (currentLevel === 'ward') {
      const region = treeData.find(r => r.code === selectedPath[0]);
      const prefecture = region?.prefectures?.find((p: any) => p.code === selectedPath[1]);
      const city = prefecture?.cities?.find((c: any) => c.code === selectedPath[2]);
      return [...(city?.districts || []), ...(city?.wards || [])];
    }
    return [];
  };

  // 定位结果回调函数
  const handleLocationUpdate = (locationData: { city: string, region: string, timestamp: number }) => {
    if (!userSelectedRegion) {
      console.log('Header: 接收到Footer的定位结果（回调）:', locationData);
      setDetectedCity(locationData.city);
      if (locationData.region && locationData.region !== 'tokyo') {
        setRegion(locationData.region);
      }
    }
  };

  // 注册回调函数到全局
  useEffect(() => {
    // 将回调函数挂载到window对象上，供Footer调用
    (window as any).headerLocationCallback = handleLocationUpdate;

    // 页面加载时检查localStorage中是否有定位结果
    const checkStoredLocation = () => {
      try {
        const storedLocation = localStorage.getItem('detectedLocation');
        if (storedLocation) {
          const locationData = JSON.parse(storedLocation);
          const now = Date.now();
          // 如果定位结果不超过1小时且用户未手动选择地区，则使用存储的结果
          if (now - locationData.timestamp < 3600000 && !userSelectedRegion) {
            console.log('Header: 使用存储的定位结果:', locationData);
            handleLocationUpdate(locationData);
          }
        }
      } catch (error) {
        console.error('Header: 读取存储的定位结果失败:', error);
      }
    };

    // 初始检查
    checkStoredLocation();

    // 清理函数
    return () => {
      delete (window as any).headerLocationCallback;
    };
  }, [userSelectedRegion]);


  // 处理弹出菜单的点击外部关闭
  useEffect(() => {
    function handleClickOutsideMenus(event: MouseEvent) {
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) {
        setRegionMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }

    if (regionMenuOpen || langMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenus);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenus);
    };
  }, [regionMenuOpen, langMenuOpen]);

  function handleSearch() {
    if (search.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleLocaleChange(newLocale: string) {
    setLangMenuOpen(false);
    const segments = pathname.split('/').filter(Boolean);
    if (["zh", "en", "ja"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push("/" + segments.join("/"));
  }

  function handleRegionChange(newRegion: string) {
    setRegion(newRegion);
    setRegionMenuOpen(false);
    router.push(`/${locale}?region=${newRegion}`);
  }

  // 重新启用自动定位
  const handleReEnableLocation = () => {
    console.log('Header: 用户选择重新启用自动定位');
    setUserSelectedRegion(false);
    setLocationDetected(false);
    setRegionMenuOpen(false);

    // 清除存储的定位结果
    localStorage.removeItem('detectedLocation');

    // 重置到默认状态
    setCurrentLevel('region');
    setSelectedRegion(null);
    setSelectedPrefecture(null);
    setSelectedCity(null);
    setSelectedPath([]);
    setDetectedCity('');
    setRegion('tokyo');

    // 调用Footer的重新定位函数
    if ((window as any).footerReLocationCallback) {
      (window as any).footerReLocationCallback();
    }
  };

  if (!isClient) {
    return (
      <header className="w-full bg-white shadow-md py-4 px-4">
        <div className="text-center text-gray-500">loading...</div>
      </header>
    );
  }

  return (
    <div className="w-full bg-white shadow-md py-4 px-4 app-header">
      {/* 第一行：地域、语言、用户 */}
      <div className="flex items-center justify-between w-full mb-3">
        {/* 左侧：地域选择 */}
        <div className="relative" ref={regionMenuRef}>
          <button
            onClick={() => {
              if (!regionMenuOpen) {
                loadTreeData(); // 加载树形数据
                setCurrentLevel('region'); // 重置到顶级
                setSelectedPath([]); // 清空选择路径
              }
              setRegionMenuOpen(!regionMenuOpen);
            }}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-sm"
            disabled={regionsLoading || isDetectingLocation}
          >
            <div className="relative">
              <svg className={`w-4 h-4 mr-1 ${getRegionIconColor(region)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isDetectingLocation && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              {locationDetected && !isDetectingLocation && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
            <span className="text-gray-700">
              {isDetectingLocation ? t('locating') : (regionsLoading ? t('loading') : (detectedCity || getRegionDisplayName(region)))}
            </span>
            {/* 调试信息 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-8 left-0 bg-black text-white text-xs p-1 rounded z-50">
                detectedCity: {detectedCity || 'empty'} | region: {region}
              </div>
            )}
            <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {regionMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4"
              onClick={() => setRegionMenuOpen(false)}
            >
              <div
                className="bg-white w-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 对话框头部 - 手机端优化 */}
                <div className="border-b">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {currentLevel !== 'region' && (
                        <button
                          onClick={handleBackLevel}
                          className="mr-3 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {currentLevel === 'region' && t('selectRegion')}
                        {currentLevel === 'prefecture' && t('selectPrefecture')}
                        {currentLevel === 'city' && t('selectCity')}
                        {currentLevel === 'ward' && t('selectWard')}
                      </h3>
                    </div>
                    {/* 关闭按钮 */}
                    <button
                      onClick={() => setRegionMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 选择路径显示 */}
                  {getSelectionPath() && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{getSelectionPath()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 内容区域 */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
                  {regionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-600">{t('loadingRegions')}</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      {getCurrentLevelData().length > 0 ? (
                        getCurrentLevelData().map((item: any, index: number) => (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="flex items-center justify-between w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 mb-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {getLocationName(item)}
                              </div>
                              {item.type === 'city' && item.population && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {t('population')}: {item.population.toLocaleString()}
                                </div>
                              )}
                              {item.isCapital && (
                                <div className="text-xs text-blue-600 mt-1">
                                  {t('capital')}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center">
                              {hasSubLevels(item) && (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="mb-4">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="text-gray-500 text-sm mb-2">
                              {currentLevel === 'ward' ? t('noSubdistricts') : t('noData')}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            {currentLevel === 'region' && t('selectRegionFirst')}
                            {currentLevel === 'prefecture' && t('canSelectCurrentRegion')}
                            {currentLevel === 'city' && t('canSelectCurrentPrefecture')}
                            {currentLevel === 'ward' && t('canSelectCurrentCity')}
                          </div>
                          <button
                            onClick={handleCurrentLevelSelection}
                            className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            {currentLevel === 'region' && selectedRegion && `${t('select')} ${getLocationName(selectedRegion)}`}
                            {currentLevel === 'prefecture' && selectedPrefecture && `${t('select')} ${getLocationName(selectedPrefecture)}`}
                            {currentLevel === 'city' && selectedCity && `${t('select')} ${getLocationName(selectedCity)}`}
                            {currentLevel === 'ward' && selectedCity && `${t('select')} ${getLocationName(selectedCity)}`}
                            {(!selectedRegion && !selectedPrefecture && !selectedCity) && t('selectCurrent')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 底部选定按钮 */}
                <div className="p-4 bg-gray-50 border-t space-y-2">
                  <button
                    onClick={handleCurrentLevelSelection}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    {t('select')}
                  </button>

                  {/* 重新定位按钮 */}
                  <button
                    onClick={handleReEnableLocation}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    🌍 {t('autoDetectLocation')}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 右侧：语言选择和用户功能 */}
        <div className="flex items-center space-x-3">
          {/* 语言选择 */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {locale === 'zh' && (
                <>
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.5" fill="yellow" />
                    <circle cx="10.5" cy="6.5" r="0.5" fill="yellow" />
                    <circle cx="11" cy="9" r="0.5" fill="yellow" />
                    <circle cx="10" cy="10.5" r="0.5" fill="yellow" />
                    <circle cx="8.5" cy="10" r="0.5" fill="yellow" />
                  </svg>
                  中文
                </>
              )}
              {locale === 'en' && (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#012169" />
                    <path d="M2 4l20 16M22 4L2 20" stroke="white" strokeWidth="1" />
                    <path d="M12 4v16M2 12h20" stroke="white" strokeWidth="2" />
                    <path d="M12 4v16M2 12h20" stroke="#C8102E" strokeWidth="1" />
                  </svg>
                  EN
                </>
              )}
              {locale === 'ja' && (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="white" />
                    <circle cx="12" cy="12" r="4" fill="#BC002D" />
                  </svg>
                  日本語
                </>
              )}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[120px]">
                <button
                  onClick={() => handleLocaleChange('ja')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="white" />
                    <circle cx="12" cy="12" r="4" fill="#BC002D" />
                  </svg>
                  日本語
                </button>
                <button
                  onClick={() => handleLocaleChange('en')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#012169" />
                    <path d="M12 4v16M2 12h20" stroke="white" strokeWidth="2" />
                    <path d="M12 4v16M2 12h20" stroke="#C8102E" strokeWidth="1" />
                  </svg>
                  English
                </button>
                <button
                  onClick={() => handleLocaleChange('zh')}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.5" fill="yellow" />
                  </svg>
                  中文
                </button>
              </div>
            )}
          </div>
          <InstallPWAButton />
        </div>
      </div>

      {/* 第二行：搜索栏 */}
      <div className="flex w-full items-center mb-3 space-x-2">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center min-w-[52px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
