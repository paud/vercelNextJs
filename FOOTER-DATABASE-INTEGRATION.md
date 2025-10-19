# Footer 地区数据库集成改进

## 功能说明

将 Footer 组件的地区功能从硬编码改为从数据库动态获取，支持多语言显示和扩展性。

## 修改内容

### 1. API 层改进

#### 1.1 `/api/auto-detect-region` 修改
- **POST 方法**：已使用数据库获取地区数据
- **GET 方法**：修改为从数据库获取地区数据，而不是硬编码
- **返回数据增强**：包含完整的地区信息（id, code, nameJa, nameEn, nameZh）

```typescript
// 从数据库获取所有地区及其对应的Prefecture数据
const regions = await prisma.region.findMany({
  include: {
    Prefecture: {
      include: {
        City: true
      }
    }
  }
});
```

#### 1.2 `/api/regions` API
- 已存在的 API，用于获取所有地区列表
- 支持多语言地区名称
- 按 code 字段排序

### 2. Footer 组件改进

#### 2.1 动态地区数据获取
```typescript
const [availableRegions, setAvailableRegions] = useState<any[]>([]);

// 获取可用地区列表
useEffect(() => {
  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setAvailableRegions(data.regions || []);
        console.log('获取到地区数据:', data.regions?.length || 0, '个');
      }
    } catch (error) {
      console.error('获取地区列表错误:', error);
    }
  };
  fetchRegions();
}, []);
```

#### 2.2 智能地区名称显示
```typescript
const getRegionDisplayName = (region: string) => {
  // 首先尝试从数据库获取的地区数据中查找
  const regionData = availableRegions.find(r => r.code === region);
  if (regionData) {
    switch (locale) {
      case 'zh': return regionData.nameZh || regionData.nameEn || regionData.nameJa;
      case 'en': return regionData.nameEn || regionData.nameJa;
      case 'ja': return regionData.nameJa;
      default: return regionData.nameEn || regionData.nameJa;
    }
  }
  
  // 如果数据库中没有找到，使用翻译文件的备选方案
  switch (region) {
    case 'osaka': return t('region_osaka');
    case 'tokyo': return t('region_tokyo');
    case 'kyoto': return t('region_kyoto');
    default: return t('region');
  }
};
```

#### 2.3 增强的地理定位处理
- 处理从 API 返回的 `regionData` 对象
- 更好的错误处理和日志记录
- 支持数据库返回的地区详细信息

### 3. 数据库结构支持

Footer 现在完全依赖数据库中的 Region 表：
- **id**: 主键
- **code**: 地区代码（如 'tokyo', 'osaka', 'kyoto'）
- **nameJa**: 日文名称
- **nameEn**: 英文名称  
- **nameZh**: 中文名称
- **Prefecture**: 关联的都道府县数据
- **City**: 关联的城市数据

### 4. 多语言支持

根据当前语言环境 (`locale`) 自动选择对应的地区名称：
- **中文 (zh)**: 优先显示 `nameZh`，备选 `nameEn` 或 `nameJa`
- **英文 (en)**: 优先显示 `nameEn`，备选 `nameJa`
- **日文 (ja)**: 显示 `nameJa`
- **其他**: 默认显示 `nameEn` 或 `nameJa`

### 5. 容错机制

1. **API 失败**: 回退到翻译文件中的硬编码地区名称
2. **数据库为空**: 使用默认的地区翻译
3. **网络错误**: 优雅降级，仍能显示基本地区信息

## 优势

### 1. **可扩展性**
- 无需修改代码即可在数据库中添加新地区
- 支持任意数量的地区和多语言名称

### 2. **维护性**
- 地区数据集中管理在数据库中
- 代码与数据分离，便于维护

### 3. **性能**
- 地区列表在组件初始化时一次性加载
- 地理定位 API 返回完整地区信息，减少额外查询

### 4. **用户体验**
- 自动根据用户语言环境显示对应的地区名称
- 即使在某些语言缺失的情况下也有备选显示
- 地区在导航上始终可见，包括默认的东京地区

## 测试验证

1. **地区 API 测试**: `GET /api/regions` 返回所有数据库中的地区
2. **定位 API 测试**: `GET /api/auto-detect-region?lat=35.6762&lng=139.6503` 返回带数据库信息的地区数据
3. **多语言测试**: 在 `/zh`、`/en`、`/ja` 路径下地区名称正确显示
4. **容错测试**: 网络错误时仍能显示基本地区信息

## 下一步扩展

1. **位置范围数据库化**: 将坐标范围也存储在数据库中，而不是硬编码
2. **缓存优化**: 对地区数据进行缓存，提高性能
3. **用户偏好**: 记住用户手动选择的地区偏好
4. **更多地区**: 通过数据库添加更多日本地区支持

---

**修改时间**: 2025年10月19日  
**修改文件**: 
- `app/Footer.tsx`
- `app/api/auto-detect-region/route.ts`
- `app/api/regions/route.ts` (已存在)

**依赖**: Prisma + PostgreSQL 数据库中的 Region 表
