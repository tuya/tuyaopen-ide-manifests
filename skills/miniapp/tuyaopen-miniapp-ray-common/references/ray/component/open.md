# 开放能力 (open)

[AI-generated summary: 本文档介绍Ray框架中的开放能力组件，重点阐述WebView容器组件的使用方法、属性配置和事件处理机制。涵盖如何在小程序中正确嵌入网页容器，以及处理网页加载成功、失败和消息通信等关键场景。覆盖内容：WebView、src属性、onLoad事件、onError事件、onMessage事件、网页加载、postMessage、域名配置、WebViewLoadEvent、WebViewErrorEvent、WebViewMessageEvent、React集成、网页容器样式控制]

### WebView

> [VERSION] @ray-js/ray >= 0.6.9

#### 描述

承载网页的容器；在小程序中通常会铺满整个页面。 当页面存在 web-view 标签时，其他标签将不展示，且不支持设置任何样式！

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `src` | `string` | 是 | `""` | webview 指向网页的链接，需登录小程序管理后台, 进入小程序详情页->开发设置->多区服务器域名->webview 合法域名 进行webview 域名配置。 |
| `onError` | `(event: WebViewErrorEvent) => void` | 否 | - | 网页加载失败时触发 |
| `onLoad` | `(event: WebViewLoadEvent) => void` | 否 | - | 网页加载成功时触发 |
| `onMessage` | `(event: WebViewMessageEvent) => void` | 否 | - | 网页向小程序 postMessage 时，在特定时机（小程序后退、组件销毁、分享）触发并收到消息 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { WebView, View } from '@ray-js/ray';

export default function () {
  return (
    <WebView
      src="https://www.tuya.com"
      onLoad={(e) => console.log('网页加载成功:', e.detail.src)}
      onError={(e) => console.log('网页加载失败:', e.detail)}
    />
  );
}
```

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayWebView" 
  qrCodeUrl="/images/qrCode/rayWebView.png" 
  lang="zh">
</DemoBlock>
