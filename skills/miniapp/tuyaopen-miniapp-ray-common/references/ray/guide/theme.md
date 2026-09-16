# 主题适配 (theme)

[AI-generated summary: 本文档介绍了Tuya Miniapp/Ray框架中的主题系统实现,包括应用级主题变量配置、系统主题监听和CSS变量适配。覆盖内容：themeLocation,theme.json,light/dark主题,global.config.ts,routes.config.ts,页面配置,getSystemInfo,useAppEvent,onThemeChange,CSS变量,--app-B1,--app-M1,color-scheme,选择器适配,样式表适配]

## 应用配置

### 一、相关配置

#### 操作流程

1. 在 `src/global.config.ts` 中配置 `themeLocation`，指定变量配置文件 `theme.json` 路径，例如：在 src 目录下新增 `theme.json`，需要配置 `"themeLocation":"theme.json"`。
2. 在 `src/theme.json` 中定义相关变量。
3. 在 `src/global.config.ts` 全局配置或 `src/routes.config.ts` 路由配置或 `src/pages/${pageId}/index.config.ts` 页面配置中以 @ 开头引用变量。

支持通过变量配置的一共有以下三大类：

#### 全局配置

- 全局配置文件 `src/global.config.ts` 下 `tuya.window` 对象：
  > 详见 [小程序配置-app.json 全局配置#window](/cn/miniapp/develop/miniapp/framework/app/app-json#window)
  - navigationBarBackgroundColor
  - navigationBarTextStyle
  - backgroundColor
  - backgroundTextStyle
  - backgroundColorTop
  - backgroundColorBottom

#### 路由配置

- 路由配置文件 `src/routes.config.ts` 下导出的 `tabBar` 对象：
  > 详见 [小程序配置-app.json 全局配置#tabbar](/cn/miniapp/develop/miniapp/framework/app/app-json#tabbar)
  - color
  - selectedColor
  - backgroundColor
  - borderStyle
  - list
    - iconPath
    - selectedIconPath

#### 页面配置

- 页面配置文件 `src/pages/${pageId}/index.config.ts` 下导出的对象：
  > 详见 [小程序页面-页面配置](/cn/miniapp/develop/miniapp/framework/page/json#配置项)
  - backgroundColor
  - backgroundTextStyle
  - navigationBarBackgroundColor
  - navigationBarTextStyle

### 二、变量配置文件

`theme.json` 用于颜色主题相关的变量定义，需要先在 `themeLocation` 中配置 `theme.json` 的路径，否则无法读取变量配置。

配置文件须包含以下属性：

| 属性  | 类型   | 必填 | 描述                 |
| ----- | ------ | ---- | -------------------- |
| light | object | 是   | 浅色模式下的变量定义 |
| dark  | object | 是   | 深色模式下的变量定义 |

light 和 dark 下均可以 `key: value` 的方式定义变量名和值，例如：

```json
{
  "light": {
    "navBgColor": "#F6F7FB",
    "navTxtStyle": "black",
    "bgColor": "rgba(0, 0, 0, 0.7)",
    "setNavBgColor": "#FFFFFF",
    "setBgColor": "#f5f5f5",
    "tabFontColor": "#000000",
    "tabSelectedColor": "#3cc51f",
    "tabBgColor": "#ffffff",
    "tabBorderStyle": "black"
  },
  "dark": {
    "navBgColor": "#F6F7FB",
    "navTxtStyle": "black",
    "bgColor": "rgba(0, 0, 0, 0.7)",
    "setNavBgColor": "#FFFFFF",
    "setBgColor": "#f5f5f5",
    "tabFontColor": "#ffffff",
    "tabSelectedColor": "#51a937",
    "tabBgColor": "#191919",
    "tabBorderStyle": "white"
  }
}
```

完成定义后，可在全局配置或页面配置的相关属性中以 `@` 开头引用，例如：

#### 全局配置接入

```typescript
// src/global.config.ts
import { GlobalConfig } from '@ray-js/types';

export const tuya = {
  themeLocation: 'theme.json',
  window: {
    backgroundColor: '@bgColor',
    navigationBarTitleText: 'Title',
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTextStyle: '@navTxtStyle',
  },
};

const globalConfig: GlobalConfig = {
  basename: '',
};

export default globalConfig;
```

#### 路由配置接入

```typescript
// src/routes.config.ts
import { Routes, TabBar } from '@ray-js/types';

export const routes: Routes = [
  {
    route: '/',
    path: '/pages/home/index',
    name: 'Home',
  },
  {
    route: '/history',
    path: '/pages/history/index',
    name: 'History',
  },
  {
    route: '/setting',
    path: '/pages/setting/index',
    name: 'Setting',
  },
];

export const tabBar: TabBar = {
  textColor: '@tabFontColor',
  selectedColor: '@tabSelectedColor',
  backgroundColor: '@tabBgColor',
  borderStyle: '@tabBorderStyle' as 'white' | 'black',
  list: [
    {
      text: 'Home',
      icon: '/tabBar/home.png', // 注意此处的 icon 需要在 public/tabBar/home.png 下存在
      route: '/',
      activeIcon: '/tabBar/home-active.png', // 注意此处的 icon 需要在 public/tabBar/home-active.png 下存在
      pagePath: '/pages/home/index',
    },
    {
      text: 'History',
      icon: '/tabBar/history.png',
      route: '/history',
      activeIcon: '/tabBar/history-active.png',
      pagePath: '/pages/history/index',
    },
    {
      text: 'Setting',
      icon: '/tabBar/setting.png',
      route: '/setting',
      activeIcon: '/tabBar/setting-active.png',
      pagePath: '/pages/setting/index',
    },
  ],
};
```

#### 页面配置接入

```typescript
// src/pages/home/index.config.ts
export default {
  backgroundColor: '@bgColor',
  navigationBarBackgroundColor: '@navBgColor',
  navigationBarTextStyle: '@navTxtStyle',
  navigationBarTitleText: 'Home',
  disableScroll: true,
};

```

配置完成后，Ray 框架会自动根据系统主题，为小程序展示对应主题下的颜色。

### 三、获取当前系统主题

`getSystemInfo` 或 `getSystemInfoSync` 的返回结果中会包含 theme 属性，值为 light 或 dark。

### 四、监听主题切换事件

可通过 `useAppEvent` 监听主题切换事件，如下代码所示：

```jsx | sandbox previewTitle="监听主题切换事件"
import React from 'react';
import { Text, View, useAppEvent } from '@ray-js/ray';

export default function App() {
  useAppEvent('onThemeChange', data => {
    console.log('这个 hook 等同于 onThemeChange', data);
  });

  return (
    <View>
      <Text>切换系统主题后查看日志输出</Text>
    </View>
  );
}
```
## 主题色变量

### 一. 简介

小程序主题色是指小程序的主要色调，主要用于小程序的背景色、文字颜色、按钮颜色等。**主题色随着 App 配置而变化**，同时支持 light 和 dark 两种主题色。 开发者无需关心主题色的变化。

### 二. 主题色

主题色值通过 CSS 变量的方式提供，开发者可在 CSS 中使用变量，在不同主题下，变量值会自动变化。

### 三. 主题色变量

| 变量名   | 含义              |
| -------- |-----------------|
| --app-B1 | 主背景色            |
| --app-B2 | 头部导航背景          |
| --app-B3 | 卡片背景            |
| --app-B4 | 弹窗背景            |
| --app-B5 | 底部导航背景          |
| --app-B6 | 列表背景            |
| --app-M1 | 主色、按钮背景         |
| --app-M2 | 辅色 1(错误/警告/危险)  |
| --app-M3 | 辅色 2 (成功/开关/推荐) |
| --app-M4 | 辅色 3 (提示/引导)    |
| --app-M5 | Tab 选中色         |

### 四. 文本色扩展

在对应的主题色下，文本色扩展了 8 种，开发者可根据需要使用。 格式为 `--app-${key}-N${level}`，其中 level 为 1 ~ 8 的数字。

#### 在样式文件中使用

```less
/* src/app.less */
.app {
  background-color: var(--app-B1);
  color: var(--app-B1-N1);
}
```

#### 在配置中使用

- `src/global.config.ts` 全局配置文件
- `src/routers.config.ts` 路由配置文件
- `src/pages/${pageId}/index.config.ts` 页面配置文件中，均可以使用主题色变量。

```typescript
// src/global.config.ts
import { GlobalConfig } from '@ray-js/types';

export const tuya = {
  themeLocation: 'theme.json',
  window: {
    backgroundColor: '--app-B1',
    navigationBarTitleText: 'Title',
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTextStyle: '@navTxtStyle',
  },
};

const globalConfig: GlobalConfig = {
  basename: '',
};

export default globalConfig;

```

### 五. 主题色小程序

扫码体验主题色小程序：
## 样式表适配

通过对样式名或环境变量的适配，可以实现主题跟随切换。

### 一、样式名适配

`less` 中，支持通过选择器 `theme='dark' | 'light'` 去切换主题。

```css
:root {
  --main-bg-color: rgb(255, 255, 255); /* 浅色背景 */
  --main-text-color: rgb(54, 54, 54); /* 深色文字 */
}

:root[theme='dark'] {
  --main-bg-color: rgb(47, 58, 68); /* 深色背景 */
  --main-text-color: rgb(197, 197, 197); /* 浅色文字 */
}
```

### 二、CSS 环境适配

如果您想要自定义主题色，可以通过 `app.less` 内声明：

```css
page {
  color-scheme: light;
  --custom-color: #ff0000;
}
@media (prefers-color-scheme: dark) {
  page {
    color-scheme: dark;
    --custom-color: #0000ff;
  }
}
```
