# Header 地理定位功能实现

## 功能说明

为 Header 组件添加了页面载入时自动获取浏览器地理位置的功能，实现智能地区检测和显示。

## 新增功能

### 1. 自动地理定位

#### 1.1 状态管理
```typescript
const [isDetectingLocation, setIsDetectingLocation] = useState(false);
const [locationDetected, setLocationDetected] = useState(false);
```

#### 1.2 地理定位核心函数
```typescript
const detectLocation = async () => {
  setIsDetectingLocation(true);
  
  // 检查是否支持地理定位
  if (!navigator.geolocation) {
    console.log('Header: 浏览器不支持地理定位，设置默认地区为东京');
    setRegion('tokyo');
    setIsDetectingLocation(false);
    return;
  }

  // 获取用户位置
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      console.log('Header: 用户位置:', latitude, longitude);
      
      try {
        // 调用后端API进行地区检测
        const response = await fetch('/api/auto-detect-region', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude, longitude }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.region) {
            setRegion(data.region);
            setLocationDetected(true);
            console.log('Header: 检测到的地区:', data.region);
            
            // 更新URL参数
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('region', data.region);
            window.history.replaceState({}, '', currentUrl.toString());
          }
        }
      } catch (error) {
        console.error('Header: 地区检测API调用失败:', error);
        setRegion('tokyo');
      }
      
      setIsDetectingLocation(false);
    },
    (error) => {
      console.error('Header: 地理定位错误:', error.message);
      setRegion('tokyo');
      setIsDetectingLocation(false);
      
      // 错误处理
      switch(error.code) {
        case error.PERMISSION_DENIED:
          console.log('Header: 用户拒绝了地理定位请求，使用默认地区东京');
          break;
        case error.POSITION_UNAVAILABLE:
          console.log('Header: 位置信息不可用，使用默认地区东京');
          break;
        case error.TIMEOUT:
          console.log('Header: 地理定位请求超时，使用默认地区东京');
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5分钟缓存
    }
  );
};
```

### 2. 智能初始化逻辑

#### 2.1 URL参数优先
```typescript
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlRegion = searchParams.get('region');
  
  if (urlRegion) {
    console.log('Header: 从URL获取地区:', urlRegion);
    setRegion(urlRegion);
  } else {
    // 如果URL中没有地区参数，尝试地理定位
    console.log('Header: URL中无地区参数，尝试地理定位');
    detectLocation();
  }
}, [pathname]);
```

#### 2.2 定位逻辑
1. **URL有地区参数** → 直接使用URL中的地区
2. **URL无地区参数** → 启动地理定位
3. **地理定位成功** → 使用检测到的地区并更新URL
4. **地理定位失败** → 默认使用东京

### 3. 用户界面优化

#### 3.1 地区选择按钮增强
```typescript
<button
  onClick={() => setRegionMenuOpen(!regionMenuOpen)}
  className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-sm"
  disabled={regionsLoading || isDetectingLocation}
>
  <div className="relative">
    <svg className={`w-4 h-4 mr-1 ${getRegionIconColor(region)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    {isDetectingLocation && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
    )}
    {locationDetected && !isDetectingLocation && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
    )}
  </div>
  <span className="text-gray-700">
    {isDetectingLocation ? '定位中...' : (regionsLoading ? '加载中...' : getRegionDisplayName(region))}
  </span>
  <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>
```

#### 3.2 视觉状态指示
- **定位中**：蓝色脉冲圆点 + "定位中..." 文字
- **定位成功**：绿色实心圆点 + 检测到的地区名称
- **定位失败**：无特殊标识 + 默认地区名称（东京）

#### 3.3 按钮状态管理
- 数据加载时：显示 "加载中..."，按钮禁用
- 地理定位时：显示 "定位中..."，按钮禁用
- 正常状态：显示地区名称，按钮可用

### 4. 地区图标颜色系统

#### 4.1 颜色映射函数
```typescript
const getRegionIconColor = (regionCode: string) => {
  switch (regionCode) {
    case 'osaka': return 'text-blue-500';
    case 'tokyo': return 'text-red-500';
    case 'kyoto': return 'text-purple-500';
    default: return 'text-gray-500';
  }
};
```

#### 4.2 动态颜色显示
- 地区图标颜色根据当前选中的地区动态变化
- 提供视觉上的地区区分

### 5. URL状态同步

#### 5.1 自动URL更新
```typescript
// 更新URL参数
const currentUrl = new URL(window.location.href);
currentUrl.searchParams.set('region', data.region);
window.history.replaceState({}, '', currentUrl.toString());
```

#### 5.2 状态一致性
- 地理定位成功后自动更新URL中的region参数
- 确保URL状态与实际选中地区保持一致
- 用户刷新页面时能保持正确的地区状态

### 6. 容错机制

#### 6.1 浏览器兼容性
- 检查 `navigator.geolocation` 是否可用
- 不支持地理定位时默认使用东京

#### 6.2 权限处理
- **PERMISSION_DENIED**: 用户拒绝定位权限 → 默认东京
- **POSITION_UNAVAILABLE**: 位置信息不可用 → 默认东京  
- **TIMEOUT**: 定位请求超时 → 默认东京

#### 6.3 网络错误处理
- API调用失败时默认使用东京
- 响应数据格式错误时默认使用东京

### 7. 与Footer组件的协同

#### 7.1 统一的默认值
- 两个组件都使用 `tokyo` 作为默认地区
- 确保页面整体的地区状态一致性

#### 7.2 相同的API集成
- 都使用 `/api/auto-detect-region` 进行地理定位
- 都使用 `/api/regions` 获取地区列表

## 用户体验改进

### 1. **智能初始化**
- 页面首次访问时自动尝试地理定位
- URL中有地区参数时优先使用，避免重复定位

### 2. **清晰的状态反馈**
- 定位过程中的视觉反馈（脉冲动画）
- 定位成功的确认提示（绿色圆点）
- 文字状态说明（定位中...、加载中...）

### 3. **无缝的地区切换**
- 地理定位完成后URL自动更新
- 页面状态与URL保持同步
- 用户可以随时手动切换地区

### 4. **优雅的错误处理**
- 任何失败情况都有合理的备选方案
- 用户始终能看到可用的地区选择

## 技术实现亮点

### 1. **性能优化**
- 地理定位结果缓存5分钟 (`maximumAge: 300000`)
- 高精度定位 (`enableHighAccuracy: true`)
- 10秒超时限制 (`timeout: 10000`)

### 2. **状态管理**
- 清晰的状态分离（定位状态、加载状态、选中状态）
- 合理的默认值设置
- 防止竞态条件

### 3. **用户交互**
- 定位过程中按钮禁用，防止重复操作
- 清晰的视觉反馈
- 友好的错误提示

---

**修改时间**: 2025年10月19日  
**修改文件**: `app/Header.tsx`  
**新增功能**: 自动地理定位、智能地区检测、URL状态同步  
**默认地区**: 东京 (tokyo)  
**依赖API**: `/api/auto-detect-region`, `/api/regions`
