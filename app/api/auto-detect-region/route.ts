import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/lib/request';
import { corsEdge } from '@/lib/cors-edge';

// 通过 Nominatim API 获取市一级地理信息
async function getCityLevelInfo(latitude: number, longitude: number, locale?: string) {
  try {
    console.log('正在获取市一级位置信息...', '语言:', locale);
    
    // 根据用户语言设置Accept-Language头
    let acceptLanguage = 'en'; // 默认英文
    if (locale === 'zh') {
      acceptLanguage = 'zh-CN,zh,en';
    } else if (locale === 'ja') {
      acceptLanguage = 'ja,en';
    } else if (locale === 'en') {
      acceptLanguage = 'en';
    }
    
    console.log('使用语言参数:', acceptLanguage);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=${acceptLanguage}`,
      {
        headers: {
          'User-Agent': 'Marketplace-App/1.0 (marketplace@example.com)'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Nominatim API 调用失败:', response.status);
      return null;
    }
    
    const data = await response.json();
    const address = data.address || {};
    
    // 直接使用Nominatim API返回的对应语言的地址信息
    const state = address.state || address.region || address.province || '';
    const city = address.city || address.town || address.village || address.municipality || '';
    const country = address.country || '';
    const countryCode = address.country_code || '';
    
    // 只显示市一级信息，不显示县/省级信息
    let fullCityAddress = '';
    if (city) {
      fullCityAddress = city;  // 只显示城市名
    } else if (state) {
      fullCityAddress = state;  // 如果没有城市，显示州/省
    } else {
      // 默认值根据语言返回
      if (locale === 'en') {
        fullCityAddress = 'Tokyo';
      } else if (locale === 'ja') {
        fullCityAddress = '東京都';
      } else {
        fullCityAddress = '东京都';
      }
    }
    
    const cityInfo = {
      fullCityAddress,
      city,
      state,
      country,
      countryCode,
      coordinates: { latitude, longitude },
      rawAddress: data.display_name || '',
      addressDetails: {
        city: address.city,
        town: address.town,
        village: address.village,
        municipality: address.municipality,
        county: address.county,
        state: address.state,
        region: address.region,
        province: address.province,
        country: address.country,
        postcode: address.postcode
      }
    };
    
    console.log('市一级位置信息:', cityInfo);
    return cityInfo;
    
  } catch (error) {
    console.error('获取市一级位置信息失败:', error);
    return null;
  }
}



export async function POST(request: NextRequest) {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;

  try {
    const { latitude, longitude, locale } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '缺少位置信息' }, { status: 400 });
    }

    console.log('收到地理位置:', latitude, longitude, '语言:', locale);

    // 获取市一级地理信息
    const cityInfo = await getCityLevelInfo(latitude, longitude, locale);

    if (cityInfo) {
      return NextResponse.json({ 
        success: true,
        cityInfo,
        message: '成功获取市一级地理信息'
      });
    } else {
      // 返回默认信息（根据语言）
      let defaultCity = '';
      if (locale === 'en') {
        defaultCity = 'Tokyo';
      } else if (locale === 'ja') {
        defaultCity = '東京都';
      } else {
        defaultCity = '东京都';
      }
      
      return NextResponse.json({ 
        success: false,
        cityInfo: {
          fullCityAddress: defaultCity,
          city: '',
          state: defaultCity,
          country: locale === 'en' ? 'Japan' : '日本',
          countryCode: 'jp',
          coordinates: { latitude, longitude },
          rawAddress: '默认地区',
          addressDetails: {}
        },
        message: '无法获取位置信息，返回默认地区'
      });
    }

  } catch (error) {
    console.error('地理位置检测错误:', error);
    
    // 从请求中获取locale，或者使用默认值
    let requestLocale = 'zh'; // 默认中文
    try {
      const body = await request.json();
      requestLocale = body.locale || 'zh';
    } catch {
      // 如果无法解析body，使用默认值
    }
    
    let defaultCity = '';
    if (requestLocale === 'en') {
      defaultCity = 'Tokyo';
    } else if (requestLocale === 'ja') {
      defaultCity = '東京都';
    } else {
      defaultCity = '东京都';
    }
    
    return NextResponse.json({ 
      success: false,
      error: '地理位置检测失败',
      cityInfo: {
        fullCityAddress: defaultCity,
        city: '',
        state: defaultCity,
        country: requestLocale === 'en' ? 'Japan' : '日本',
        countryCode: 'jp',
        coordinates: { latitude: 0, longitude: 0 },
        rawAddress: '错误默认地区',
        addressDetails: {}
      },
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('lat') || '0');
    const longitude = parseFloat(searchParams.get('lng') || '0');
    const locale = searchParams.get('locale') || 'en';

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '缺少位置信息' }, { status: 400 });
    }

    console.log('收到地理位置 (GET):', latitude, longitude, '语言:', locale);

    // 获取市一级地理信息
    const cityInfo = await getCityLevelInfo(latitude, longitude, locale);

    if (cityInfo) {
      return NextResponse.json({ 
        success: true,
        cityInfo,
        message: '成功获取市一级地理信息 (GET)'
      });
    } else {
      // 返回默认信息（根据当前语言）
      let defaultCity = '';
      if (locale === 'en') {
        defaultCity = 'Tokyo';
      } else if (locale === 'ja') {
        defaultCity = '東京都';
      } else {
        defaultCity = '东京都';
      }
      
      return NextResponse.json({ 
        success: false,
        cityInfo: {
          fullCityAddress: defaultCity,
          city: '',
          state: defaultCity,
          country: locale === 'en' ? 'Japan' : '日本',
          countryCode: 'jp',
          coordinates: { latitude, longitude },
          rawAddress: '默认地区 (GET)',
          addressDetails: {}
        },
        message: '无法获取位置信息，返回默认地区 (GET)'
      });
    }

  } catch (error) {
    console.error('地理位置检测错误 (GET):', error);
    
    // 从请求参数中获取locale，或者使用默认值
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh';
    
    let defaultCity = '';
    if (locale === 'en') {
      defaultCity = 'Tokyo';
    } else if (locale === 'ja') {
      defaultCity = '東京都';
    } else {
      defaultCity = '东京都';
    }
    
    return NextResponse.json({ 
      success: false,
      error: '地理位置检测失败 (GET)',
      cityInfo: {
        fullCityAddress: defaultCity,
        city: '',
        state: defaultCity,
        country: locale === 'en' ? 'Japan' : '日本',
        countryCode: 'jp',
        coordinates: { latitude: 0, longitude: 0 },
        rawAddress: '错误默认地区 (GET)',
        addressDetails: {}
      },
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
