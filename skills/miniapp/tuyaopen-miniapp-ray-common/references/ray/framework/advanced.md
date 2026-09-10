# 框架配置 (advanced)

## 跨端适配

### 文件同构

工程体系中，可通过文件后缀形式编写特定平台的逻辑。

- `.tsx` 通配
- `.web.tsx` Web 平台
- `.mini.tsx` 小程序平台
  - `.wechat.tsx` 微信小程序
  - `.tuya.tsx` 智能小程序
  <!-- - `.native.tsx` React Native 平台
  - `.ios.tsx` React Native iOS 端
  - `.android.tsx` React Native Android 端 -->

通过 CLI 命令 `--target` 参数，指定构建和调试的目标平台，然后按优先级（从下至上）加载对应的文件。

### 运行时

通过运行时环境变量区分。

```js
import {
  isWeb,
  isWechat,
  isTuya,
  isMiniProgram,
  isIOS,
  isAndroid,
  isNative,
} from '@ray-js/env';
```

示例：

```js
import { isTuya, isWechat } from '@ray-js/env';

export function say() {
  if (isTuya) {
    // 智能小程序逻辑
  } else if (isWechat) {
    // 微信小程序逻辑
  } else {
    //
  }
}
```
## 全局配置

全局配置描述项目运行时的配置信息。配置文件 `src/global.config.ts` 格式如下：

```ts
import { GlobalConfig } from '@ray-js/types';

// 微信小程序全局配置
export const wechat = {
  // 微信小程序全局配置
};

// 智能小程序全局配置
export const tuya = {};

// Web H5 全局配置
export const web = {};

// 通用配置
const globalConfig: GlobalConfig = {
  basename: '',
};

export default globalConfig;
```

- [微信小程序全局配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)
- [智能小程序全局配置](/cn/miniapp/develop/miniapp/framework/app/app-json)

当存在跨平台配置，则通过 `export const <$target> = {}` 的方式导出，应当总是默认导出通用配置。

### 通用配置

#### basename

类型：`string`

路由基准路径。
## 工程配置

用于声明工程编译时的配置信息。配置文件 `ray.config.ts` 位于工程根目录。

### resolveAlias

类型: `object`

模块别名，可用于构建时替换模块名，或缺省路径。默认支持 `{ '@': './src' }`。

```diff
- import Foo from '../../components/foo/index';
+ import Foo from '@/components/foo/index';
```

### define

> `@ray-js/cli` 1.5.26+

类型: `object`

定义全局变量，可用于构建时替换变量名。

```ts
const config: RayConfig = {
  define: {
    'process.env.NODE_ENV': 'production',
  },
};
```

### 示例

```ts
import {RayConfig} from '@ray-js/types';

const config: RayConfig = {
  resolveAlias: {
    '@': './src',
  },
  define: {
    'process.env.NODE_ENV': 'production',
  },
};

export default config;
```
## 路由配置

用于描述应用中页面的路径表达式及应用 TabBar（如有）的信息。配置文件 `src/routes.config.ts` 格式如下：

```ts
import { Routes, TabBar } from '@ray-js/types';

export const routes: Routes = [];
export const tabBar: TabBar = {};
```

### 路由对象

通过 `export const routes = []` 声明导出。一个完整的路由对象如下：

```js
{
  id: 'detail',
  route: '/detail/:uid',
  path: '/pages/detail/index',
}
```

注意: 路由以后面覆盖前面的优先级顺序匹配，开发者应自行保证路由的优先级关系。

#### id

路由唯一标识，可选。

#### route

路由路径表达式，必填。

> 表达式应符合 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 规范

#### path

路由页面组件地址，必填。

### tabBar 对象

用于描述应用 tabBar 导航栏菜单项。

通过 `export const tabBar = {}` 导出。

其约束如下：

```ts
type TabBar = {
  /**
   * 导航文本色
   */
  textColor?: string;
  /**
   * 导航文本高亮色
   */
  selectedColor?: string;
  /**
   * 导航栏背景色
   */
  backgroundColor?: string;
  /**
   * 导航栏列表
   */
  list?: RequireOnlyOne<
    {
      text: string; // 导航项的名称
      icon?: string; // 导航项图标
      activeIcon?: string; // 导航项高亮图标
      id: string; //  与 routes 一一对应（如有）
      route: string;
    },
    'id' | 'route'
  >[];
};
```

其中 icon 和 activeIcon 仅支持本地图片, 且图片为绝对地址。

例如: 在根目录下创建 `public/images/tabbar/home.png` `public/images/tabbar/home-active.png` 文件，则对应的配置为:

```json
{
  "icon": "/images/tabbar/home.png",
  "activeIcon": "/images/tabbar/home-active.png"
}
```
## 样式方案

自适应样式单位 `rpx`，自动根据设备环境缩放。

> 关系：`750rpx` = `100vw`

绝对样式单位 `px`，在所有设备下表现一致。

### 样式文件

对于页面和组件级的样式，推荐使用 CSS Modules 的方案，能有效避免样式冲突问题。

规范规则如下：

- 文件名： `xxx.module.[css|less]`
- 模块化：一个页面或组件对应一个样式文件。

```
Home
├── index.module.css
└── index.tsx
```

### 样式规则

