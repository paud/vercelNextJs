# Footer 地理定位功能

## 概述

为 Footer 组件添加了自动地理定位功能，能够检测用户的位置并自动设置对应的地区，提升用户体验。

## 功能特性

### 1. 自动位置检测
- **页面加载时自动触发**：无需用户手动操作
- **浏览器地理定位API**：使用 `navigator.geolocation`
- **权限处理**：优雅处理用户拒绝定位的情况
- **错误处理**：处理各种定位失败场景

### 2. 智能地区匹配
- **精确匹配**：在预定义地区范围内的精确匹配
- **最近地区**：超出范围时选择最近的地区
- **默认地区**：失败时使用大阪作为默认地区

### 3. 用户界面反馈
- **定位状态指示**：蓝色脉冲圆点表示正在定位
- **成功状态指示**：绿色圆点表示定位成功
- **文字反馈**：显示"定位中..."或具体地区名称

## 技术实现

### 前端组件 (`app/Footer.tsx`)

```tsx
// 状态管理
const [detectedRegion, setDetectedRegion] = useState<string>('osaka');
const [isDetecting, setIsDetecting] = useState(false);
const [locationDetected, setLocationDetected] = useState(false);

// 地理定位逻辑
useEffect(() => {
  const detectLocation = async () => {
    setIsDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 调用后端API检测地区
        const response = await fetch('/api/auto-detect-region', {
          method: 'POST',
          body: JSON.stringify({ latitude, longitude }),
        });
        
        const data = await response.json();
        if (data.region) {
          setDetectedRegion(data.region);
          setLocationDetected(true);
        }
        
        setIsDetecting(false);
      },
      (error) => {
        // 错误处理
        setIsDetecting(false);
      }
    );
  };
  
  detectLocation();
}, [locale]);
```

### 后端API (`app/api/auto-detect-region/route.ts`)

```tsx
// 地区范围定义
const regions = {
  osaka: {
    lat: { min: 34.5, max: 34.8 },
    lng: { min: 135.3, max: 135.7 }
  },
  tokyo: {
    lat: { min: 35.5, max: 35.8 },
    lng: { min: 139.5, max: 139.9 }
  },
  kyoto: {
    lat: { min: 34.9, max: 35.1 },
    lng: { min: 135.6, max: 135.9 }
  }
};

// 距离计算和最近地区选择
const distances = Object.entries(regions).map(([key, region]) => {
  const centerLat = (region.lat.min + region.lat.max) / 2;
  const centerLng = (region.lng.min + region.lng.max) / 2;
  
  const distance = Math.sqrt(
    Math.pow(latitude - centerLat, 2) + Math.pow(longitude - centerLng, 2)
  );
  
  return { region: key, distance };
});
```

## 用户体验流程

### 1. 页面加载
```
[加载页面] → [请求地理位置权限] → [显示"定位中..."状态]
```

### 2. 定位成功
```
[获取坐标] → [调用检测API] → [更新地区] → [显示地区名称] → [绿色指示点]
```

### 3. 定位失败
```
[权限拒绝/超时/错误] → [使用默认地区(大阪)] → [正常显示]
```

## 视觉反馈

### 定位状态指示器
```css
/* 定位中 - 蓝色脉冲 */
.detecting {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* 定位成功 - 绿色圆点 */
.detected {
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
}
```

### 文字状态
- **定位中**：显示 "定位中..."
- **定位成功**：显示具体地区名称（大阪/东京/京都）
- **定位失败**：显示通用 "地区" 文字

## 地区映射

### 支持的地区
1. **大阪** (osaka)
   - 纬度范围：34.5 - 34.8
   - 经度范围：135.3 - 135.7

2. **东京** (tokyo)
   - 纬度范围：35.5 - 35.8
   - 经度范围：139.5 - 139.9

3. **京都** (kyoto)
   - 纬度范围：34.9 - 35.1
   - 经度范围：135.6 - 135.9

### 匹配逻辑
1. **精确匹配**：坐标在某个地区范围内
2. **最近匹配**：计算到各地区中心的距离，选择最近的
3. **默认回退**：所有检测失败时使用大阪

## 隐私和安全

### 用户权限
- **明确的权限请求**：浏览器会显示地理位置权限请求
- **可拒绝**：用户可以拒绝定位请求，系统正常运行
- **不强制**：定位失败不影响核心功能

### 数据处理
- **仅检测用途**：坐标仅用于地区匹配，不存储
- **本地处理**：尽可能在前端处理，减少数据传输
- **日志记录**：仅记录检测结果，不记录具体坐标

## 性能优化

### 缓存策略
```tsx
{
  enableHighAccuracy: true,    // 高精度定位
  timeout: 10000,             // 10秒超时
  maximumAge: 300000          // 5分钟缓存
}
```

### 错误恢复
- **超时处理**：10秒内完成定位，超时使用默认地区
- **权限拒绝**：优雅降级，不影响其他功能
- **网络错误**：API调用失败时使用客户端默认值

## 后续优化建议

1. **IP地理定位备用**：GPS定位失败时使用IP定位
2. **用户偏好记忆**：记住用户手动选择的地区
3. **更多地区支持**：扩展到更多城市和地区
4. **位置更新**：检测位置变化并提示用户更新地区

---

*功能完成时间：2025年1月26日*
*技术栈：React + Next.js + Geolocation API*
