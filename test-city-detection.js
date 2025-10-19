// 测试优化后的 auto-detect-region API 是否能正确返回市一级信息

const testLocations = [
  // 东京（涩谷区）
  { name: '东京涩谷', lat: 35.6598, lng: 139.7006 },
  // 大阪（梅田）  
  { name: '大阪梅田', lat: 34.7024, lng: 135.4959 },
  // 京都
  { name: '京都', lat: 35.0116, lng: 135.7681 },
  // 名古屋
  { name: '名古屋', lat: 35.1815, lng: 136.9066 },
  // 福冈
  { name: '福冈', lat: 33.5904, lng: 130.4017 }
];

async function testLocation(location) {
  try {
    console.log(`\n测试地点: ${location.name} (${location.lat}, ${location.lng})`);
    
    const response = await fetch('http://localhost:3001/api/auto-detect-region', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 响应成功');
      console.log('成功状态:', data.success);
      console.log('消息:', data.message);
      
      // 检查是否包含市一级信息
      if (data.cityInfo) {
        console.log('🏙️  市一级信息:', {
          fullAddress: data.cityInfo.fullCityAddress,
          multiLanguage: data.cityInfo.multiLanguage,
          city: data.cityInfo.city,
          state: data.cityInfo.state,
          country: data.cityInfo.country
        });
      } else {
        console.log('⚠️  未返回市一级信息');
      }
      
      if (data.cityInfo && data.cityInfo.rawAddress) {
        console.log('📍 原始地址:', data.cityInfo.rawAddress);
      }
      
    } else {
      console.log('❌ API 响应失败:', response.status);
      const errorData = await response.text();
      console.log('错误信息:', errorData);
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function runTests() {
  console.log('🧪 开始测试优化后的 auto-detect-region API...');
  console.log('目标：确保 API 能直接返回市一级地理信息');
  
  for (const location of testLocations) {
    await testLocation(location);
    // 等待 1 秒避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ 所有测试完成');
}

// 运行测试
runTests().catch(console.error);
