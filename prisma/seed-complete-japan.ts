import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始完整的日本行政区划数据填充...')

  // 清理现有数据（仅在需要重置时取消注释）
  // console.log('🧹 清理现有数据...')
  // await prisma.item.deleteMany()
  // await prisma.account.deleteMany()
  // await prisma.session.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.ward.deleteMany()
  // await prisma.district.deleteMany()
  // await prisma.city.deleteMany()
  // await prisma.prefecture.deleteMany()
  // await prisma.region.deleteMany()

  // 1. 创建日本八大地方区划数据
  console.log('🗾 创建八大地方区划数据...')
  
  const regions = [
    { 
      code: 'hokkaido', 
      nameJa: '北海道地方', 
      nameEn: 'Hokkaido', 
      nameZh: '北海道地方', 
      description: '日本最北部的地方，以雪景和海鲜闻名',
      area: 83424.0,
      population: 5200000
    },
    { 
      code: 'tohoku', 
      nameJa: '東北地方', 
      nameEn: 'Tohoku', 
      nameZh: '东北地方', 
      description: '本州东北部地方，农业发达，温泉众多',
      area: 66956.0,
      population: 8800000
    },
    { 
      code: 'kanto', 
      nameJa: '関東地方', 
      nameEn: 'Kanto', 
      nameZh: '关东地方', 
      description: '首都圈所在地方，日本政治经济中心',
      area: 32424.0,
      population: 43500000
    },
    { 
      code: 'chubu', 
      nameJa: '中部地方', 
      nameEn: 'Chubu', 
      nameZh: '中部地方', 
      description: '本州中部地方，制造业发达，富士山所在地',
      area: 66950.0,
      population: 21700000
    },
    { 
      code: 'kansai', 
      nameJa: '関西地方', 
      nameEn: 'Kansai', 
      nameZh: '关西地方', 
      description: '近畿地方，古都文化圈，商业繁荣',
      area: 33108.0,
      population: 22500000
    },
    { 
      code: 'chugoku', 
      nameJa: '中国地方', 
      nameEn: 'Chugoku', 
      nameZh: '中国地方', 
      description: '本州西部地方，濑户内海沿岸风景优美',
      area: 31917.0,
      population: 7300000
    },
    { 
      code: 'shikoku', 
      nameJa: '四国地方', 
      nameEn: 'Shikoku', 
      nameZh: '四国地方', 
      description: '四国岛地方，四国遍路朝圣之路起源地',
      area: 18800.0,
      population: 3700000
    },
    { 
      code: 'kyushu', 
      nameJa: '九州地方', 
      nameEn: 'Kyushu', 
      nameZh: '九州地方', 
      description: '九州岛及冲绳地方，温泉与火山活跃',
      area: 44512.0,
      population: 14300000
    }
  ]

  const createdRegions = []
  for (const region of regions) {
    const created = await prisma.region.upsert({
      where: { code: region.code },
      update: {
        nameJa: region.nameJa,
        nameEn: region.nameEn,
        nameZh: region.nameZh,
        description: region.description,
        area: region.area,
        population: region.population
      },
      create: {
        code: region.code,
        nameJa: region.nameJa,
        nameEn: region.nameEn,
        nameZh: region.nameZh,
        description: region.description,
        area: region.area,
        population: region.population
      }
    })
    createdRegions.push(created)
  }
  console.log(`✅ 创建了 ${createdRegions.length} 个地方区划`)

  // 2. 创建完整的47个都道府县数据
  console.log('📍 创建47个都道府县数据...')
  
  const prefecturesData = [
    // 北海道地方
    { code: '01', nameJa: '北海道', nameEn: 'Hokkaido', nameZh: '北海道', regionCode: 'hokkaido', type: '道', capital: '札幌市', area: 83424.0, population: 5183000 },
    
    // 東北地方
    { code: '02', nameJa: '青森県', nameEn: 'Aomori', nameZh: '青森县', regionCode: 'tohoku', type: '県', capital: '青森市', area: 9646.0, population: 1238000 },
    { code: '03', nameJa: '岩手県', nameEn: 'Iwate', nameZh: '岩手县', regionCode: 'tohoku', type: '県', capital: '盛岡市', area: 15275.0, population: 1211000 },
    { code: '04', nameJa: '宮城県', nameEn: 'Miyagi', nameZh: '宫城县', regionCode: 'tohoku', type: '県', capital: '仙台市', area: 7282.0, population: 2306000 },
    { code: '05', nameJa: '秋田県', nameEn: 'Akita', nameZh: '秋田县', regionCode: 'tohoku', type: '県', capital: '秋田市', area: 11638.0, population: 966000 },
    { code: '06', nameJa: '山形県', nameEn: 'Yamagata', nameZh: '山形县', regionCode: 'tohoku', type: '県', capital: '山形市', area: 9323.0, population: 1069000 },
    { code: '07', nameJa: '福島県', nameEn: 'Fukushima', nameZh: '福岛县', regionCode: 'tohoku', type: '県', capital: '福島市', area: 13784.0, population: 1833000 },
    
    // 関東地方
    { code: '08', nameJa: '茨城県', nameEn: 'Ibaraki', nameZh: '茨城县', regionCode: 'kanto', type: '県', capital: '水戸市', area: 6097.0, population: 2868000 },
    { code: '09', nameJa: '栃木県', nameEn: 'Tochigi', nameZh: '栃木县', regionCode: 'kanto', type: '県', capital: '宇都宮市', area: 6408.0, population: 1934000 },
    { code: '10', nameJa: '群馬県', nameEn: 'Gunma', nameZh: '群马县', regionCode: 'kanto', type: '県', capital: '前橋市', area: 6362.0, population: 1940000 },
    { code: '11', nameJa: '埼玉県', nameEn: 'Saitama', nameZh: '埼玉县', regionCode: 'kanto', type: '県', capital: 'さいたま市', area: 3798.0, population: 7355000 },
    { code: '12', nameJa: '千葉県', nameEn: 'Chiba', nameZh: '千叶县', regionCode: 'kanto', type: '県', capital: '千葉市', area: 5158.0, population: 6287000 },
    { code: '13', nameJa: '東京都', nameEn: 'Tokyo', nameZh: '东京都', regionCode: 'kanto', type: '都', capital: '新宿区', area: 2194.0, population: 14047000 },
    { code: '14', nameJa: '神奈川県', nameEn: 'Kanagawa', nameZh: '神奈川县', regionCode: 'kanto', type: '県', capital: '横浜市', area: 2416.0, population: 9237000 },
    
    // 中部地方
    { code: '15', nameJa: '新潟県', nameEn: 'Niigata', nameZh: '新潟县', regionCode: 'chubu', type: '県', capital: '新潟市', area: 12584.0, population: 2202000 },
    { code: '16', nameJa: '富山県', nameEn: 'Toyama', nameZh: '富山县', regionCode: 'chubu', type: '県', capital: '富山市', area: 4248.0, population: 1044000 },
    { code: '17', nameJa: '石川県', nameEn: 'Ishikawa', nameZh: '石川县', regionCode: 'chubu', type: '県', capital: '金沢市', area: 4186.0, population: 1132000 },
    { code: '18', nameJa: '福井県', nameEn: 'Fukui', nameZh: '福井县', regionCode: 'chubu', type: '県', capital: '福井市', area: 4190.0, population: 767000 },
    { code: '19', nameJa: '山梨県', nameEn: 'Yamanashi', nameZh: '山梨县', regionCode: 'chubu', type: '県', capital: '甲府市', area: 4465.0, population: 817000 },
    { code: '20', nameJa: '長野県', nameEn: 'Nagano', nameZh: '长野县', regionCode: 'chubu', type: '県', capital: '長野市', area: 13562.0, population: 2049000 },
    { code: '21', nameJa: '岐阜県', nameEn: 'Gifu', nameZh: '岐阜县', regionCode: 'chubu', type: '県', capital: '岐阜市', area: 10621.0, population: 1987000 },
    { code: '22', nameJa: '静岡県', nameEn: 'Shizuoka', nameZh: '静冈县', regionCode: 'chubu', type: '県', capital: '静岡市', area: 7777.0, population: 3634000 },
    { code: '23', nameJa: '愛知県', nameEn: 'Aichi', nameZh: '爱知县', regionCode: 'chubu', type: '県', capital: '名古屋市', area: 5173.0, population: 7552000 },
    
    // 関西地方  
    { code: '24', nameJa: '三重県', nameEn: 'Mie', nameZh: '三重县', regionCode: 'kansai', type: '県', capital: '津市', area: 5774.0, population: 1771000 },
    { code: '25', nameJa: '滋賀県', nameEn: 'Shiga', nameZh: '滋贺县', regionCode: 'kansai', type: '県', capital: '大津市', area: 4017.0, population: 1414000 },
    { code: '26', nameJa: '京都府', nameEn: 'Kyoto', nameZh: '京都府', regionCode: 'kansai', type: '府', capital: '京都市', area: 4612.0, population: 2583000 },
    { code: '27', nameJa: '大阪府', nameEn: 'Osaka', nameZh: '大阪府', regionCode: 'kansai', type: '府', capital: '大阪市', area: 1905.0, population: 8838000 },
    { code: '28', nameJa: '兵庫県', nameEn: 'Hyogo', nameZh: '兵库县', regionCode: 'kansai', type: '県', capital: '神戸市', area: 8401.0, population: 5466000 },
    { code: '29', nameJa: '奈良県', nameEn: 'Nara', nameZh: '奈良县', regionCode: 'kansai', type: '県', capital: '奈良市', area: 3691.0, population: 1330000 },
    { code: '30', nameJa: '和歌山県', nameEn: 'Wakayama', nameZh: '和歌山县', regionCode: 'kansai', type: '県', capital: '和歌山市', area: 4725.0, population: 925000 },
    
    // 中国地方
    { code: '31', nameJa: '鳥取県', nameEn: 'Tottori', nameZh: '鸟取县', regionCode: 'chugoku', type: '県', capital: '鳥取市', area: 3507.0, population: 556000 },
    { code: '32', nameJa: '島根県', nameEn: 'Shimane', nameZh: '岛根县', regionCode: 'chugoku', type: '県', capital: '松江市', area: 6708.0, population: 674000 },
    { code: '33', nameJa: '岡山県', nameEn: 'Okayama', nameZh: '冈山县', regionCode: 'chugoku', type: '県', capital: '岡山市', area: 7114.0, population: 1890000 },
    { code: '34', nameJa: '広島県', nameEn: 'Hiroshima', nameZh: '广岛县', regionCode: 'chugoku', type: '県', capital: '広島市', area: 8479.0, population: 2800000 },
    { code: '35', nameJa: '山口県', nameEn: 'Yamaguchi', nameZh: '山口县', regionCode: 'chugoku', type: '県', capital: '山口市', area: 6113.0, population: 1342000 },
    
    // 四国地方
    { code: '36', nameJa: '徳島県', nameEn: 'Tokushima', nameZh: '德岛县', regionCode: 'shikoku', type: '県', capital: '徳島市', area: 4147.0, population: 728000 },
    { code: '37', nameJa: '香川県', nameEn: 'Kagawa', nameZh: '香川县', regionCode: 'shikoku', type: '県', capital: '高松市', area: 1877.0, population: 950000 },
    { code: '38', nameJa: '愛媛県', nameEn: 'Ehime', nameZh: '爱媛县', regionCode: 'shikoku', type: '県', capital: '松山市', area: 5676.0, population: 1335000 },
    { code: '39', nameJa: '高知県', nameEn: 'Kochi', nameZh: '高知县', regionCode: 'shikoku', type: '県', capital: '高知市', area: 7103.0, population: 696000 },
    
    // 九州地方
    { code: '40', nameJa: '福岡県', nameEn: 'Fukuoka', nameZh: '福冈县', regionCode: 'kyushu', type: '県', capital: '福岡市', area: 4986.0, population: 5135000 },
    { code: '41', nameJa: '佐賀県', nameEn: 'Saga', nameZh: '佐贺县', regionCode: 'kyushu', type: '県', capital: '佐賀市', area: 2441.0, population: 811000 },
    { code: '42', nameJa: '長崎県', nameEn: 'Nagasaki', nameZh: '长崎县', regionCode: 'kyushu', type: '県', capital: '長崎市', area: 4132.0, population: 1327000 },
    { code: '43', nameJa: '熊本県', nameEn: 'Kumamoto', nameZh: '熊本县', regionCode: 'kyushu', type: '県', capital: '熊本市', area: 7409.0, population: 1739000 },
    { code: '44', nameJa: '大分県', nameEn: 'Oita', nameZh: '大分县', regionCode: 'kyushu', type: '県', capital: '大分市', area: 6341.0, population: 1134000 },
    { code: '45', nameJa: '宮崎県', nameEn: 'Miyazaki', nameZh: '宫崎县', regionCode: 'kyushu', type: '県', capital: '宮崎市', area: 7735.0, population: 1073000 },
    { code: '46', nameJa: '鹿児島県', nameEn: 'Kagoshima', nameZh: '鹿儿岛县', regionCode: 'kyushu', type: '県', capital: '鹿児島市', area: 9187.0, population: 1588000 },
    { code: '47', nameJa: '沖縄県', nameEn: 'Okinawa', nameZh: '冲绳县', regionCode: 'kyushu', type: '県', capital: '那覇市', area: 2281.0, population: 1467000 }
  ]

  // 获取地方ID映射
  const regionMap = new Map()
  createdRegions.forEach(region => {
    regionMap.set(region.code, region.id)
  })

  const createdPrefectures = []
  for (const pref of prefecturesData) {
    const regionId = regionMap.get(pref.regionCode)
    if (regionId) {
      const created = await prisma.prefecture.upsert({
        where: { code: pref.code },
        update: {
          nameJa: pref.nameJa,
          nameEn: pref.nameEn,
          nameZh: pref.nameZh,
          type: pref.type,
          capital: pref.capital,
          regionId: regionId,
          area: pref.area,
          population: pref.population
        },
        create: {
          code: pref.code,
          nameJa: pref.nameJa,
          nameEn: pref.nameEn,
          nameZh: pref.nameZh,
          regionId: regionId,
          type: pref.type,
          capital: pref.capital,
          postalCode: null,
          area: pref.area,
          population: pref.population
        }
      })
      createdPrefectures.push(created)
    }
  }
  console.log(`✅ 创建了 ${createdPrefectures.length} 个都道府县`)

  // 3. 创建东京、大阪、广岛、福冈的三级行政区（市区町村）数据
  console.log('🏙️ 创建东京、大阪、广岛、福冈的市区町村数据...')
  
  const citiesData = [
    // 东京都 (13) - 23个特别区
    { code: '13101', nameJa: '千代田区', nameEn: 'Chiyoda', nameZh: '千代田区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: true, population: 66680, area: 11.66 },
    { code: '13102', nameJa: '中央区', nameEn: 'Chuo', nameZh: '中央区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 172312, area: 10.21 },
    { code: '13103', nameJa: '港区', nameEn: 'Minato', nameZh: '港区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 261963, area: 20.37 },
    { code: '13104', nameJa: '新宿区', nameEn: 'Shinjuku', nameZh: '新宿区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 350710, area: 18.22 },
    { code: '13105', nameJa: '文京区', nameEn: 'Bunkyo', nameZh: '文京区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 240069, area: 11.29 },
    { code: '13106', nameJa: '台東区', nameEn: 'Taito', nameZh: '台东区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 212264, area: 10.11 },
    { code: '13107', nameJa: '墨田区', nameEn: 'Sumida', nameZh: '墨田区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 277835, area: 13.77 },
    { code: '13108', nameJa: '江東区', nameEn: 'Koto', nameZh: '江东区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 529710, area: 40.16 },
    { code: '13109', nameJa: '品川区', nameEn: 'Shinagawa', nameZh: '品川区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 421306, area: 22.84 },
    { code: '13110', nameJa: '目黒区', nameEn: 'Meguro', nameZh: '目黒区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 281050, area: 14.67 },
    { code: '13111', nameJa: '大田区', nameEn: 'Ota', nameZh: '大田区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 748081, area: 60.83 },
    { code: '13112', nameJa: '世田谷区', nameEn: 'Setagaya', nameZh: '世田谷区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 939099, area: 58.05 },
    { code: '13113', nameJa: '渋谷区', nameEn: 'Shibuya', nameZh: '涩谷区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 235697, area: 15.11 },
    { code: '13114', nameJa: '中野区', nameEn: 'Nakano', nameZh: '中野区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 346235, area: 15.59 },
    { code: '13115', nameJa: '杉並区', nameEn: 'Suginami', nameZh: '杉并区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 585999, area: 34.06 },
    { code: '13116', nameJa: '豊島区', nameEn: 'Toshima', nameZh: '丰岛区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 304718, area: 13.01 },
    { code: '13117', nameJa: '北区', nameEn: 'Kita', nameZh: '北区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 354036, area: 20.61 },
    { code: '13118', nameJa: '荒川区', nameEn: 'Arakawa', nameZh: '荒川区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 218640, area: 10.16 },
    { code: '13119', nameJa: '板橋区', nameEn: 'Itabashi', nameZh: '板桥区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 583744, area: 32.22 },
    { code: '13120', nameJa: '練馬区', nameEn: 'Nerima', nameZh: '练马区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 752608, area: 48.08 },
    { code: '13121', nameJa: '足立区', nameEn: 'Adachi', nameZh: '足立区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 696838, area: 53.25 },
    { code: '13122', nameJa: '葛飾区', nameEn: 'Katsushika', nameZh: '葛饰区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 461865, area: 34.80 },
    { code: '13123', nameJa: '江戸川区', nameEn: 'Edogawa', nameZh: '江户川区', type: '特別区', level: 'ward', prefectureCode: '13', isCapital: false, population: 698318, area: 49.90 },

    // 大阪府 (27) - 主要市
    { code: '27100', nameJa: '大阪市', nameEn: 'Osaka', nameZh: '大阪市', type: '政令指定都市', level: 'city', prefectureCode: '27', isCapital: true, population: 2752412, area: 225.21 },
    { code: '27140', nameJa: '堺市', nameEn: 'Sakai', nameZh: '堺市', type: '政令指定都市', level: 'city', prefectureCode: '27', isCapital: false, population: 838271, area: 149.82 },
    { code: '27203', nameJa: '岸和田市', nameEn: 'Kishiwada', nameZh: '岸和田市', type: '市', level: 'city', prefectureCode: '27', isCapital: false, population: 193648, area: 72.68 },
    { code: '27204', nameJa: '豊中市', nameEn: 'Toyonaka', nameZh: '丰中市', type: '中核市', level: 'city', prefectureCode: '27', isCapital: false, population: 401507, area: 36.60 },
    { code: '27205', nameJa: '池田市', nameEn: 'Ikeda', nameZh: '池田市', type: '市', level: 'city', prefectureCode: '27', isCapital: false, population: 104229, area: 22.09 },
    { code: '27206', nameJa: '吹田市', nameEn: 'Suita', nameZh: '吹田市', type: '中核市', level: 'city', prefectureCode: '27', isCapital: false, population: 381997, area: 36.11 },
    { code: '27207', nameJa: '泉大津市', nameEn: 'Izumiotsu', nameZh: '泉大津市', type: '市', level: 'city', prefectureCode: '27', isCapital: false, population: 75943, area: 11.92 },
    { code: '27208', nameJa: '高槻市', nameEn: 'Takatsuki', nameZh: '高槻市', type: '中核市', level: 'city', prefectureCode: '27', isCapital: false, population: 352083, area: 105.29 },

    // 広島県 (34) - 主要市
    { code: '34100', nameJa: '広島市', nameEn: 'Hiroshima', nameZh: '广岛市', type: '政令指定都市', level: 'city', prefectureCode: '34', isCapital: true, population: 1199775, area: 906.68 },
    { code: '34202', nameJa: '呉市', nameEn: 'Kure', nameZh: '吴市', type: '中核市', level: 'city', prefectureCode: '34', isCapital: false, population: 218961, area: 352.80 },
    { code: '34203', nameJa: '竹原市', nameEn: 'Takehara', nameZh: '竹原市', type: '市', level: 'city', prefectureCode: '34', isCapital: false, population: 25477, area: 118.30 },
    { code: '34204', nameJa: '三原市', nameEn: 'Mihara', nameZh: '三原市', type: '市', level: 'city', prefectureCode: '34', isCapital: false, population: 94692, area: 471.03 },
    { code: '34205', nameJa: '尾道市', nameEn: 'Onomichi', nameZh: '尾道市', type: '市', level: 'city', prefectureCode: '34', isCapital: false, population: 134766, area: 284.85 },
    { code: '34207', nameJa: '福山市', nameEn: 'Fukuyama', nameZh: '福山市', type: '中核市', level: 'city', prefectureCode: '34', isCapital: false, population: 468812, area: 518.14 },
    { code: '34208', nameJa: '府中市', nameEn: 'Fuchu', nameZh: '府中市', type: '市', level: 'city', prefectureCode: '34', isCapital: false, population: 37721, area: 195.75 },

    // 福岡県 (40) - 主要市
    { code: '40130', nameJa: '福岡市', nameEn: 'Fukuoka', nameZh: '福冈市', type: '政令指定都市', level: 'city', prefectureCode: '40', isCapital: true, population: 1612392, area: 343.39 },
    { code: '40131', nameJa: '大牟田市', nameEn: 'Omuta', nameZh: '大牟田市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 110956, area: 81.45 },
    { code: '40132', nameJa: '久留米市', nameEn: 'Kurume', nameZh: '久留米市', type: '中核市', level: 'city', prefectureCode: '40', isCapital: false, population: 303579, area: 229.96 },
    { code: '40133', nameJa: '直方市', nameEn: 'Nogata', nameZh: '直方市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 56011, area: 61.78 },
    { code: '40134', nameJa: '飯塚市', nameEn: 'Iizuka', nameZh: '饭塚市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 126701, area: 214.07 },
    { code: '40135', nameJa: '田川市', nameEn: 'Tagawa', nameZh: '田川市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 45444, area: 54.55 },
    { code: '40136', nameJa: '柳川市', nameEn: 'Yanagawa', nameZh: '柳川市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 64155, area: 77.15 },
    { code: '40137', nameJa: '八女市', nameEn: 'Yame', nameZh: '八女市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 62192, area: 482.44 },
    { code: '40139', nameJa: '筑後市', nameEn: 'Chikugo', nameZh: '筑后市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 49006, area: 41.78 },
    { code: '40140', nameJa: '大川市', nameEn: 'Okawa', nameZh: '大川市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 33634, area: 33.62 },
    { code: '40141', nameJa: '行橋市', nameEn: 'Yukuhashi', nameZh: '行桥市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 72606, area: 69.83 },
    { code: '40142', nameJa: '豊前市', nameEn: 'Buzen', nameZh: '丰前市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 25031, area: 111.13 },
    { code: '40143', nameJa: '中間市', nameEn: 'Nakama', nameZh: '中间市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 40678, area: 16.00 },
    { code: '40144', nameJa: '小郡市', nameEn: 'Ogori', nameZh: '小郡市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 59404, area: 45.50 },
    { code: '40145', nameJa: '筑紫野市', nameEn: 'Chikushino', nameZh: '筑紫野市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 105334, area: 87.78 },
    { code: '40146', nameJa: '春日市', nameEn: 'Kasuga', nameZh: '春日市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 113034, area: 14.15 },
    { code: '40147', nameJa: '大野城市', nameEn: 'Onojo', nameZh: '大野城市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 102078, area: 26.89 },
    { code: '40148', nameJa: '宗像市', nameEn: 'Munakata', nameZh: '宗像市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 97282, area: 119.66 },
    { code: '40149', nameJa: '太宰府市', nameEn: 'Dazaifu', nameZh: '太宰府市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 72680, area: 29.60 },
    { code: '40150', nameJa: '古賀市', nameEn: 'Koga', nameZh: '古贺市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 59786, area: 42.11 },
    { code: '40151', nameJa: '福津市', nameEn: 'Fukutsu', nameZh: '福津市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 69244, area: 52.76 },
    { code: '40152', nameJa: 'うきは市', nameEn: 'Ukiha', nameZh: '浮羽市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 28674, area: 117.46 },
    { code: '40153', nameJa: '宮若市', nameEn: 'Miyawaka', nameZh: '宫若市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 27244, area: 139.99 },
    { code: '40154', nameJa: '嘉麻市', nameEn: 'Kama', nameZh: '嘉麻市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 36148, area: 135.17 },
    { code: '40155', nameJa: '朝倉市', nameEn: 'Asakura', nameZh: '朝仓市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 50634, area: 246.71 },
    { code: '40156', nameJa: 'みやま市', nameEn: 'Miyama', nameZh: '深山市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 36364, area: 105.21 },
    { code: '40157', nameJa: '糸島市', nameEn: 'Itoshima', nameZh: '糸岛市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 103926, area: 215.70 },
    { code: '40220', nameJa: '那珂川市', nameEn: 'Nakagawa', nameZh: '那珂川市', type: '市', level: 'city', prefectureCode: '40', isCapital: false, population: 50579, area: 74.95 }
  ]

  // 获取都道府县ID映射
  const prefectureMap = new Map()
  const allPrefectures = await prisma.prefecture.findMany()
  allPrefectures.forEach(pref => {
    prefectureMap.set(pref.code, pref.id)
  })

  for (const city of citiesData) {
    const prefectureId = prefectureMap.get(city.prefectureCode)
    if (prefectureId) {
      await prisma.city.upsert({
        where: { code: city.code },
        update: {
          nameJa: city.nameJa,
          nameEn: city.nameEn,
          nameZh: city.nameZh,
          type: city.type,
          level: city.level,
          isCapital: city.isCapital,
          population: city.population,
          area: city.area
        },
        create: {
          code: city.code,
          nameJa: city.nameJa,
          nameEn: city.nameEn,
          nameZh: city.nameZh,
          type: city.type,
          level: city.level,
          prefectureId: prefectureId,
          population: city.population,
          area: city.area,
          isCapital: city.isCapital
        }
      })
    }
  }
  console.log(`✅ 创建了 ${citiesData.length} 个市区町村`)

  // 4. 创建示例用户（覆盖各个地方）
  console.log('👥 创建示例用户...')
  
  const sampleUsers = [
    {
      username: 'tokyo_admin',
      email: 'admin@tokyo.jp',
      name: '東京管理者',
      phone: '03-1234-5678',
      region: 'kanto',
      regionCode: 'kanto',
      prefectureCode: '13'
    },
    {
      username: 'osaka_merchant',
      email: 'merchant@osaka.jp',
      name: '大阪商人',
      phone: '06-2345-6789',
      region: 'kansai',
      regionCode: 'kansai',
      prefectureCode: '27'
    },
    {
      username: 'hiroshima_teacher',
      email: 'teacher@hiroshima.jp',
      name: '広島先生',
      phone: '082-3456-7890',
      region: 'chugoku',
      regionCode: 'chugoku',
      prefectureCode: '34'
    },
    {
      username: 'fukuoka_trader',
      email: 'trader@fukuoka.jp',
      name: '福岡商人',
      phone: '092-4567-8901',
      region: 'kyushu',
      regionCode: 'kyushu',
      prefectureCode: '40'
    },
    {
      username: 'hokkaido_farmer',
      email: 'farmer@hokkaido.jp',
      name: '北海道農夫',
      phone: '011-5678-9012',
      region: 'hokkaido',
      regionCode: 'hokkaido',
      prefectureCode: '01'
    },
    {
      username: 'shikoku_artist',
      email: 'artist@shikoku.jp',
      name: '四国芸術家',
      phone: '087-6789-0123',
      region: 'shikoku',
      regionCode: 'shikoku',
      prefectureCode: '37'
    }
  ]

  for (const user of sampleUsers) {
    const regionId = regionMap.get(user.regionCode)
    const prefectureId = prefectureMap.get(user.prefectureCode)
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        name: user.name,
        phone: user.phone,
        region: user.region,
        regionId: regionId || null,
        prefectureId: prefectureId || null
      },
      create: {
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        password: 'temp123',
        region: user.region,
        regionId: regionId || null,
        prefectureId: prefectureId || null,
        cityId: null,
        districtId: null,
        wardId: null
      }
    })
  }
  console.log(`✅ 创建了 ${sampleUsers.length} 个用户`)

  // 5. 创建示例商品（分布在各个地方）
  console.log('📦 创建示例商品...')
  
  const users = await prisma.user.findMany()
  const sampleItems = [
    // 东京商品
    {
      title: 'iPhone 15 Pro Max',
      description: '全新未拆封，东京银座Apple Store购买，包装齐全',
      price: 159800,
      region: 'kanto',
      regionCode: 'kanto',
      prefectureCode: '13'
    },
    {
      title: '東京限定 スカイツリー模型',
      description: '東京スカイツリー公式グッズ、コレクション品',
      price: 8500,
      region: 'kanto',
      regionCode: 'kanto',
      prefectureCode: '13'
    },
    
    // 大阪商品
    {
      title: 'たこ焼き器セット',
      description: '大阪本場のたこ焼き器、家庭で本格的なたこ焼きが作れます',
      price: 4800,
      region: 'kansai',
      regionCode: 'kansai',
      prefectureCode: '27'
    },
    {
      title: 'MacBook Pro M3',
      description: '大阪で購入、軽く使用、動作良好',
      price: 248000,
      region: 'kansai',
      regionCode: 'kansai',
      prefectureCode: '27'
    },
    
    // 广岛商品
    {
      title: '広島カープ 応援グッズセット',
      description: '2024年シーズングッズ、ユニフォーム、タオル等',
      price: 12000,
      region: 'chugoku',
      regionCode: 'chugoku',
      prefectureCode: '34'
    },
    {
      title: 'もみじ饅頭 製造器具',
      description: '広島名物もみじ饅頭を作る道具一式',
      price: 6500,
      region: 'chugoku',
      regionCode: 'chugoku',
      prefectureCode: '34'
    },
    
    // 福冈商品
    {
      title: '博多ラーメン 業務用セット',
      description: '福岡の有名店から仕入れた本格博多ラーメンの材料',
      price: 8800,
      region: 'kyushu',
      regionCode: 'kyushu',
      prefectureCode: '40'
    },
    {
      title: 'PlayStation 5',
      description: '福岡で購入、美品、コントローラー2個付き',
      price: 68000,
      region: 'kyushu',
      regionCode: 'kyushu',
      prefectureCode: '40'
    },
    
    // 北海道商品
    {
      title: '北海道産 毛蟹セット',
      description: '札幌直送、新鮮な毛蟹、冷凍便でお届け',
      price: 15000,
      region: 'hokkaido',
      regionCode: 'hokkaido',
      prefectureCode: '01'
    },
    {
      title: 'スノーボード板 Burton',
      description: '北海道ニセコで使用、板・ビンディング・ブーツセット',
      price: 45000,
      region: 'hokkaido',
      regionCode: 'hokkaido',
      prefectureCode: '01'
    },
    
    // 四国商品
    {
      title: '讃岐うどん 手打ちセット',
      description: '香川県産小麦使用、うどん打ち道具一式',
      price: 7200,
      region: 'shikoku',
      regionCode: 'shikoku',
      prefectureCode: '37'
    },
    {
      title: '四国八十八箇所 御朱印帳',
      description: '四国遍路で使用、一部寺院の御朱印付き',
      price: 12500,
      region: 'shikoku',
      regionCode: 'shikoku',
      prefectureCode: '37'
    }
  ]

  for (let i = 0; i < sampleItems.length; i++) {
    const item = sampleItems[i]
    const seller = users[i % users.length] // 循环分配卖家
    const regionId = regionMap.get(item.regionCode)
    const prefectureId = prefectureMap.get(item.prefectureCode)
    
    await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        imageUrl: null,
        region: item.region,
        regionId: regionId || null,
        prefectureId: prefectureId || null,
        cityId: null,
        districtId: null,
        wardId: null,
        sellerId: seller.id
      }
    })
  }
  console.log(`✅ 创建了 ${sampleItems.length} 个商品`)

  console.log('🎉 完整的日本行政区划数据填充完成!')
  
  // 显示统计信息
  const stats = {
    regions: await prisma.region.count(),
    prefectures: await prisma.prefecture.count(),
    cities: await prisma.city.count(),
    users: await prisma.user.count(),
    items: await prisma.item.count()
  }
  
  console.log('\n📊 数据统计:')
  console.log(`一级 - 地方: ${stats.regions} 个`)
  console.log(`二级 - 都道府県: ${stats.prefectures} 个`)
  console.log(`三级 - 市区町村: ${stats.cities} 个`)
  console.log(`用户: ${stats.users} 个`)
  console.log(`商品: ${stats.items} 个`)
  
  // 显示详细的地方区划统计
  console.log('\n🗾 详细地方区划统计:')
  const regionsWithStats = await prisma.region.findMany({
    include: {
      Prefecture: {
        select: {
          nameJa: true,
          type: true,
          _count: {
            select: {
              City: true
            }
          }
        }
      },
      _count: {
        select: {
          Prefecture: true,
          User: true,
          Item: true
        }
      }
    }
  })
  
  regionsWithStats.forEach(region => {
    console.log(`\n📍 ${region.nameJa} (${region.nameEn}):`)
    console.log(`   都道府県: ${region._count.Prefecture} 个`)
    console.log(`   用户: ${region._count.User} 个`)
    console.log(`   商品: ${region._count.Item} 个`)
    
    let totalCities = 0
    region.Prefecture.forEach(pref => {
      totalCities += pref._count.City
      console.log(`     └─ ${pref.nameJa}${pref.type} (${pref._count.City} 个市区町村)`)
    })
    console.log(`   总计市区町村: ${totalCities} 个`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Seed执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
