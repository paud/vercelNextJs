// 检查LINE登录创建的用户
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLineUsers() {
  console.log('查找所有LINE用户（email以@line.local结尾）...\n');
  
  const lineUsers = await prisma.user.findMany({
    where: {
      email: {
        endsWith: '@line.local'
      }
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (lineUsers.length === 0) {
    console.log('❌ 没有找到LINE用户');
  } else {
    console.log(`✅ 找到 ${lineUsers.length} 个LINE用户:\n`);
    lineUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || '(未设置)'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

checkLineUsers().catch(console.error);
