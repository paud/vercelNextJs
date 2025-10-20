import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedHiroshima() {
  // 中国地方 Region
  const region = await prisma.region.upsert({
    where: { code: 'chugoku' },
    update: {},
    create: {
      code: 'chugoku',
      nameJa: '中国地方',
      nameEn: 'Chugoku',
      nameZh: '中国地区',
      description: '日本本州西部地区，包括广岛县等',
    },
  });

  // 广岛县 Prefecture
  const prefecture = await prisma.prefecture.upsert({
    where: { code: 'hiroshima' },
    update: {},
    create: {
      code: 'hiroshima',
      nameJa: '広島県',
      nameEn: 'Hiroshima',
      nameZh: '广岛县',
      regionId: region.id,
      type: 'prefecture',
      capital: '広島市',
      postalCode: '730-8511',
    },
  });

  // 广岛市 City
  const city = await prisma.city.upsert({
    where: { code: 'hiroshima-shi' },
    update: {},
    create: {
      code: 'hiroshima-shi',
      nameJa: '広島市',
      nameEn: 'Hiroshima City',
      nameZh: '广岛市',
      type: 'city',
      level: 'city',
      prefectureId: prefecture.id,
      isCapital: true,
    },
  });

  // 广岛市各区（Ward）及邮编
  const wards = [
    { code: 'naka', nameJa: '中区', nameEn: 'Naka Ward', nameZh: '中区', postalCode: '730-0011' },
    { code: 'higashi', nameJa: '東区', nameEn: 'Higashi Ward', nameZh: '东区', postalCode: '732-0052' },
    { code: 'minami', nameJa: '南区', nameEn: 'Minami Ward', nameZh: '南区', postalCode: '734-0007' },
    { code: 'nishi', nameJa: '西区', nameEn: 'Nishi Ward', nameZh: '西区', postalCode: '733-0011' },
    { code: 'asaminami', nameJa: '安佐南区', nameEn: 'Asaminami Ward', nameZh: '安佐南区', postalCode: '731-0122' },
    { code: 'asakita', nameJa: '安佐北区', nameEn: 'Asakita Ward', nameZh: '安佐北区', postalCode: '731-0211' },
    { code: 'aki', nameJa: '安芸区', nameEn: 'Aki Ward', nameZh: '安艺区', postalCode: '736-0082' },
    { code: 'saeki', nameJa: '佐伯区', nameEn: 'Saeki Ward', nameZh: '佐伯区', postalCode: '731-5102' },
  ];

  for (const ward of wards) {
    await prisma.ward.upsert({
      where: { code: ward.code },
      update: {},
      create: {
        code: ward.code,
        nameJa: ward.nameJa,
        nameEn: ward.nameEn,
        nameZh: ward.nameZh,
        type: 'ward',
        cityId: city.id,
        postalCode: ward.postalCode,
      },
    });
  }

  // 广岛县下属所有市、区、町、村及邮编
  const hiroshimaSubCities = [
    { code: 'fukuyama-shi', nameJa: '福山市', nameEn: 'Fukuyama City', nameZh: '福山市', type: 'city', postalCode: '720-8501' },
    { code: 'kure-shi', nameJa: '呉市', nameEn: 'Kure City', nameZh: '吴市', type: 'city', postalCode: '737-8501' },
    { code: 'onomichi-shi', nameJa: '尾道市', nameEn: 'Onomichi City', nameZh: '尾道市', type: 'city', postalCode: '722-8501' },
    { code: 'mihara-shi', nameJa: '三原市', nameEn: 'Mihara City', nameZh: '三原市', type: 'city', postalCode: '723-8601' },
    { code: 'higashihiroshima-shi', nameJa: '東広島市', nameEn: 'Higashihiroshima City', nameZh: '东广岛市', type: 'city', postalCode: '739-8601' },
    { code: 'miyoshi-shi', nameJa: '三次市', nameEn: 'Miyoshi City', nameZh: '三次市', type: 'city', postalCode: '728-8501' },
    { code: 'shobara-shi', nameJa: '庄原市', nameEn: 'Shobara City', nameZh: '庄原市', type: 'city', postalCode: '727-8501' },
    { code: 'otake-shi', nameJa: '大竹市', nameEn: 'Otake City', nameZh: '大竹市', type: 'city', postalCode: '739-0692' },
    { code: 'takehara-shi', nameJa: '竹原市', nameEn: 'Takehara City', nameZh: '竹原市', type: 'city', postalCode: '725-8666' },
    { code: 'fuchu-shi', nameJa: '府中市', nameEn: 'Fuchu City', nameZh: '府中市', type: 'city', postalCode: '726-8601' },
    { code: 'akitsu-cho', nameJa: '安芸津町', nameEn: 'Akitsu Town', nameZh: '安艺津町', type: 'town', postalCode: '739-2402' },
    { code: 'jinsekikogen-cho', nameJa: '神石高原町', nameEn: 'Jinsekikogen Town', nameZh: '神石高原町', type: 'town', postalCode: '720-1522' },
    { code: 'saka-cho', nameJa: '坂町', nameEn: 'Saka Town', nameZh: '坂町', type: 'town', postalCode: '731-4392' },
    { code: 'kumano-cho', nameJa: '熊野町', nameEn: 'Kumano Town', nameZh: '熊野町', type: 'town', postalCode: '731-4292' },
    { code: 'otake-machi', nameJa: '大竹町', nameEn: 'Otake Town', nameZh: '大竹町', type: 'town', postalCode: '739-0692' },
    { code: 'sera-cho', nameJa: '世羅町', nameEn: 'Sera Town', nameZh: '世罗町', type: 'town', postalCode: '722-1112' },
    { code: 'akita-mura', nameJa: '秋田村', nameEn: 'Akita Village', nameZh: '秋田村', type: 'village', postalCode: '729-3301' },
    // 可继续补充更多町/村
  ];

  for (const subCity of hiroshimaSubCities) {
    await prisma.city.upsert({
      where: { code: subCity.code },
      update: {},
      create: {
        code: subCity.code,
        nameJa: subCity.nameJa,
        nameEn: subCity.nameEn,
        nameZh: subCity.nameZh,
        type: subCity.type,
        level: subCity.type === 'city' ? 'city' : subCity.type,
        prefectureId: prefecture.id,
        postalCode: subCity.postalCode,
      },
    });
  }

  // 广岛县所有市町村及主要邮编（2025最新行政区划）
  const hiroshimaAllCitiesTownsVillages = [
    // 市（14个）
    { code: 'hiroshima-shi', nameJa: '広島市', nameEn: 'Hiroshima City', nameZh: '广岛市', type: 'city', postalCode: '730-8511' },
    { code: 'fukuyama-shi', nameJa: '福山市', nameEn: 'Fukuyama City', nameZh: '福山市', type: 'city', postalCode: '720-8501' },
    { code: 'kure-shi', nameJa: '呉市', nameEn: 'Kure City', nameZh: '吴市', type: 'city', postalCode: '737-8501' },
    { code: 'onomichi-shi', nameJa: '尾道市', nameEn: 'Onomichi City', nameZh: '尾道市', type: 'city', postalCode: '722-8501' },
    { code: 'mihara-shi', nameJa: '三原市', nameEn: 'Mihara City', nameZh: '三原市', type: 'city', postalCode: '723-8601' },
    { code: 'higashihiroshima-shi', nameJa: '東広島市', nameEn: 'Higashihiroshima City', nameZh: '东广岛市', type: 'city', postalCode: '739-8601' },
    { code: 'miyoshi-shi', nameJa: '三次市', nameEn: 'Miyoshi City', nameZh: '三次市', type: 'city', postalCode: '728-8501' },
    { code: 'shobara-shi', nameJa: '庄原市', nameEn: 'Shobara City', nameZh: '庄原市', type: 'city', postalCode: '727-8501' },
    { code: 'otake-shi', nameJa: '大竹市', nameEn: 'Otake City', nameZh: '大竹市', type: 'city', postalCode: '739-0692' },
    { code: 'takehara-shi', nameJa: '竹原市', nameEn: 'Takehara City', nameZh: '竹原市', type: 'city', postalCode: '725-8666' },
    { code: 'fuchu-shi', nameJa: '府中市', nameEn: 'Fuchu City', nameZh: '府中市', type: 'city', postalCode: '726-8601' },
    { code: 'etajima-shi', nameJa: '江田島市', nameEn: 'Etajima City', nameZh: '江田岛市', type: 'city', postalCode: '737-2392' },
    { code: 'akiyoshi-shi', nameJa: '安芸高田市', nameEn: 'Akitakata City', nameZh: '安艺高田市', type: 'city', postalCode: '739-1201' },
    { code: 'kitahiroshima-shi', nameJa: '北広島町', nameEn: 'Kitahiroshima Town', nameZh: '北广岛町', type: 'town', postalCode: '731-1595' },
    // 町（9个）
    { code: 'jinsekikogen-cho', nameJa: '神石高原町', nameEn: 'Jinsekikogen Town', nameZh: '神石高原町', type: 'town', postalCode: '720-1522' },
    { code: 'sera-cho', nameJa: '世羅町', nameEn: 'Sera Town', nameZh: '世罗町', type: 'town', postalCode: '722-1112' },
    { code: 'kumano-cho', nameJa: '熊野町', nameEn: 'Kumano Town', nameZh: '熊野町', type: 'town', postalCode: '731-4292' },
    { code: 'saka-cho', nameJa: '坂町', nameEn: 'Saka Town', nameZh: '坂町', type: 'town', postalCode: '731-4392' },
    { code: 'akitsu-cho', nameJa: '安芸津町', nameEn: 'Akitsu Town', nameZh: '安艺津町', type: 'town', postalCode: '739-2402' },
    { code: 'otake-machi', nameJa: '大竹町', nameEn: 'Otake Town', nameZh: '大竹町', type: 'town', postalCode: '739-0692' },
    { code: 'fuchu-machi', nameJa: '府中町', nameEn: 'Fuchu Town', nameZh: '府中町', type: 'town', postalCode: '735-8588' },
    { code: 'kaita-cho', nameJa: '海田町', nameEn: 'Kaita Town', nameZh: '海田町', type: 'town', postalCode: '736-8601' },
    { code: 'hatsukaichi-shi', nameJa: '廿日市市', nameEn: 'Hatsukaichi City', nameZh: '廿日市市', type: 'city', postalCode: '738-8501' },
    // 村（1个）
    { code: 'akita-mura', nameJa: '秋田村', nameEn: 'Akita Village', nameZh: '秋田村', type: 'village', postalCode: '729-3301' },
  ];

  for (const sub of hiroshimaAllCitiesTownsVillages) {
    await prisma.city.upsert({
      where: { code: sub.code },
      update: {},
      create: {
        code: sub.code,
        nameJa: sub.nameJa,
        nameEn: sub.nameEn,
        nameZh: sub.nameZh,
        type: sub.type,
        level: sub.type === 'city' ? 'city' : sub.type,
        prefectureId: prefecture.id,
        postalCode: sub.postalCode,
      },
    });
  }

  // 福山市下所有区（行政区划，部分为代表性地区/旧町名，福山市为政令指定市无法定区，以下为主要地区示例）
  const fukuyamaWards = [
    { code: 'fukuyama-chuo', nameJa: '中央地区', nameEn: 'Chuo Area', nameZh: '中央地区', postalCode: '720-0067' },
    { code: 'fukuyama-minami', nameJa: '南地区', nameEn: 'Minami Area', nameZh: '南地区', postalCode: '720-0831' },
    { code: 'fukuyama-kita', nameJa: '北地区', nameEn: 'Kita Area', nameZh: '北地区', postalCode: '720-0081' },
    { code: 'fukuyama-higashi', nameJa: '東地区', nameEn: 'Higashi Area', nameZh: '东地区', postalCode: '721-0965' },
    { code: 'fukuyama-nishi', nameJa: '西地区', nameEn: 'Nishi Area', nameZh: '西地区', postalCode: '720-0824' },
    { code: 'fukuyama-matsunaga', nameJa: '松永地区', nameEn: 'Matsunaga Area', nameZh: '松永地区', postalCode: '729-0104' },
    { code: 'fukuyama-innoshima', nameJa: '因島地区', nameEn: 'Innoshima Area', nameZh: '因岛地区', postalCode: '722-2323' },
    { code: 'fukuyama-tomochou', nameJa: '鞆町', nameEn: 'Tomochou', nameZh: '鞆町', postalCode: '720-0201' },
    { code: 'fukuyama-echizen', nameJa: '駅家町', nameEn: 'Ekiya Town', nameZh: '駅家町', postalCode: '720-1131' },
    { code: 'fukuyama-kannabe', nameJa: '神辺町', nameEn: 'Kannabe Town', nameZh: '神辺町', postalCode: '720-2104' },
    { code: 'fukuyama-ashida', nameJa: '芦田町', nameEn: 'Ashida Town', nameZh: '芦田町', postalCode: '720-0401' },
    { code: 'fukuyama-omi', nameJa: '大门町', nameEn: 'Omi Town', nameZh: '大门町', postalCode: '721-0925' },
    // 可继续补充更多地区
  ];

  // 查询福山市 cityId
  const fukuyamaCity = await prisma.city.findUnique({ where: { code: 'fukuyama-shi' } });
  if (fukuyamaCity) {
    for (const ward of fukuyamaWards) {
      await prisma.ward.upsert({
        where: { code: ward.code },
        update: {},
        create: {
          code: ward.code,
          nameJa: ward.nameJa,
          nameEn: ward.nameEn,
          nameZh: ward.nameZh,
          type: 'ward',
          cityId: fukuyamaCity.id,
          postalCode: ward.postalCode,
        },
      });
    }
  }

  // 福山市所有法定町及主要地区（2025最新行政区划，含旧町村合并区域）
  const fukuyamaAllAreas = [
    { code: 'fukuyama-chuo', nameJa: '中央地区', nameEn: 'Chuo Area', nameZh: '中央地区', postalCode: '720-0067' },
    { code: 'fukuyama-minami', nameJa: '南地区', nameEn: 'Minami Area', nameZh: '南地区', postalCode: '720-0831' },
    { code: 'fukuyama-kita', nameJa: '北地区', nameEn: 'Kita Area', nameZh: '北地区', postalCode: '720-0081' },
    { code: 'fukuyama-higashi', nameJa: '東地区', nameEn: 'Higashi Area', nameZh: '东地区', postalCode: '721-0965' },
    { code: 'fukuyama-nishi', nameJa: '西地区', nameEn: 'Nishi Area', nameZh: '西地区', postalCode: '720-0824' },
    { code: 'matsunaga-cho', nameJa: '松永町', nameEn: 'Matsunaga Town', nameZh: '松永町', postalCode: '729-0104' },
    { code: 'innoshima-cho', nameJa: '因島町', nameEn: 'Innoshima Town', nameZh: '因岛町', postalCode: '722-2323' },
    { code: 'tomochou', nameJa: '鞆町', nameEn: 'Tomo Town', nameZh: '鞆町', postalCode: '720-0201' },
    { code: 'ekiya-cho', nameJa: '駅家町', nameEn: 'Ekiya Town', nameZh: '駅家町', postalCode: '720-1131' },
    { code: 'kannabe-cho', nameJa: '神辺町', nameEn: 'Kannabe Town', nameZh: '神边町', postalCode: '720-2104' },
    { code: 'ashida-cho', nameJa: '芦田町', nameEn: 'Ashida Town', nameZh: '芦田町', postalCode: '720-0401' },
    { code: 'omi-cho', nameJa: '大门町', nameEn: 'Omi Town', nameZh: '大门町', postalCode: '721-0925' },
    { code: 'hongo-cho', nameJa: '本郷町', nameEn: 'Hongo Town', nameZh: '本郷町', postalCode: '729-0252' },
    { code: 'yoshizu-cho', nameJa: '吉津町', nameEn: 'Yoshizu Town', nameZh: '吉津町', postalCode: '720-0032' },
    { code: 'kamo-cho', nameJa: '加茂町', nameEn: 'Kamo Town', nameZh: '加茂町', postalCode: '720-2412' },
    { code: 'kumano-cho', nameJa: '熊野町', nameEn: 'Kumano Town', nameZh: '熊野町', postalCode: '720-2411' },
    { code: 'yano-cho', nameJa: '矢野町', nameEn: 'Yano Town', nameZh: '矢野町', postalCode: '720-2413' },
    { code: 'yokoo-cho', nameJa: '横尾町', nameEn: 'Yokoo Town', nameZh: '横尾町', postalCode: '720-0011' },
    { code: 'tsunogou-cho', nameJa: '津之郷町', nameEn: 'Tsunogou Town', nameZh: '津之郷町', postalCode: '720-0835' },
    { code: 'higashisakuramachi', nameJa: '東桜町', nameEn: 'Higashi Sakuramachi', nameZh: '东樱町', postalCode: '720-0065' },
    { code: 'kitayoshizu-cho', nameJa: '北吉津町', nameEn: 'Kitayoshizu Town', nameZh: '北吉津町', postalCode: '720-0022' },
    // 可继续补充所有法定町名、旧村名、主要地名
  ];

  // 查询福山市 cityId
  const fukuyamaCityFull = await prisma.city.findUnique({ where: { code: 'fukuyama-shi' } });
  if (fukuyamaCityFull) {
    for (const area of fukuyamaAllAreas) {
      await prisma.ward.upsert({
        where: { code: area.code },
        update: {},
        create: {
          code: area.code,
          nameJa: area.nameJa,
          nameEn: area.nameEn,
          nameZh: area.nameZh,
          type: 'ward',
          cityId: fukuyamaCityFull.id,
          postalCode: area.postalCode,
        },
      });
    }
  }
}

