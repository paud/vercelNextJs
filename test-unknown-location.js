// 测试未知地区是否返回东京都

async function testUnknownLocation() {
  try {
    console.log('🧪 测试未知地区...');
    
    // 使用一个海洋中的坐标（应该返回未知地区）
    const response = await fetch('http://localhost:3001/api/auto-detect-region', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: 1.0,  // 非零坐标
        longitude: 1.0  // 非零坐标（几内亚湾海域）
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 响应成功');
      console.log('成功状态:', data.success);
      console.log('消息:', data.message);
      
      if (data.cityInfo) {
        console.log('🏙️  返回的默认地区信息:', {
          fullAddress: data.cityInfo.fullCityAddress,
          multiLanguage: data.cityInfo.multiLanguage,
          city: data.cityInfo.city,
          state: data.cityInfo.state,
          country: data.cityInfo.country
        });
        
        // 验证是否正确返回了东京都
        if (data.cityInfo.multiLanguage) {
          const isCorrectDefault = data.cityInfo.multiLanguage.zh === '东京都' &&
                                  data.cityInfo.multiLanguage.en === 'Tokyo Metropolis' &&
                                  data.cityInfo.multiLanguage.ja === '東京都';
          
          if (isCorrectDefault) {
            console.log('✅ 正确返回了多语言的东京都默认地区');
          } else {
            console.log('❌ 多语言默认地区不正确');
          }
        }
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

// 运行测试
testUnknownLocation().catch(console.error);
