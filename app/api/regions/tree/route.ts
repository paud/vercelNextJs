import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 获取完整的地区树形结构
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        code: true,
        nameJa: true,
        nameEn: true,
        nameZh: true,
        description: true,
        Prefecture: {
          select: {
            id: true,
            code: true,
            nameJa: true,
            nameEn: true,
            nameZh: true,
            type: true,
            capital: true,
            City: {
              select: {
                id: true,
                code: true,
                nameJa: true,
                nameEn: true,
                nameZh: true,
                type: true,
                level: true,
                isCapital: true,
                population: true,
                District: {
                  select: {
                    id: true,
                    code: true,
                    nameJa: true,
                    nameEn: true,
                    nameZh: true,
                    population: true
                  },
                  orderBy: {
                    nameJa: 'asc'
                  }
                },
                Ward: {
                  select: {
                    id: true,
                    code: true,
                    nameJa: true,
                    nameEn: true,
                    nameZh: true,
                    type: true,
                    population: true
                  },
                  orderBy: {
                    nameJa: 'asc'
                  }
                }
              },
              orderBy: [
                { isCapital: 'desc' }, // 首府城市排在前面
                { population: 'desc' }, // 按人口排序
                { nameJa: 'asc' }
              ]
            }
          },
          orderBy: {
            nameJa: 'asc'
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    // 构建用于移动端显示的扁平化结构，同时保持层级信息
    const treeData = regions.map((region: any) => ({
      id: region.id,
      code: region.code,
      nameJa: region.nameJa,
      nameEn: region.nameEn,
      nameZh: region.nameZh,
      description: region.description,
      type: 'region',
      level: 0,
      prefectures: region.Prefecture.map((prefecture: any) => ({
        id: prefecture.id,
        code: prefecture.code,
        nameJa: prefecture.nameJa,
        nameEn: prefecture.nameEn,
        nameZh: prefecture.nameZh,
        type: 'prefecture',
        level: 1,
        parentId: region.id,
        parentCode: region.code,
        cities: prefecture.City.map((city: any) => ({
          id: city.id,
          code: city.code,
          nameJa: city.nameJa,
          nameEn: city.nameEn,
          nameZh: city.nameZh,
          type: 'city',
          level: 2,
          isCapital: city.isCapital,
          population: city.population,
          parentId: prefecture.id,
          parentCode: prefecture.code,
          districts: city.District.map((district: any) => ({
            id: district.id,
            code: district.code,
            nameJa: district.nameJa,
            nameEn: district.nameEn,
            nameZh: district.nameZh,
            type: 'district',
            level: 3,
            population: district.population,
            parentId: city.id,
            parentCode: city.code
          })),
          wards: city.Ward.map((ward: any) => ({
            id: ward.id,
            code: ward.code,
            nameJa: ward.nameJa,
            nameEn: ward.nameEn,
            nameZh: ward.nameZh,
            type: 'ward',
            level: 3,
            population: ward.population,
            parentId: city.id,
            parentCode: city.code
          }))
        }))
      }))
    }));

    return NextResponse.json({ 
      treeData,
      count: regions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取地区树形结构错误:', error);
    return NextResponse.json({ 
      error: '获取地区树形结构失败',
      treeData: []
    }, { status: 500 });
  }
}
