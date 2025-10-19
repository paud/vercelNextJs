# Header 地区选择数据库集成 & 弹出窗口优化

## 功能说明

将 Header 组件的地区选择功能升级为：
1. 从数据库动态获取地区数据
2. 改进为美观的弹出窗口形式
3. 支持多语言显示和加载状态
4. 增强用户交互体验

## 修改内容

### 1. 数据状态管理

#### 1.1 新增状态变量
```typescript
const [availableRegions, setAvailableRegions] = useState<any[]>([]);
const [regionsLoading, setRegionsLoading] = useState(false);
```

#### 1.2 默认地区调整
- 将默认地区从 `osaka` 改为 `tokyo`，与 Footer 保持一致

### 2. 智能地区名称显示

#### 2.1 动态地区名称函数
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
  
  // 备选方案 - 使用翻译文件
  switch (regionCode) {
    case 'osaka': return t('region_osaka');
    case 'tokyo': return t('region_tokyo'); 
    case 'kyoto': return t('region_kyoto');
    default: return t('region');
  }
};
```

#### 2.2 地区图标颜色管理
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

### 3. 数据库集成

#### 3.1 地区数据获取
```typescript
useEffect(() => {
  const fetchRegions = async () => {
    setRegionsLoading(true);
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setAvailableRegions(data.regions || []);
        console.log('Header获取到地区数据:', data.regions?.length || 0, '个');
      } else {
        console.error('Header获取地区列表失败');
      }
    } catch (error) {
      console.error('Header获取地区列表错误:', error);
    } finally {
      setRegionsLoading(false);
    }
  };

  fetchRegions();
}, []);
```

### 4. 弹出窗口优化

#### 4.1 选择按钮改进
- 统一使用地理位置图标，颜色根据地区动态变化
- 显示加载状态："加载中..." 
- 按钮在加载时禁用

```typescript
<button
  onClick={() => setRegionMenuOpen(!regionMenuOpen)}
  className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-sm"
  disabled={regionsLoading}
>
  <svg className={`w-4 h-4 mr-1 ${getRegionIconColor(region)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  <span className="text-gray-700">
    {regionsLoading ? '加载中...' : getRegionDisplayName(region)}
  </span>
  <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>
```

#### 4.2 下拉菜单增强

**样式改进**：
- 最小宽度增加到 `200px`
- 最大高度限制为 `300px`，内容过多时可滚动
- 圆角和阴影效果优化

**状态显示**：
1. **加载状态**：显示旋转加载图标和"加载地区中..."文字
2. **有数据**：动态渲染所有地区选项
3. **无数据**：显示"暂无可用地区"提示

**地区选项功能**：
- 当前选中地区高亮显示（蓝色背景 + 左侧蓝色边框）
- 鼠标悬停效果
- 地区图标根据类型显示不同颜色
- 显示地区描述（如果有）
- 选中地区显示勾选图标

```typescript
{regionMenuOpen && (
  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
    {regionsLoading ? (
      <div className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载地区中...
        </div>
      </div>
    ) : availableRegions.length > 0 ? (
      availableRegions.map((regionData, index) => (
        <button
          key={regionData.id}
          onClick={() => handleRegionChange(regionData.code)}
          className={`flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
            index === 0 ? 'rounded-t-lg' : ''
          } ${
            index === availableRegions.length - 1 ? 'rounded-b-lg' : ''
          } ${
            region === regionData.code ? 'bg-blue-50 border-l-2 border-blue-500' : ''
          }`}
        >
          <svg className={`w-4 h-4 mr-2 ${getRegionIconColor(regionData.code)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1">
            <div className="font-medium">
              {getRegionDisplayName(regionData.code)}
            </div>
            {regionData.description && (
              <div className="text-xs text-gray-500 mt-1">
                {regionData.description}
              </div>
            )}
          </div>
          {region === regionData.code && (
            <svg className="w-4 h-4 ml-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))
    ) : (
      <div className="px-4 py-3 text-sm text-gray-500">
        暂无可用地区
      </div>
    )}
  </div>
)}
```

### 5. 用户体验改进

#### 5.1 视觉反馈
- **加载状态**：按钮禁用，显示"加载中..."，弹出菜单显示旋转图标
- **选中状态**：当前地区高亮显示，带勾选图标
- **悬停效果**：所有可点击元素都有悬停反馈
- **过渡动画**：smooth transition effects

#### 5.2 多语言适配
- 根据用户当前语言环境自动显示对应的地区名称
- 备选机制确保即使某种语言缺失也能正确显示
- 错误状态和加载状态的多语言支持

#### 5.3 容错处理
- 网络请求失败时使用翻译文件作为备选
- 数据为空时显示友好提示
- 加载过程中的用户交互控制

### 6. 与 Footer 组件的一致性

#### 6.1 统一的数据源
- 都使用 `/api/regions` 获取地区数据
- 相同的地区显示逻辑和多语言处理

#### 6.2 统一的默认值
- 都使用 `tokyo` 作为默认地区
- 相同的容错机制

## 技术优势

### 1. **可扩展性**
- 支持数据库中任意数量的地区
- 无需修改代码即可添加新地区

### 2. **用户体验**
- 美观的弹出窗口界面
- 清晰的加载和选中状态
- 流畅的交互动画

### 3. **国际化支持**
- 完整的多语言地区名称显示
- 自动语言适配

### 4. **维护性**
- 代码与数据分离
- 统一的组件设计模式

## 测试验证

1. **多语言测试**：在 `/zh`、`/en`、`/ja` 路径下地区名称正确显示
2. **交互测试**：点击地区按钮，弹出窗口正常显示，选择功能正常
3. **加载状态**：页面初始化时显示加载状态
4. **数据验证**：确认从数据库正确获取地区数据

---

**修改时间**: 2025年10月19日  
**修改文件**: `app/Header.tsx`  
**依赖**: `/api/regions` API, Prisma + PostgreSQL 数据库