async function main() {
  console.log("🚀 开始数据库种子数据插入...");

  // 清空数据表，避免唯一约束冲突
  console.log("🗑️  清理现有数据...");
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👥 创建测试用户...");
  
  // 创建用户数据 - 使用最基本的字段
  const alice = await prisma.user.create({
    data: { 
      email: "alice@example.com", 
      name: "Alice Johnson"
    }
  });

  const bob = await prisma.user.create({
    data: { 
      email: "bob@example.com", 
      name: "Bob Smith"
    }
  });

  const charlie = await prisma.user.create({
    data: { 
      email: "charlie@example.com", 
      name: "Charlie Brown"
    }
  });

  const diana = await prisma.user.create({
    data: { 
      email: "diana@example.com", 
      name: "Diana Prince"
    }
  });

  const edward = await prisma.user.create({
    data: { 
      email: "edward@example.com", 
      name: "Edward Chen"
    }
  });

  console.log(`✅ 创建了 5 个用户`);

  console.log("📦 创建测试商品...");

  // 创建商品数据
  const items = [
    // Alice的商品
    {
      title: "二手iPhone 12 Pro",
      description: "成色很好，电池健康度90%，无维修记录。包装盒、充电器齐全。",
      price: 3200,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
      sellerId: alice.id,
    },
    {
      title: "小米空气净化器 Pro",
      description: "家用，几乎全新，带原包装和滤芯。静音效果好。",
      price: 400,
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
      sellerId: alice.id,
    },
    {
      title: "MacBook Air M1",
      description: "13英寸，8GB内存，256GB存储。轻微使用痕迹。",
      price: 6500,
      imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
      sellerId: alice.id,
    },

    // Bob的商品
    {
      title: "二手山地自行车",
      description: "适合城市骑行，刹车灵敏，变速器正常。",
      price: 800,
      imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop",
      sellerId: bob.id,
    },
    {
      title: "Kindle Paperwhite 11代",
      description: "屏幕无划痕，送保护套和数据线。",
      price: 500,
      imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
      sellerId: bob.id,
    },
    {
      title: "Sony WH-1000XM4 降噪耳机",
      description: "音质出色，降噪效果佳，有轻微使用痕迹。",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      sellerId: bob.id,
    },

    // Charlie的商品
    {
      title: "Dell 27寸 4K显示器",
      description: "无坏点，色彩准确，适合设计工作。",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
      sellerId: charlie.id,
    },
    {
      title: "Yamaha 民谣吉他",
      description: "音色温润，适合初学者和进阶者。",
      price: 800,
      imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=300&fit=crop",
      sellerId: charlie.id,
    },
    {
      title: "Nintendo Switch OLED",
      description: "屏幕鲜艳，手感良好，送几个游戏卡带。",
      price: 2200,
      imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
      sellerId: charlie.id,
    },

    // Diana的商品
    {
      title: "Panasonic 微波炉",
      description: "加热均匀，外观完好，功能正常。",
      price: 300,
      imageUrl: "https://images.unsplash.com/photo-1585515656915-b4c1a5ec51c0?w=400&h=300&fit=crop",
      sellerId: diana.id,
    },
    {
      title: "专业滑板",
      description: "轮子顺滑，板面无损，适合街式滑板。",
      price: 350,
      imageUrl: "https://images.unsplash.com/photo-1572776685600-aca8c3456337?w=400&h=300&fit=crop",
      sellerId: diana.id,
    },
    {
      title: "Dyson V8 吸尘器",
      description: "吸力强劲，配件齐全，电池续航良好。",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      sellerId: diana.id,
    },

    // Edward的商品
    {
      title: "AirPods Pro 2代",
      description: "降噪效果出色，充电盒无划痕。",
      price: 1300,
      imageUrl: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=400&h=300&fit=crop",
      sellerId: edward.id,
    },
    {
      title: "飞利浦护眼台灯",
      description: "无蓝光，亮度可调，保护视力。",
      price: 200,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
      sellerId: edward.id,
    },
    {
      title: "iPad Air 第5代",
      description: "64GB WiFi版，屏幕无划痕，送钢化膜。",
      price: 3800,
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      sellerId: edward.id,
    },
  ];

  // 批量创建商品
  await prisma.item.createMany({
    data: items
  });

  console.log(`✅ 创建了 ${items.length} 个商品`);
  console.log("🎉 种子数据插入完成!");
  
  // 显示统计信息
  const userCount = await prisma.user.count();
  const itemCount = await prisma.item.count();
  
  console.log(`📊 数据库统计: ${userCount} 个用户, ${itemCount} 个商品`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 种子数据插入失败:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
