# Header 地区选择默认东京设置

## 功能说明

修改 Header 组件的地区选择功能，确保在任何情况下（包括定位失败、数据库获取失败等）都默认设置为东京地区。

## 修改内容

### 1. 默认地区设置
```typescript
const [region, setRegion] = useState('tokyo'); // 默认东京
```
- 组件初始化时默认地区设置为东京
- 确保用户始终能看到合理的地区选择

### 2. URL参数读取逻辑
```typescript
// 从URL参数读取地区设置
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlRegion = searchParams.get('region');
  
  if (urlRegion) {
    console.log('从URL获取地区:', urlRegion);
    setRegion(urlRegion);
  } else {
    // 如果URL中没有地区参数，确保默认为东京
    console.log('URL中无地区参数，设置默认地区为东京');
    setRegion('tokyo');
  }
}, [pathname]);
```

### 3. 数据库获取失败的容错处理
```typescript
// 获取可用地区列表，失败时确保默认为东京
useEffect(() => {
  const fetchRegions = async () => {
    setRegionsLoading(true);
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setAvailableRegions(data.regions || []);
        
        // 如果当前地区不在可用地区列表中，设置为东京
        const currentRegionExists = data.regions?.some((r: any) => r.code === region);
        if (!currentRegionExists) {
          console.log('当前地区不在数据库中，设置为东京');
          setRegion('tokyo');
        }
      } else {
        console.error('Header获取地区列表失败，设置默认地区为东京');
        setRegion('tokyo');
      }
    } catch (error) {
      console.error('Header获取地区列表错误:', error);
      console.log('获取地区失败，设置默认地区为东京');
      setRegion('tokyo');
    } finally {
      setRegionsLoading(false);
    }
  };

  fetchRegions();
}, [region]);
```

### 4. 地区名称显示备选机制
```typescript
const getRegionDisplayName = (regionCode: string) => {
  const regionData = availableRegions.find(r => r.code === regionCode);
  if (regionData) {
    switch (locale) {
      case 'zh': return regionData.nameZh || regionData.nameEn || regionData.nameJa;
      case 'en': return regionData.nameEn || regionData.nameJa;
      case 'ja': return regionData.nameJa;
      default: return regionData.nameEn || regionData.nameJa;
    }
  }
  
  // 如果数据库中没有找到，使用翻译文件的备选方案，默认显示东京
  switch (regionCode) {
    case 'osaka': return t('region_osaka');
    case 'tokyo': return t('region_tokyo');
    case 'kyoto': return t('region_kyoto');
    default: return t('region_tokyo'); // 默认显示东京
  }
};
```

## 容错机制

### 1. **初始化失败**
- 组件状态默认为 `'tokyo'`
- 即使所有数据获取失败，用户也能看到东京地区

### 2. **URL参数缺失**
- 如果URL中没有 `?region=` 参数，自动设置为东京
- 确保用户访问根路径时有默认地区

### 3. **数据库连接失败**
- API调用失败时，设置地区为东京
- 网络错误时，设置地区为东京
- 响应错误时，设置地区为东京

### 4. **地区数据不存在**
- 如果当前地区不在数据库的可用地区列表中，切换到东京
- 防止显示无效或已删除的地区

### 5. **翻译文件备选**
- 数据库数据缺失时，回退到翻译文件
- 未知地区代码时，默认显示东京的翻译

## 用户体验改进

### 1. **一致性**
- Header 和 Footer 都默认使用东京地区
- 确保整个应用的地区显示一致

### 2. **可靠性**
- 无论什么错误情况，用户都能看到有效的地区选择
- 避免显示空白或错误的地区信息

### 3. **智能回退**
- 多层级的备选机制
- 从数据库 → 翻译文件 → 硬编码默认值

### 4. **调试友好**
- 详细的控制台日志记录
- 清楚标识每种失败情况的处理方式

## 测试场景

1. **正常情况**: 数据库连接正常，地区数据正确显示
2. **URL参数测试**: `/zh?region=osaka` 正确显示大阪，`/zh` 默认显示东京
3. **数据库失败**: 模拟API错误，确保默认显示东京
4. **无效地区**: `?region=invalid` 时自动切换到东京
5. **多语言测试**: 在中英日三种语言下都正确显示地区名称

## 日志输出示例

```
从URL获取地区: osaka
Header获取到地区数据: 7 个
当前地区不在数据库中，设置为东京
Header获取地区列表失败，设置默认地区为东京
获取地区失败，设置默认地区为东京
URL中无地区参数，设置默认地区为东京
```

## 与Footer的协同

- Header 和 Footer 都使用相同的默认地区逻辑（东京）
- 都从同一个 `/api/regions` 获取地区数据
- 地区选择变更时会更新URL参数，两个组件都能响应

---

**修改时间**: 2025年10月19日  
**修改文件**: `app/Header.tsx`  
**默认地区**: 东京 (tokyo)  
**容错级别**: 多层级备选机制
