# TabBar

底部固定 Tab 栏组件，支持自定义图标、颜色、背景色，点击后通过 `switchTab` 跳转页面。

## Knowledge

### 导入

```tsx
import TabBar, { TabItem } from '@/components/tab-bar';
```

### TabItem 类型

```ts
export interface TabItem {
  key: string; // 唯一标识，与 currentTab 对比判断激活状态
  label: string; // 标签文字
  path: string; // switchTab 跳转路径（必须是 tabBar 页面路径）
  icon: React.ReactNode; // 未选中图标
  activeIcon: React.ReactNode; // 选中图标
}
```

### Props

| Prop              | 类型                     | 默认值              | 必填   | 说明                              |
| ----------------- | ------------------------ | ------------------- | ------ | --------------------------------- |
| `currentTab`      | `string`                 | —                   | **是** | 当前激活的 tab key                |
| `tabs`            | `TabItem[]`              | —                   | **是** | Tab 配置列表                      |
| `backgroundColor` | `string`                 | `'rgba(0,0,0,0.8)'` | 否     | 背景色（支持 rgba/hex）           |
| `textColor`       | `string`                 | `'#6b7280'`         | 否     | 未选中文字颜色                    |
| `activeTextColor` | `string`                 | `'#a855f7'`         | 否     | 选中文字颜色                      |
| `containerStyle`  | `React.CSSProperties`    | —                   | 否     | 覆盖最外层容器样式                |
| `onTabClick`      | `(tab: TabItem) => void` | —                   | 否     | 切换 tab 前的回调（先回调再跳转） |

### 内部行为

- 点击当前已激活的 tab 不触发任何操作
- 点击其他 tab：先执行 `onTabClick?.(tab)`，再调用 `switchTab({ url: tab.path })`
- 组件使用 `fixed bottom-0` 定位，内容区需留出底部安全距离

### 完整用法

```tsx
import TabBar, { TabItem } from '@/components/tab-bar';
import { SvgRender } from '@ray-js/ray';
import { useState } from 'react';
import homeSvg from '@/res/iconsvg';

const TABS: TabItem[] = [
  {
    key: 'home',
    label: '主页',
    path: '/pages/home/index',
    icon: <SvgRender source={homeSvg.home} className="w-6 h-6" style={{ color: '#6b7280' }} />,
    activeIcon: (
      <SvgRender source={homeSvg.home} className="w-6 h-6" style={{ color: '#a855f7' }} />
    ),
  },
  {
    key: 'scene',
    label: '场景',
    path: '/pages/scene/index',
    icon: <SvgRender source={homeSvg.scene} className="w-6 h-6" style={{ color: '#6b7280' }} />,
    activeIcon: (
      <SvgRender source={homeSvg.scene} className="w-6 h-6" style={{ color: '#a855f7' }} />
    ),
  },
];

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <View className="flex flex-col h-screen">
      <View className="flex-1 pb-16">{/* 页面内容，底部留出 TabBar 高度 */}</View>
      <TabBar
        currentTab={currentTab}
        tabs={TABS}
        backgroundColor="rgba(0,0,0,0.85)"
        activeTextColor="#a855f7"
        onTabClick={tab => setCurrentTab(tab.key)}
      />
    </View>
  );
}
```

### 实现参考

```tsx
// src/components/tab-bar.tsx
import React from 'react';
import { View, Text, switchTab } from '@ray-js/ray';

export interface TabItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

export interface TabBarProps {
  currentTab: string;
  tabs: TabItem[];
  backgroundColor?: string;
  textColor?: string;
  activeTextColor?: string;
  containerStyle?: React.CSSProperties;
  onTabClick?: (tab: TabItem) => void;
}

export default function TabBar({
  currentTab,
  tabs,
  backgroundColor = 'rgba(0,0,0,0.8)',
  textColor = '#6b7280',
  activeTextColor = '#a855f7',
  containerStyle,
  onTabClick,
}: TabBarProps) {
  const handleTabClick = (tab: TabItem) => {
    if (tab.key !== currentTab) {
      onTabClick?.(tab);
      switchTab({ url: tab.path });
    }
  };

  return (
    <View className="fixed bottom-0 left-0 right-0 z-50" style={containerStyle}>
      <View className="absolute inset-0 backdrop-blur-xl" style={{ backgroundColor }} />
      <View className="relative flex flex-row items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const isActive = tab.key === currentTab;
          return (
            <View
              key={tab.key}
              className="relative flex flex-col items-center justify-center px-4 py-2 rounded-2xl"
              onClick={() => handleTabClick(tab)}
            >
              <View className="mb-1">{isActive ? tab.activeIcon : tab.icon}</View>
              <Text
                className="text-xs font-medium"
                style={{ color: isActive ? activeTextColor : textColor }}
              >
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
```

## Constraints

- **Must**: 文件放置于 `src/components/tab-bar.tsx`
- **Must**: `path` 必须是已在 `routes.config.ts` 中 `tabBar.list` 注册的页面路径，否则 `switchTab` 会报错
- **Must**: 页面内容区底部需留出 TabBar 的高度（约 `pb-16`），避免内容被遮挡
- **Must**: 图标颜色通过 `icon` / `activeIcon` prop 传入时自行区分，组件不自动改色
- **Must not**: 将非 tabBar 页面路径传给 `path`（`switchTab` 只能跳转 tabBar 页面）
- **Must not**: 在 `SdmProvider` 未挂载前渲染（若图标内含 DP 相关逻辑）
