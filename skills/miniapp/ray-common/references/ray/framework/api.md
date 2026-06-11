# 跨端 API

跨端框架提供给项目统一的运行环境，实现多端能力的一致性，包含路由，生命周期。

使用方式：

```js
import { router } from '@ray-js/ray';
```

## API 概览

```js
import { usePageEvent, usePageInstance, withPageLifecycle, router, location } from '@ray-js/ray';
```

### usePageInstance

页面实例 hook，可用于获取页面实例。对应原生小程序中的 `this`。当需要获取页面实例时，可使用该 hook。其他需要获取页面实例的场景也可使用该 hook。

```js
import { View, usePageEvent, usePageInstance } from '@ray-js/ray';

function Page() {
  const page = usePageInstance();
  
  usePageEvent('onLoad', () => {
    console.log(page.getOpenerEventChannel());
  });
  
  return <View>Page</View>;
}
```

### usePageEvent

页面生命周期 hook，可用于监听页面生命周期。

签名：`usePageEvent(event: string, callback: Function);`

event:

- `onShow` 页面可见时
- `onHide` 页面隐藏时
- `onPageScroll` 页面滚动时
- `onPullDownRefresh` 下拉刷新
- `onReachBottom` 页面触底
- `onResize` 页面尺寸发生改变
- `onLoad` 页面加载时触发
- `onUnload` 页面卸载时触发
- `onReady` 页面初次渲染完成时触发
- `onShareAppMessage` 页面分享（微信小程序独有）

针对 Class Components，在跨端运行模式下默认扩展以上生命周期。示例：

```js
import React from 'react';
import { View } from '@ray-js/ray';

export default class Home extends React.Component {
  onShow() {
    // page show
  }
  render() {
    return <View>Home Page</View>;
  }
}
```

### withPageLifecycle

扩展生命周期能力，可用于子组件（Class Components）中监听页面生命周期。示例：

```js
import React from 'react';
import { View } from '@ray-js/ray';
import { withPageLifecycle } from '@ray-js/ray';

class Child extends React.Component {
  onShow() {
    // 所在页面触发 page.onShow
  }
  render() {
    return <View>Child</View>;
  }
}

export default withPageLifecycle(Child);
```

> 推荐项目开发过程中均使用 Function Components 写法，以及 Hooks API。

### router

router 对象实现跨平台统一的路由跳转方式，有以下用法：

- `router.push(url: string)`
- `router.replace(url: string)`
- `router.back()`
- `router.go(delta: number)`
- `router.reload()`

### location

location 对象

- `hash` hash （web 特有）
- `host` URL 域名含端口（web 特有）
- `hostname` URL 域名 （web 特有）
- `port` URL 端口（web 特有）
- `protocol` URL 协议（web 特有）
- `href` 页面全路径
- `pathname` URL 路径部分
- `search` URL 参数
- `query`: Record<string, string> URL 参数对象
- `params`: Record<string, string> 匹配表达式路由参数
  - 例如表达式路由 `/detail/:uid` 中的 `uid`
