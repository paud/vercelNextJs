# Header 地区选择对话框顶部路径显示功能

## 功能描述
在地区选择对话框的顶部显示当前选择的层级路径，如"中国-广岛-福山"，让用户清楚地看到已选择的地区层级结构。

## 实现方案

### 1. 路径构建函数
添加了 `getSelectionPath()` 函数来构建当前选择的地区路径：

```tsx
// 构建选择路径显示
const getSelectionPath = () => {
  const pathParts = [];
  
  if (selectedRegion) {
    pathParts.push(getLocationName(selectedRegion));
  }
  
  if (selectedPrefecture) {
    pathParts.push(getLocationName(selectedPrefecture));
  }
  
  if (selectedCity) {
    pathParts.push(getLocationName(selectedCity));
  }
  
  return pathParts.join(' - ');
};
```

### 2. 对话框头部改进
修改了对话框头部结构，在标题下方添加路径显示区域：

```tsx
{/* 对话框头部 - 手机端优化 */}
<div className="border-b">
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center">
      {currentLevel !== 'region' && (
        <button onClick={handleBackLevel} className="mr-3 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h3 className="text-lg font-semibold text-gray-800">
        {currentLevel === 'region' && t('selectRegion')}
        {currentLevel === 'prefecture' && t('selectPrefecture')}
        {currentLevel === 'city' && t('selectCity')}
        {currentLevel === 'ward' && t('selectWard')}
      </h3>
    </div>
    {/* 关闭按钮 */}
    <button onClick={() => setRegionMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  
  {/* 选择路径显示 */}
  {getSelectionPath() && (
    <div className="px-4 pb-3">
      <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium">{getSelectionPath()}</span>
      </div>
    </div>
  )}
</div>
```

## 功能特点

### 1. 动态路径显示
- **智能显示**：只在有选择内容时显示路径
- **层级结构**：按照"地区 - 都道府县 - 市区町村"的顺序显示
- **实时更新**：随着用户选择自动更新路径内容

### 2. 多语言支持
- **本地化名称**：使用 `getLocationName()` 函数获取对应语言的地区名称
- **动态语言切换**：支持中文、英文、日文三种语言
- **智能回退**：当某种语言名称不存在时，自动回退到其他可用语言

### 3. 视觉设计
- **清晰标识**：使用地图图标表示这是地区路径
- **柔和背景**：灰色背景（`bg-gray-50`）突出显示路径信息
- **适当间距**：合理的内边距确保良好的视觉效果
- **字体样式**：中等粗细（`font-medium`）让路径信息突出但不刺眼

## 用户体验改进

### 1. 导航清晰度
- **当前位置**：用户始终知道自己在地区选择树中的位置
- **选择历史**：显示已完成的选择，避免混淆
- **层级关系**：清楚地展示地区的层级关系

### 2. 操作反馈
- **即时反馈**：每次选择后立即更新路径显示
- **选择确认**：用户可以看到已选择的内容
- **错误预防**：减少用户选择错误的可能性

### 3. 移动端优化
- **紧凑布局**：在有限的屏幕空间内有效展示信息
- **触摸友好**：保持良好的触摸体验
- **响应式设计**：适应不同尺寸的移动设备

## 显示示例

### 中文显示
- 只选择地区：`中国`
- 选择到都道府县：`中国 - 广岛县`
- 选择到市：`中国 - 广岛县 - 福山市`

### 英文显示
- 只选择地区：`Japan`
- 选择到都道府县：`Japan - Tokyo Prefecture`
- 选择到市：`Japan - Tokyo Prefecture - Shibuya City`

### 日文显示
- 只选择地区：`日本`
- 选择到都道府县：`日本 - 東京都`
- 选择到市：`日本 - 東京都 - 渋谷区`

## 技术实现要点

### 1. 状态管理
- **选择状态跟踪**：正确维护 `selectedRegion`、`selectedPrefecture`、`selectedCity` 状态
- **路径同步**：确保路径显示与实际选择状态同步
- **清理机制**：在重置或关闭对话框时正确清理状态

### 2. 性能优化
- **条件渲染**：只在有路径内容时才渲染路径显示组件
- **函数复用**：复用现有的 `getLocationName()` 函数
- **最小重渲染**：避免不必要的组件重新渲染

### 3. 错误处理
- **数据验证**：检查选择项是否存在必要的名称字段
- **优雅降级**：当某些数据缺失时提供合理的回退选项
- **边界情况**：处理空数据、网络错误等边界情况

## 后续扩展可能

### 1. 可点击路径
- 用户可以点击路径中的某一级直接跳转到该级别
- 面包屑导航功能

### 2. 路径历史
- 保存用户最近选择的路径
- 快速选择功能

### 3. 自定义分隔符
- 支持不同语言的路径分隔符（如中文用"·"，英文用"-"）
- 更本地化的显示风格

---
*功能完成日期: 2025年10月19日*
