import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 开始数据库种子数据插入...");

  // 清空数据表，避免唯一约束冲突
  console.log("🗑️  清理现有数据...");
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👥 创建测试用户...");
  
  // 创建用户数据 - 只使用确认的核心字段
  const alice = await prisma.user.create({
    data: { 
      email: "alice@example.com", 
      name: "Alice Johnson",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date('2024-01-15T10:30:00Z')
    }
  });

  const bob = await prisma.user.create({
    data: { 
      email: "bob@example.com", 
      name: "Bob Smith",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date('2024-02-10T14:20:00Z')
    }
  });

  const charlie = await prisma.user.create({
    data: { 
      email: "charlie@example.com", 
      name: "Charlie Brown",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date('2024-03-05T09:45:00Z')
    }
  });

  const diana = await prisma.user.create({
    data: { 
      email: "diana@example.com", 
      name: "Diana Prince",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date('2024-04-12T16:10:00Z')
    }
  });

  const edward = await prisma.user.create({
    data: { 
      email: "edward@example.com", 
      name: "Edward Chen",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date('2024-05-20T11:25:00Z')
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
