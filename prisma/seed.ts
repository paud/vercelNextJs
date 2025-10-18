import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 清空数据表，避免唯一约束冲突
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  // Create 5 users
  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", name: "Alice" },
      { email: "bob@example.com", name: "Bob" },
      { email: "charlie@example.com", name: "Charlie" },
      { email: "diana@example.com", name: "Diana" },
      { email: "edward@example.com", name: "Edward" },
    ],
  });

  // Find all users to get their IDs
  const userRecords = await prisma.user.findMany();

  const userIdMapping = {
    alice: userRecords.find((user: any) => user.email === "alice@example.com")
      ?.id,
    bob: userRecords.find((user: any) => user.email === "bob@example.com")?.id,
    charlie: userRecords.find((user: any) => user.email === "charlie@example.com")
      ?.id,
    diana: userRecords.find((user: any) => user.email === "diana@example.com")?.id,
    edward: userRecords.find((user: any) => user.email === "edward@example.com")?.id,
  };

  // Create 15 items distributed among users
  await prisma.item.createMany({
    data: [
      // Alice's items
      {
        title: "二手iPhone 12",
        description: "成色很好，电池健康度90%，无维修。",
        price: 3200,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        sellerId: userIdMapping.alice!,
      },
      {
        title: "小米空气净化器",
        description: "家用，几乎全新，带原包装。",
        price: 400,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        sellerId: userIdMapping.alice!,
      },
      // Bob's items
      {
        title: "二手山地自行车",
        description: "适合城市骑行，刹车灵敏。",
        price: 800,
        imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
        sellerId: userIdMapping.bob!,
      },
      {
        title: "Kindle Paperwhite",
        description: "屏幕无划痕，送保护套。",
        price: 500,
        imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
        sellerId: userIdMapping.bob!,
      },
      // Charlie's items
      {
        title: "二手显示器 24寸",
        description: "无坏点，色彩正常。",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        sellerId: userIdMapping.charlie!,
      },
      {
        title: "二手吉他",
        description: "音色好，适合初学者。",
        price: 200,
        imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
        sellerId: userIdMapping.charlie!,
      },
      // Diana's items
      {
        title: "二手微波炉",
        description: "加热快，外观完好。",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
        sellerId: userIdMapping.diana!,
      },
      {
        title: "二手滑板",
        description: "轮子顺滑，板面无损。",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b5",
        sellerId: userIdMapping.diana!,
      },
      // Edward's items
      {
        title: "二手耳机",
        description: "音质好，线材完好。",
        price: 80,
        imageUrl: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c",
        sellerId: userIdMapping.edward!,
      },
      {
        title: "二手台灯",
        description: "亮度可调，节能。",
        price: 60,
        imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde",
        sellerId: userIdMapping.edward!,
      },
    ],
  });

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
