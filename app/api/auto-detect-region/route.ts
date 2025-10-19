import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '缺少位置信息' }, { status: 400 });
    }

    console.log('收到地理位置:', latitude, longitude);

    // 从数据库获取所有地区及其对应的Prefecture数据
    const regions = await prisma.region.findMany({
      include: {
        Prefecture: {
          include: {
            City: true
          }
        }
      }
    });

    // 预定义主要城市的大致坐标范围（这些可以存储在数据库中）
    const locationRanges = [
      {
        code: 'tokyo',
        lat: { min: 35.5, max: 35.8 },
        lng: { min: 139.5, max: 139.9 }
      },
      {
        code: 'osaka', 
        lat: { min: 34.5, max: 34.8 },
        lng: { min: 135.3, max: 135.7 }
      },
      {
        code: 'kyoto',
        lat: { min: 34.9, max: 35.1 },
        lng: { min: 135.6, max: 135.9 }
      }
    ];

    // 检查用户位置是否在某个地区范围内
    for (const range of locationRanges) {
      if (
        latitude >= range.lat.min && latitude <= range.lat.max &&
        longitude >= range.lng.min && longitude <= range.lng.max
      ) {
        // 从数据库中找到对应的地区
        const detectedRegion = regions.find(r => r.code === range.code);
        if (detectedRegion) {
          console.log('检测到地区:', detectedRegion.code);
          return NextResponse.json({ 
            region: detectedRegion.code,
            regionData: {
              id: detectedRegion.id,
              code: detectedRegion.code,
              nameJa: detectedRegion.nameJa,
              nameEn: detectedRegion.nameEn,
              nameZh: detectedRegion.nameZh
            },
            coordinates: { latitude, longitude },
            detected: true
          });
        }
      }
    }

    // 如果不在预定义范围内，返回默认地区（东京）
    const defaultRegion = regions.find(r => r.code === 'tokyo');
    if (defaultRegion) {
      console.log('未在预定义范围内，返回默认地区:', defaultRegion.code);
      return NextResponse.json({ 
        region: defaultRegion.code,
        regionData: {
          id: defaultRegion.id,
          code: defaultRegion.code,
          nameJa: defaultRegion.nameJa,
          nameEn: defaultRegion.nameEn,
          nameZh: defaultRegion.nameZh
        },
        coordinates: { latitude, longitude },
        detected: false,
        nearest: true
      });
    }

    // 如果数据库中没有找到默认地区，返回错误
    return NextResponse.json({ 
      error: '未找到合适的地区',
      region: 'tokyo' // 兜底方案
    }, { status: 404 });

  } catch (error) {
    console.error('地区检测错误:', error);
    return NextResponse.json({ 
      error: '地区检测失败',
      region: 'tokyo' // 默认返回东京
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

    // 从数据库获取所有地区及其对应的Prefecture数据
    const regions = await prisma.region.findMany({
      include: {
        Prefecture: {
          include: {
            City: true
          }
        }
      }
    });

    // 预定义主要城市的大致坐标范围（这些可以存储在数据库中）
    const locationRanges = [
      {
        code: 'tokyo',
        lat: { min: 35.5, max: 35.8 },
        lng: { min: 139.5, max: 139.9 }
      },
      {
        code: 'osaka', 
        lat: { min: 34.5, max: 34.8 },
        lng: { min: 135.3, max: 135.7 }
      },
      {
        code: 'kyoto',
        lat: { min: 34.9, max: 35.1 },
        lng: { min: 135.6, max: 135.9 }
      }
    ];

    // 检查用户位置是否在某个地区范围内
    for (const range of locationRanges) {
      if (
        latitude >= range.lat.min && latitude <= range.lat.max &&
        longitude >= range.lng.min && longitude <= range.lng.max
      ) {
        // 从数据库中找到对应的地区
        const detectedRegion = regions.find(r => r.code === range.code);
        if (detectedRegion) {
          console.log('检测到地区:', detectedRegion.code);
          return NextResponse.json({ 
            region: detectedRegion.code,
            regionData: {
              id: detectedRegion.id,
              code: detectedRegion.code,
              nameJa: detectedRegion.nameJa,
              nameEn: detectedRegion.nameEn,
              nameZh: detectedRegion.nameZh
            },
            coordinates: { latitude, longitude },
            detected: true
          });
        }
      }
    }

    // 如果不在预定义范围内，返回默认地区（东京）
    const defaultRegion = regions.find(r => r.code === 'tokyo');
    if (defaultRegion) {
      console.log('未在预定义范围内，返回默认地区:', defaultRegion.code);
      return NextResponse.json({ 
        region: defaultRegion.code,
        regionData: {
          id: defaultRegion.id,
          code: defaultRegion.code,
          nameJa: defaultRegion.nameJa,
          nameEn: defaultRegion.nameEn,
          nameZh: defaultRegion.nameZh
        },
        coordinates: { latitude, longitude },
        detected: false,
        nearest: true
      });
    }

    // 如果数据库中没有找到默认地区，返回错误
    return NextResponse.json({ 
      error: '未找到合适的地区',
      region: 'tokyo' // 兜底方案
    }, { status: 404 });

  } catch (error) {
    console.error('地区检测错误:', error);
    return NextResponse.json({ 
      error: '地区检测失败',
      region: 'tokyo' // 默认返回东京
    }, { status: 500 });
  }
}
