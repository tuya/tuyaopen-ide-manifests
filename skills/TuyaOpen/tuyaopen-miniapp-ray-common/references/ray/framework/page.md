# 页面

Ray 的一个页面也是一个 React 组件。

```jsx | sandbox previewTitle="基础页面示例"
// src/pages/index.js
import { View } from '@ray-js/ray';

const IndexPage = () => {
  return <View>Hello world!</View>;
};

export default IndexPage;
```

## 页面配置

假设您的页面文件是 src/pages/index.js，那么这个页面对应的配置文件就是 src/pages/index.config.js。

同 global.config.js 一样，您可以默认导出一个配置，也可以为不同的平台导出不同的配置。

```js
export const web = {
  navigationBarTitleText: '个人中心',
  backgroundColor: '#f2f4f6',
};

export const tuya = {
  navigationBarTitleText: '个人中心',
  backgroundColor: '#f2f4f6',
};

export const wechat = {
  navigationBarTitleText: '个人中心',
  backgroundColor: '#f2f4f6',
};
```

## 生命周期

对于 class 组件的页面您可以直接在 class 上监听页面的生命周期。

```jsx | sandbox previewTitle="Class 页面生命周期"
import React from 'react';
import { View } from '@ray-js/ray';

export default class IndexPage extends React.Component {
  // 页面组件的 didMount 触发时机是在 onLoad 的时候
  componentDidMount() {
    console.log('IndexPage load');
  }
  onShow() {
    console.log('IndexPage show');
  }
  render() {
    return <View>Hello world!</View>;
  }
}
```

对于函数组件的页面, 我们提供了 hooks 来监听生命周期。

```jsx | sandbox previewTitle="Hooks 页面生命周期"
import { View, usePageEvent } from '@ray-js/ray';

export default () => {
  // onShow 生命周期
  usePageEvent('onShow', () => {
    console.log('onShow');
  });
  // 支付宝 onBack 回调
  usePageEvent('onBack', () => {
    console.log('onBack');
  });

  return <View>Hello world!</View>;
};
```

> 注意
>
> class 组件的生命周期回调只能用在页面组件上，但是 hooks 可以用在任意的函数组件上。

## 页面参数

Ray 将页面参数通过 `props` 传递给页面组件，如：

```jsx | pure
import { View } from '@ray-js/ray';

export default (props) => {
  // 页面参数
  console.log(props.location.query);
  return <View>view</View>;
};
```

您也可以通过小程序原生的方式获取参数（通常在 `onLoad` 生命周期里获取），包括场景值也是。

## 获取页面实例

通过 `getCurrentPages` 可以获取 Page 实例。

```jsx | sandbox
import { View, getCurrentPages } from '@ray-js/ray';

export default () => {
  const pages = getCurrentPages();
  return <View>pages: {pages.length}</View>;
};
```

> 注意
>
> Ray 在页面实例上设置了一些内部逻辑相关的属性（包括 data 上面的值），不要修改实例上的属性。