推荐使用驼峰式命名样式名，同时避免使用嵌套样式名。

推荐写法：

```less
// Good
.home {
  color: red;
}

.homeTitle {
  font-size: 48rpx;
}
```

不推荐写法：

```less
// Bad
.home {
  color: red;
  .title {
    font-size: 48rpx;
  }
}
```

### 设计稿

设计稿应以 750px 为设计宽度，能有效减少开发过程中单位的转换换算。
## 自定义组件

您可以在 Ray 组件中直接使用小程序的自定义组件。包括支持原生 UI 组件库，如：[miniapp-components-plus](https://www.npmjs.com/package/@tuya-miniapp/miniapp-components-plus), [weui](https://github.com/wechat-miniprogram/weui-miniprogram) 等等。

### 示例代码

以智能小程序的扩展组件库 `miniapp-components-plus` 为例：

```js
import * as React from 'react';
import { View } from '@ray-js/ray';
import Cells from '@tuya-miniapp/miniapp-components-plus/cells';
import Cell from '@tuya-miniapp/miniapp-components-plus/cell';

export default () => (
  <View>
    <Cells title="带说明的列表项">
      <Cell value="标题文字" footer="说明文字"></Cell>
      <Cell>
        <View>标题文字（使用slot）</View>
        <View slot="footer">说明文字</View>
      </Cell>
    </Cells>
  </View>
);
```

### 注意事项

1. 对于小程序自定义组件的事件，请使用 `bind` 开头的事件。

   **示例**

   ```js
   import React from 'react';
   import { Button, View } from '@ray-js/ray';
   import ActionSheet from '@tuya-miniapp/miniapp-components-plus/actionSheet';
   export default function Demo() {
     const [isShowAtionSheet, setIsShowAtionSheet] = React.useState(false);
     const groups = [
       { text: '示例菜单', value: 1 },
       { text: '示例菜单', value: 2 },
       { text: '示例菜单', type: 'warn', value: 3 },
     ];
     return (
       <View>
         <Button
           onClick={() => {
             setIsShowAtionSheet(true);
           }}
         >
           点击弹出actionsheet
         </Button>
         <ActionSheet
           bindactiontap={(e) => {
             console.log('点击 ActionSheet 的按钮项', e);
           }}
           bindclose={(e) => {
             console.log('点击关闭');
             setIsShowAtionSheet(false);
           }}
           show={isShowAtionSheet}
           actions={groups}
           title="这是一个标题，可以为一行或者两行。"
         ></ActionSheet>
       </View>
     );
   }
   ```

2. 对于带有具名 `slot` 的组件，具名 `slot` 部分的最外层只能用 `View` 组件。

   **错误示例**

   ```js
   import React from 'react';
   import { Text, View } from '@ray-js/ray';
   import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
   export default () => (
     <View>
       <Badge>
         <Text slot="inner">Ray</Text>
       </Badge>
     </View>
   );
   ```

   **正确示例**

   ```js
   import React from 'react';
   import { View } from '@ray-js/ray';
   import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
   export default () => (
     <View>
       <Badge>
         <View slot="inner">Ray</View>
       </Badge>
     </View>
   );
   ```

3. 不能在小程序自定义组件上使用 “Spread Attributes”。

   **错误示例**

   ```js
   import React from 'react';
   import { View } from '@ray-js/ray';
   import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
   export default () => {
     const badgeProps = {
       text: 1,
     };
     return (
       <View>
         <Badge {...badgeProps}>
           <View slot="inner">Remax</View>
         </Badge>
       </View>
     );
   };
   ```

   **正确示例**

   ```js
   import React from 'react';
   import { View } from '@ray-js/ray';
   import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
   export default () => {
     return (
       <View>
         <Badge text={1}>
           <View slot="inner">Remax</View>
         </Badge>
       </View>
     );
   };
   ```
## 公共文件

公共文件是指在多个页面中共享的图片资源文件，如：`logo.png` `banner.jpg` 等。

此类文件不需要经过构建器打包, 直接放置在 `public/` 目录下即可。

### 目录结构

public 目录与 src 目录同级, 其结构如下:

```
public
└── images
    └── logo.png
src
  └── ...
```

### 使用公共文件

使用公共文件时, 以 `/` 开头的绝对路径引用即可。不需要包含 `public` 目录名。

#### 在样式文件中使用

```css
.logo {
    background-image: url('/images/logo.png');
}
```

#### 在脚本文件中使用

```tsx
import { Image } from '@ray-js/ray';
import React from 'react';
export default function Page(props) {
  return <Image src={'/images/logo.png'} />;
};
```

### 与编译文件的区别

| public 公共文件                                         | 打包文件                                                                |
| ------------------------------------------------------- |---------------------------------------------------------------------|
| 使用绝对路径表示, 以 `public/` 下的路径, 直接字符串描述 | 以相对路径引用, 如 `../images/logo.png`。 脚本文件中需导入 (`require` `import`) |
| `public/` 目录下的内容直接拷贝到 `dist/tuya` 目录下     | 编译文件会经过构建器打包, 会被压缩文件名加上 hash 值打包到 `dist/tuya/assets` 目录下。         |
| 文件不存在不影响构建                                    | 文件不存在会导致构建报错                                                        |
