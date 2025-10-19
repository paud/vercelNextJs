# 地区选择对话框最终设计

## 设计日期
2025年10月19日

## 最终功能特性

### 1. 对话框布局
- **位置**: 屏幕居中显示
- **尺寸**: `max-w-md max-h-[80vh]`
- **样式**: 圆角卡片 `rounded-2xl`，阴影 `shadow-2xl`
- **背景**: 半透明黑色遮罩 `bg-black bg-opacity-50`

### 2. 顶部标题栏
```tsx
<div className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center">
    {/* 返回按钮（非顶级时显示） */}
    <button onClick={handleBackLevel}>←</button>
    {/* 标题 */}
    <h3>选择地区/选择都道府县/选择市区町村/选择区域</h3>
  </div>
  <div className="flex items-center space-x-2">
    {/* 选定按钮 - 绿色 */}
    <button className="bg-green-500">选定</button>
    {/* 关闭按钮 */}
    <button onClick={close}>×</button>
  </div>
</div>
```

### 3. 内容区域
- **滚动列表**: 显示当前级别的所有选项
- **项目样式**: 卡片式，悬停效果
- **交互**: 点击项目进入下一级
- **指示器**: 有子级别的项目显示箭头

### 4. 交互逻辑

#### 选定按钮功能
- **位置**: 右上角，绿色背景
- **功能**: 选择当前显示级别
- **逻辑**: 
  ```javascript
  handleCurrentLevelSelection() {
    // 获取当前选择的项目
    // 构建完整地区路径
    // 更新显示和URL
    // 关闭对话框
  }
  ```

#### 点击外部关闭
- **触发区域**: 对话框外的遮罩区域
- **实现**: `onClick={handleOutsideClick}`
- **逻辑**: 检查点击目标，如果是遮罩则关闭

#### 列表项点击
- **功能**: 进入下一级别
- **视觉反馈**: 悬停效果，点击反馈
- **导航**: 自动更新面包屑和当前级别

### 5. 按钮设计

#### 选定按钮
```tsx
<button
  onClick={handleCurrentLevelSelection}
  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium"
>
  {t('select')} // 选定
</button>
```

#### 关闭按钮
```tsx
<button
  onClick={() => setRegionMenuOpen(false)}
  className="p-1 hover:bg-gray-100 rounded-full"
>
  <svg className="w-6 h-6">×</svg>
</button>
```

### 6. 移除的元素
- ❌ **底部按钮栏**: 不再显示底部的取消/返回按钮
- ❌ **底部操作区**: 完全移除底部操作栏
- ❌ **多余按钮**: 只保留必要的选定和关闭按钮

### 7. 保留的功能
- ✅ **层级导航**: 返回上级功能
- ✅ **多语言支持**: 所有文字支持中英日
- ✅ **响应式设计**: 适配手机屏幕
- ✅ **加载状态**: 显示加载指示器
- ✅ **错误处理**: 无数据时的提示

### 8. 用户操作流程

1. **打开对话框**
   - 点击页面上的地区按钮
   - 对话框居中显示
   - 加载地区数据

2. **浏览地区**
   - 点击列表项进入下级
   - 使用返回按钮回到上级
   - 查看当前级别标题

3. **选择地区**
   - 点击右上角绿色"选定"按钮
   - 选择当前显示的级别
   - 自动关闭对话框并更新显示

4. **取消选择**
   - 点击右上角关闭按钮
   - 或点击对话框外部区域
   - 对话框关闭，不保存更改

### 9. 视觉特点
- **简洁设计**: 只有必要的元素
- **清晰层次**: 标题、内容、操作分离明确
- **直观操作**: 绿色选定按钮显眼易找
- **流畅动画**: 悬停和点击有平滑过渡

### 10. 技术实现
```typescript
// 关键函数
handleCurrentLevelSelection() // 处理选定按钮
handleOutsideClick()          // 处理外部点击
handleItemClick()             // 处理列表项点击
hasSubLevels()               // 检查是否有子级别
```

## 最终用户体验
- **操作简单**: 只需一个选定按钮完成选择
- **视觉清晰**: 绿色按钮突出，功能明确
- **交互直观**: 点击外部关闭，符合常见模式
- **响应快速**: 无多余元素，加载迅速
