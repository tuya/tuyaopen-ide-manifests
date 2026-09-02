# App

Ray 应用的默认入口文件为 src/app.js。不同于原生小程序中的 app.js，Ray 中的 app.js 是一个 React 组件。

```js
// src/app.js
import React from 'react';

export default class App extends React.Component {
  render() {
    return this.props.children;
  }
}
```

## 应用配置

Ray 应用配置通过 `src/global.config.js` 实现，对应原生小程序中的 [app.json](/cn/miniapp/develop/miniapp/framework/app/app-json)。

```ts
import { GlobalConfig } from '@ray-js/types';

export const wechat = {
  window: {
    backgroundColor: '#f2f4f6',
    navigationBarTitleText: '微信小程序示例',
    navigationBarBackgroundColor: '#f2f4f6',
    navigationBarTextStyle: 'black',
  },
};

export const tuya = {
  window: {
    backgroundColor: '#f2f4f6',
    navigationBarTitleText: '智能小程序示例',
    navigationBarBackgroundColor: '#f2f4f6',
    navigationBarTextStyle: 'black',
  },
};

export const web = {
  window: {
    backgroundColor: '#f2f4f6',
    navigationBarTitleText: 'Ray Web App',
  },
};

const globalConfig: GlobalConfig = {
  basename: '',
};

export default globalConfig;
```

Ray 构建时会根据构建的目标平台自动选择配置，如没有其他端的适配需求，可只保留 `export const tuya = {}` 即可。

## 生命周期

应用的生命周期可以直接写在 App 组件上。

```js
import React from 'react';

export default class App extends React.Component {
  // did mount 的触发时机是在 onLaunch 的时候
  componentDidMount() {
    console.log('App launch');
  }
  onShow(options) {
    console.log('onShow', options);
  }
  render() {
    return this.props.children;
  }
}
```

对于函数组件的 App, 可以通过 useAppEvent hook 来监听生命周期

```js
import { useAppEvent } from '@ray-js/ray';

export default function App(props) {
  useAppEvent('onShow', () => {
    console.log('这个 hook 等同于 onShow');
  });
  useAppEvent('onThemeChange', () => {
    console.log('这个 hook 等同于 onThemeChange');
  });
  return props.children;
}
```
