import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/lib/request';

// 通过 Nominatim API 获取地理位置信息
async function getLocationInfo(latitude: number, longitude: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=zh-CN,en`;
    
    console.log('调用 Nominatim API:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NextJS-App/1.0 (location-service)'
      }
    });
    
    if (!response.ok) {
      console.error('Nominatim API 调用失败:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Nominatim API 返回:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('获取位置信息失败:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '缺少位置信息' }, { status: 400 });
    }

    console.log('收到地理位置:', latitude, longitude);

    // 通过在线地理位置服务获取位置信息
    const locationInfo = await getLocationInfo(latitude, longitude);

    // 直接返回市一级的地理位置信息
    if (locationInfo && locationInfo.address) {
      const address = locationInfo.address;
      const cityName = address.city || address.town || address.village || address.municipality || '未知城市';
      const stateName = address.state || address.region || address.province || '';
      const countryName = address.country || '';
      const countryCode = address.country_code || '';
      
      console.log('检测到位置:', {
        city: cityName,
        state: stateName,
        country: countryName,
        country_code: countryCode
      });

      return NextResponse.json({ 
        city: cityName,
        state: stateName,
        country: countryName,
        country_code: countryCode,
        fullAddress: locationInfo.display_name,
        locationDetails: {
          city: address.city,
          town: address.town,
          village: address.village,
          municipality: address.municipality,
          county: address.county,
          state: address.state,
          region: address.region,
          province: address.province,
          country: address.country,
          country_code: address.country_code,
          postcode: address.postcode,
          neighbourhood: address.neighbourhood,
          suburb: address.suburb,
          district: address.district
        },
        coordinates: { latitude, longitude },
        source: 'nominatim',
        detected: true
      });
    }

    // 如果无法获取位置信息，返回错误
    return NextResponse.json({ 
      error: '无法获取位置信息',
      message: '地理位置服务返回的数据不完整',
      coordinates: { latitude, longitude }
    }, { status: 404 });

  } catch (error) {
    console.error('地理位置检测错误:', error);
    return NextResponse.json({ 
      error: '地理位置检测失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('lat') || '0');
    const longitude = parseFloat(searchParams.get('lng') || '0');

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '缺少位置信息' }, { status: 400 });
    }

    console.log('收到地理位置 (GET):', latitude, longitude);

    // 通过在线地理位置服务获取位置信息
    const locationInfo = await getLocationInfo(latitude, longitude);

    // 直接返回市一级的地理位置信息
    if (locationInfo && locationInfo.address) {
      const address = locationInfo.address;
      const cityName = address.city || address.town || address.village || address.municipality || '未知城市';
      const stateName = address.state || address.region || address.province || '';
      const countryName = address.country || '';
      const countryCode = address.country_code || '';
      
      console.log('检测到位置 (GET):', {
        city: cityName,
        state: stateName,
        country: countryName,
        country_code: countryCode
      });

      return NextResponse.json({ 
        city: cityName,
        state: stateName,
        country: countryName,
        country_code: countryCode,
        fullAddress: locationInfo.display_name,
        locationDetails: {
          city: address.city,
          town: address.town,
          village: address.village,
          municipality: address.municipality,
          county: address.county,
          state: address.state,
          region: address.region,
          province: address.province,
          country: address.country,
          country_code: address.country_code,
          postcode: address.postcode,
          neighbourhood: address.neighbourhood,
          suburb: address.suburb,
          district: address.district
        },
        coordinates: { latitude, longitude },
        source: 'nominatim',
        detected: true
      });
    }

    // 如果无法获取位置信息，返回错误
    return NextResponse.json({ 
      error: '无法获取位置信息',
      message: '地理位置服务返回的数据不完整',
      coordinates: { latitude, longitude }
    }, { status: 404 });

  } catch (error) {
    console.error('地理位置检测错误 (GET):', error);
    return NextResponse.json({ 
      error: '地理位置检测失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
