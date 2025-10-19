import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查当前数据库状态...')
  
  try {
    // 检查各表的记录数量
    const stats = {
      users: await prisma.user.count(),
      items: await prisma.item.count(),
      regions: await prisma.region.count(),
      prefectures: await prisma.prefecture.count(),
      cities: await prisma.city.count(),
      districts: await prisma.district.count(),
      wards: await prisma.ward.count(),
      accounts: await prisma.account.count(),
      sessions: await prisma.session.count()
    }
    
    console.log('\n📊 当前数据库统计:')
    console.log(`用户 (Users): ${stats.users}`)
    console.log(`商品 (Items): ${stats.items}`)
    console.log(`地方 (Regions): ${stats.regions}`)
    console.log(`都道府県 (Prefectures): ${stats.prefectures}`)
    console.log(`市区町村 (Cities): ${stats.cities}`)
    console.log(`区域 (Districts): ${stats.districts}`)
    console.log(`区町 (Wards): ${stats.wards}`)
    console.log(`账户 (Accounts): ${stats.accounts}`)
    console.log(`会话 (Sessions): ${stats.sessions}`)
    
    // 检查是否有完整的地理层级数据
    if (stats.regions === 8 && stats.prefectures === 47) {
      console.log('\n✅ 地理层级数据已完整!')
      
      // 显示各地方的详细信息
      const regions = await prisma.region.findMany({
        include: {
          _count: {
            select: {
              Prefecture: true,
              User: true,
              Item: true
            }
          }
        }
      })
      
      console.log('\n🗾 各地方详细统计:')
      regions.forEach(region => {
        console.log(`${region.nameJa} (${region.nameEn}): ${region._count.Prefecture}个都道府県, ${region._count.User}个用户, ${region._count.Item}个商品`)
      })
      
    } else {
      console.log('\n❗ 地理层级数据不完整，建议运行完整seed文件')
    }
    
    // 检查示例数据
    if (stats.users > 0) {
      console.log('\n👥 示例用户:')
      const users = await prisma.user.findMany({
        include: {
          Region: true,
          Prefecture: true
        },
        take: 5
      })
      
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.Region?.nameJa} ${user.Prefecture?.nameJa}`)
      })
    }
    
    if (stats.items > 0) {
      console.log('\n📦 示例商品:')
      const items = await prisma.item.findMany({
        include: {
          Region: true,
          Prefecture: true,
          seller: true
        },
        take: 5
      })
      
      items.forEach(item => {
        console.log(`- ${item.title} (¥${item.price}) - ${item.Region?.nameJa} ${item.Prefecture?.nameJa} by ${item.seller?.name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 检查数据库状态时出错:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ 脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
