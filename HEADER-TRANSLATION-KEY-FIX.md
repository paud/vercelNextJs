# Header按钮多语言翻译键修复

## 修复时间
2025年10月19日

## 问题描述
Header组件中的按钮显示的是 "header.select" 而不是翻译后的文字，这是因为翻译键的路径和位置不正确。

## 问题根源
- Header组件使用 `useTranslations('Header')` 获取翻译函数
- 翻译键需要放在各语言文件的 `Header` 对象内
- 之前的翻译键被错误地放在了顶层或其他对象中

## 修复方案

### 1. 确认翻译函数作用域
```tsx
const t = useTranslations('Header');
```
这意味着所有翻译键都需要在 `Header` 对象内。

### 2. 重新组织翻译键结构

#### 中文翻译 (messages/zh.json)
```json
{
  "Header": {
    // ...existing keys...
    "selectRegion": "选择地区",
    "selectPrefecture": "选择都道府县",
    "selectCity": "选择市区町村",
    "selectWard": "选择区域",
    "select": "选择",
    "back": "返回",
    "cancel": "取消",
    "confirm": "确定",
    "loading": "加载中...",
    "loadingRegions": "加载地区数据中...",
    "locating": "定位中...",
    "noData": "暂无数据",
    "population": "人口",
    "capital": "首府",
    "viewSubLevel": "查看下级"
  }
}
```

#### 英文翻译 (messages/en.json)
```json
{
  "Header": {
    // ...existing keys...
    "selectRegion": "Select Region",
    "selectPrefecture": "Select Prefecture",
    "selectCity": "Select City",
    "selectWard": "Select Ward",
    "select": "Select",
    "back": "Back",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "loading": "Loading...",
    "loadingRegions": "Loading regions...",
    "locating": "Locating...",
    "noData": "No data available",
    "population": "Population",
    "capital": "Capital",
    "viewSubLevel": "View Sub Level"
  }
}
```

#### 日文翻译 (messages/ja.json)
```json
{
  "Header": {
    // ...existing keys...
    "selectRegion": "地域を選択",
    "selectPrefecture": "都道府県を選択",
    "selectCity": "市区町村を選択",
    "selectWard": "区域を選択",
    "select": "選択",
    "back": "戻る",
    "cancel": "キャンセル",
    "confirm": "確定",
    "loading": "読み込み中...",
    "loadingRegions": "地域データを読み込み中...",
    "locating": "位置特定中...",
    "noData": "データがありません",
    "population": "人口",
    "capital": "首都",
    "viewSubLevel": "下位レベルを表示"
  }
}
```

### 3. 清理重复翻译键
- 移除了顶层的重复翻译键
- 移除了其他对象（如 `RegionSelect`, `Common`, `Region`）中的重复键
- 统一将所有Header相关的翻译键放在 `Header` 对象内

## 修复内容

### Header组件中的翻译使用
- ✅ `t('selectRegion')` - 对话框标题
- ✅ `t('selectPrefecture')` - 对话框标题
- ✅ `t('selectCity')` - 对话框标题
- ✅ `t('selectWard')` - 对话框标题
- ✅ `t('select')` - 选定按钮
- ✅ `t('loading')` - 通用加载状态
- ✅ `t('loadingRegions')` - 地区数据加载状态
- ✅ `t('locating')` - 定位状态
- ✅ `t('noData')` - 暂无数据提示

## 测试结果

### 中文模式
- ✅ 按钮显示"选择"而不是"header.select"
- ✅ 对话框标题正确显示中文
- ✅ 所有状态提示正确显示中文

### 英文模式
- ✅ 按钮显示"Select"
- ✅ 对话框标题正确显示英文
- ✅ 所有状态提示正确显示英文

### 日文模式
- ✅ 按钮显示"選択"
- ✅ 对话框标题正确显示日文
- ✅ 所有状态提示正确显示日文

## 经验总结
1. **翻译键路径重要性**：必须确保翻译键放在正确的对象路径下
2. **避免重复键**：同一个翻译键不应该在多个位置定义
3. **命名空间一致性**：组件的翻译函数和翻译键路径必须一致
4. **测试多语言**：每次修改后都应该测试所有语言模式

这次修复确保了Header组件的所有文字都能正确进行多语言切换，用户体验得到了显著改善。
