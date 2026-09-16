# 插件

## ray 编译插件

```typescript
// ray.config.ts
import { RayConfig } from '@ray-js/types';

// 插件本质上是一个object对象，具体配置查看RayConfig typescript类型
const config: RayConfig = {
  plugins: [
    // 可以是文件，导出插件对象
    require.resolve('./plugin'),

    // 可以是函数
    () => {
      return {
        name: 'aaaa',
        configWebpack({ config }) {},
      };
    },
    // 可以是对象
    {
      name: 'plugin name',
    },
  ],
};
export default config;
```

## ray 运行时插件

```typescript
// ray.config.ts
import { RayConfig } from '@ray-js/types';

// 插件本质上是一个object对象，具体配置查看RayConfig typescript类型
const config: RayConfig = {
  plugins: [
    {
      // 运行时插件只能是函数，返回运行时模块的绝对路径
      registerRuntimePlugin() {
        return require.resolve('./runtime');
      },
    },
  ],
};
export default config;
```

## 微信小程序插件

```typescript
// src/routes.config.ts
import { PluginOfMini, SubPackages } from '@ray-js/types';

export const plugins: PluginOfMini = {
  'hello-plugin22': {
    version: 'dev',
    provider: 'wxf1eb515130875231',
  },
};

export const subPackages: SubPackages = [
  {
    root: 'packageA',
    pages: [
      {
        route: '/a/:uid',
        path: '/pages/a/index',
      },
      {
        route: '/b',
        path: '/pages/b/index',
      },
    ],
    // 子包中的插件
    plugins: {
      // 子包和主包插件的provider不能一样
      'hello-plugin22': {
        version: 'dev',
        provider: 'wxf1eb515130875231',
      },
    },
  },
];
```

```jsx
// src/pages/index
// 使用
import { View } from '@ray-js/ray';
import { requirePlugin, requirePluginComponent } from 'ray/macro';

// 插件暴露的接口
const pluginApi = requirePlugin('hello-plugin22');
pluginApi.xxx();

//插件暴露的组件
const PluginComponent = requirePluginComponent('hello-plugin22/component');

const Demo = () => {
  return (
    <View>
      <PluginComponent />
    </View>
  );
};
```

## 微信小程序子包及其插件

```typescript
// src/routes.config.ts
import { View, router } from '@ray-js/ray';
import { SubPackages, Routes } from '@ray-js/types';

export const routes: Routes = [
  {
    route: '/home',
    path: '/pages/index',
  },
];
export const subPackages: SubPackages = [
  {
    root: 'packageA',
    pages: [
      {
        route: '/b',
        path: '/pages/b/index',
      },
    ],
  },
];

// src/pages/index
const Demo = () => {
  return (
    <View>
      <View onClick={() => router.push('/b', { subpackage: 'packageA' })}>
        子包页面跳转
      </View>
      <View onClick={() => router.push('/home')}>主包页面跳转</View>
    </View>
  );
};
```
