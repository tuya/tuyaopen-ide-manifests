# 基础能力 (ability)

[AI-generated summary: 本文介绍Tuya小程序的基础能力，包括功能页共享、WebView离线站点和小程序生命周期管理。功能页支持跨小程序复用，WebView站点支持离线访问和小程序通信。详细涵盖功能页开发、配置、路由、加载策略、数据预设以及应用生命周期的完整管理。覆盖内容：功能页、Page()、functional.config.ts、publicPages、routes、navigateTo、functional://、WebView、webview://、getOpenerEventChannel、presetFunctionalData、ty.navigateTo、ty.redirectTo、ty.reLaunch、onPause、onResume、cachePageStack、disableCache、entryCode、versionType、strategy]

## 功能页

表示一类特定的功能界面，如：登录页、注册页、忘记密码页、支付页等。此类页面的特点的功能单一、流程完整，可独立访问，具有明确的业务入口与出口。

功能页与普通的页面相同，通过框架函数 Page() 注册。功能页经发布后可在其他小程序内打开。实现应用页面共享、复用的能力。

应用案例：
- A 小程序 - 存在注册页、登录页、忘记密码页等需求。
- B 小程序 - 存在注册页、登录页、忘记密码页等需求。

可将 A 小程序的注册页、登录页、忘记密码页等以功能页模式开发。自身引用且可提供给 B 小程序引入使用，实现共享页面的能力，以及后续其他小程序也有此业务需求，也可引入使用。

**环境要求**

- 基础库版本: `>= 2.12.0`
- 容器版本：`>= 3.5.0`
- App 公版： `>= 5.0.0`
- IDE 版本：`>= 0.7.1`

### 术语

#### 宿主小程序

表示主体小程序应用，可导入其他功能页小程序进行使用。源码路径为 `miniprogramRoot`。

#### 功能页小程序

表示可被导入到宿主小程序内的小程序。源码路径为 `functionalRoot`。

#### 功能页示例

##### 设备详情

设备详情是设备基本信息的承载页面，包括设备名称、设备图标、设备状态、设备控制等。每个面板业务都应添加设备详情配置。

```typescript
{
    functionalPages: {
    settings: {
      appid: "tycryc71qaug8at6yt",
      entryCode: "entryyvaqnocapvsl1"
    },
  },
}
```

##### 酷玩吧

酷玩吧是情景音乐律动等功能集合页面，照明设备基础、高级能力板块的集合，属于增值服务类型。

```typescript
{
    functionalPages: {
    rayPlayCoolFunctional: {
      appid: "tyg0szxsm3vog8nf6n"
    },
  },
}
```

##### 定时倒计时

定时倒计时是基础设备能力，用于设备定时开关，定时倒计时等功能。

```typescript
{
    functionalPages: {
    rayPlayCoolFunctional: {
      appid: "tyjks565yccrej3xvo"
    },
  },
}
```

##### 生物节律

生物节律功能可以模拟一天当中自然光亮度和色温的变化，让我们感受回归自然的灯光。

```typescript
{
    functionalPages: {
    rayPlayCoolFunctional: {
      appid: "ty53odnmk2cxnzcxm6"
    },
  },
}
```

### 功能页开发

功能页源码有独立的目录，其源码内部不可引用（`miniprogramRoot` `widgetRoot`）目录内的文件，包括 js、tyml、tyss、图片等。

### 快速上手

#### 搭建环境及小程序开发流程

功能页开发，**需要使用智能小程序创建项目，请勿使用非智能小程序**。项目创建流程与智能各小程序一致，具体请参考[智能小程序快速开始](/cn/miniapp/develop/ray/guide/start/smart)。

#### 工程配置

project.tuya.json

若要进行功能页开发，需要在 project.tuya.json 文件中声明 `miniprogramRoot` 和 `functionalRoot` 分别对应小程序代码目录和功能页代码目录，对于基于原生小程序语法开发的业务，需要指定开发目录即可，对于 ray 框架开发的业务，需要指定 ray 编译产物目录。

- 配置内容

```javascript
{
  projectname: 'functional-demo',
  i18n: true,
  miniprogramRoot: 'dist/tuya/miniprogram', // 小程序编译后源码
  functionalRoot: 'dist/tuya/functional', // 功能页编译后源码目录
  projectId: 'your_project_id',
  baseversion: '2.12.0',
  dependencies: {
    // ...
  },
}
```

- 对应的目录结构

```bash
dist/ #编译产物
|--functional/ #编译后的功能页源码
     └──├── functional.json  # 功能页配置文件
        ├── functional.tyss # 功能页全局样式
        ├── theme.json # 功能页主题配置，如有
        ├── assets/
        │   └── logo.png  # 功能页内的资源
|--miniprogram/ # 小程序编译后的源码
functional/  # 功能页 ray 源码。目录名固定为 functional
  └──├── functional.config.ts  # 功能页配置文件
  	 ├── functional.tyss # 功能页全局样式
  	 └── theme.json # 功能页主题配置，如有
src/ # 小程序功能页目录
project.tuya.json # 项目配置文件
```

#### 功能页配置 `functional.config.ts`

用于描述当前功能页小程序的信息。

##### 配置字段 

| 字段            | 类型    | 必填 | 说明                                                                                                                                                                                                                                     |
| --------------- | ------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pages           | Array   | 是   | 功能页内的页面列表，与小程序的 `app.json` 一致。 声明当前功能页包含的页面地址，可以有多个，至少存在一个。                                                                                                                                |
| publicPages     | Object  | 是   | 只有发布的页面才可被宿主小程序访问，访问路由为： `functional://{name}/{pageName} `一经发布的页面，页面名不可更改，否则会造成宿主小程序访问到错误路由的问题，应在发布前确定好发布的页面名。并发布到功能页小程序文档中，提供给引入方查阅。 |
| themeLocation   | string  | 否   | [参考 app.json](/cn/miniapp/develop/miniapp/framework/app/app-json#themelocation)                                                                                                                                                        |
| usingComponents | Object  | 否   | [参考 app.json](/cn/miniapp/develop/miniapp/framework/app/app-json#usingcomponents)                                                                                                                                                      |
| dependencies    | Object  | 否   | [参考 project.tuya.json](/cn/miniapp/develop/miniapp/framework/app/config)                                                                                                                                                               |
| darkmode        | boolean | 否   | 是否支持暗黑模式, 默认 `true`                                                                                                                                                                                                            |
| themeLocation   | string  | 否   | 主题配置文件相对路径                                                                                                                                                                                                                     |

##### 示例

```typescript
export default {
  routes: [
    {
      name: 'detail', // 发布 detail 页面 对应 app.json 文件中 publicPages 下的 key
      isPublic: true, // 是否对外发布
      route: '/detail',
      path: 'pages/detail/index',
    },
    {
      name: 'third',
      isPublic: false,
      route: '/third',
      path: '/pages/third/index',
    },
  ],
};

```
上述示例中， detail 页面是对外发布的， 业务中可以通过该路由跳转 detail 页面。

如：
```javascript
// 正确的调用
ty.navigateTo({
  url: `functional://settings/detail?${deviceId}`,
  success: (res) => {
    console.log('跳转功能页 success', `functional://settings/detail?${query}`, res);
  },
  fail: (err) => {
    console.error('跳转功能页 fail', `functional://settings/detail?${query}`, err);
  }
});

// 由于 publicPages 只注册了 detail，因此以下路由无法跳转
ty.navigateTo({
  url: `functional://settings/third?${deviceId}`,
  success: (res) => {
    console.log('跳转功能页 success', `functional://settings/third?${deviceId}`, res);
  },
  fail: (err) => {
    console.error('跳转功能页 fail', `functional://settings/third?${deviceId}`, err);
  }
})
```

#### 功能页开发调试

##### global.config.ts 文件中声明依赖的功能页

宿主小程序中 `global.config.ts` 中通过 `functionalPages` 字段导入功能页小程序。使用 key-value 的形式，key 为功能页的插件名，value 为功能页的配置信息。

```typescript
{
  functionalPages: {
    settings: {
      appid: "tycryc71qaug8at6yt",
      entryCode: "entryyvaqnocapvsl1",
    },
  },
}
```
appid 为小程序 ID。
    与当前小程序的 projectId (project.tuya.json) 中一致时，则表示引用自身的功能页。

##### 跳转到功能页页面
使用路由 API 跳转， 仅支持 ty.navigateTo、 ty.redirectTo、 ty.reLaunch 三个方法。

格式为 `functional://{功能页插件名}/{对外暴露的页面名}` 支持 query 参数。

如设备详情功能页名称为：settings （如上介绍，固定名称，业务方不能更改）；对外暴露的地址：detail （固定名称，由设备详情功能页开发者命名）

```html
<navigator url="functional://settings/detail?deviceId=xxxxx" open-type="navigate">
  跳转到功能页
</navigator>
```

```javascript
ty.navigateTo({
  url: 'functional://settings/detail?deviceId=xxxxx',
});
```

##### 功能页内部跳转

功能页内部需要使用相对路径的形式进行跳转。
  
```javascript
ty.navigateTo({
  url: '../detail/index',
});
```

#### 功能页发布

开发完成后，发布功能页所属小程序即可。IDE 内部版本已移除上传功能，内部开发者需要在面板管理平台进行打包上传。

### 进阶开发

#### 整体架构

##### 同业务架构

如上图所示， 同业务中的功能页加载结构较为简单，逻辑存在一个小程序包中。
- 业务小程序：用于承载功能页入口，及多语言。
  - 业务逻辑：常规业务逻辑，无特殊性限制，需要在小程序中声明对功能页插件的依赖及插件名称。
  - 多语言：承载了小程序及功能页中使用到的多语言，与功能页使用同一个多语言包。
- 业务功能页：
  - 在业务开发过程中拆分出可跨业务使用的公共逻辑，除必须参数及多语言外，对业务小程序无其他依赖。
  - 多语言：使用所属小程序的多语言包。
  - 对外路由：需要对外开放的页面，应在 publicPages 中进行声明

##### 非同业务架构

如上图所示，小程序业务可能会使用到除自身拆分出的功能页外，还会依赖其他功能页。

- 业务小程序：承载业务功能，业务多语言。
  - 业务逻辑：常规业务逻辑，无特殊性限制，需要在小程序中声明对功能页的依赖及配置功能页插件名，不同的功能页需要配置不同的插件名称。
  - 多语言： 承载了小程序及功能页中使用到的多语言，与功能页使用同一个多语言包。
- 业务功能页：在业务开发过程中拆分出可跨业务使用的公共逻辑，除必须参数及多语言外，对业务小程序无其他依赖。非必须。
  - 多语言：使用所属小程序的多语言包。
  - 对外路由：需要对外开放的页面，应在 publicPages 中进行声明
- 其他功能页：承载了一些公共业务逻辑，一般为共性业务逻辑，对宿主业务一般无强制性依赖。
  - 多语言：多语言存在于功能页所属小程序的多语言包中。
- 多语言优先级：宿主小程序多语言 > 功能页多语言。 
  - 宿主小程序若包含功能页功能，则该功能页多语言与宿主小程序共用多语言包。
  - 在使用非宿主小程序所包含的功能页时，功能页多语言包与宿主小程序多语言包独立。
  - 功能页多语言包中字段 key 值与宿主小程序多语言包中字段 key 值相同时，取宿主小程序多语言包中的字段值。
  - 多个功能页间多语言包独立，不会相互影响。
- 添加前缀：在开发功能页时，为避免功能页内多语言无意识地被宿主多语言覆盖。
  建议多语言字段 key 值添加特定前缀，建议以项目名称缩写开头：如:灯光渐变功能页(LampMutationFunctional)以 `lmf_` 作为多语言 key 值的前缀。
#### 体验版本依赖

体验版本依赖可以帮助功能页开发者在未发布时即可验证相关功能，提升开发体验。

`global.config.ts` 中 `functionalPages` 中版本控制相关有以下字段可以根据需求选择性配置：
- `versionType`: 表示所依赖的功能页版本类型，可选值为 `release`、`preview`，默认为 `release`。
- `version`: 表示所依赖的功能页的版本号，配置后只会加载指定版本的功能页。默认不配置，加载线上最新版本。

```typescript
{
  functionalPages: {
    settings: {
      appid: "tycryc71qaug8at6yt",
      entryCode: "entryyvaqnocapvsl1",
      versionType: "preview",
      version: "1.0.0"
    },
  },
}
```
注意：
  1. `versionType`: 仅所加载的小程序为体验版本时生效。小程序发布正式版本后，跳转功能页该字段不再生效。将使用正式版本进行跳转。<br/>
  2. `version`: 被指定为固定版本号后， 若该版本的功能页被下架，会无法加载到该功能页相关功能，存在一定的风险，建议谨慎使用。<br/>
  3. App 版本 >= 5.18

#### 加载策略

在实际业务开发中，一个小程序可能会依赖多个功能页，如果依赖过多，下载耗时就会越长，所以需要指定加载策略，保证功能页加载的效果。

`global.config.ts` 中 `functionalPages` 中 `strategy` 字段表示使用哪种策略加载功能页，可选值为 `lazyload`、`preload`，默认为 `preload`。

**lazyload**: 懒加载模式，当跳转功能页时进行下载。
**preload**: 预加载模式，当打开宿主小程序时下载，默认值。

示例：
```typescript
{
  functionalPages: {
    settings: {
      appid: "tycryc71qaug8at6yt",
      entryCode: "entryyvaqnocapvsl1",
      strategy: "lazyload"
    },
  },
}
```
App 版本 >= 5.18

#### 跨页面事件通信

支持 eventChannel 通信模式，具体参考 [getOpenerEventChannel](/cn/miniapp/develop/miniapp/framework/api/page#pageprototypegetopenereventchannel)

需要功能页开发时提前预留特定的事件名，供宿主小程序调用。

#### 预设功能页初始化数据

当需要定制功能页页面数据时，或跳转页面需要传递较多参数，url可能会超出最大长度时，可通过 `ty.presetFunctionalData` API 进行。

用于设置功能页初始化的页面数据，一经设置永久生效，除非主动清空

```javascript
// 自定义数据
ty.presetFunctionalData({
	url: 'functional://mySettings/home',
    data: { name: 'pre' }
})
// 进行跳转
ty.navigateTo({ url: 'functional://mySettings/home'})

// 清空数据
ty.presetFunctionalData({
  url: 'functional://mySettings/home',
  data: null
})
```
预设数据后，功能页页面实例通过 Page 实例的 this.getPresetData() 获取数据

```tsx | sandbox
import { usePageInstance, View } from '@ray-js/ray';
export default function Index() {
  const page = usePageInstance();
  const presetData = page.getPresetData();
  return <View>...</View>;
}
```

### 注意事项

1. 不受 app.tyss 样式影响，功能页内聚自身样式。
2. light / dark 开发模式，跟随宿主配置。
3. getApp, getCurrentPages 接口的返回只可访问自身空间数据。
4. 功能页多语言会合并宿主小程序多语言，多语言优先级宿主多语言 > 功能页多语言。
5. 真机调试 App 版本需要 >= 5.18。IDE 版本需要 >= 0.7.1。
6. 业务小程序配置所依赖的功能页配置时，可能会出现指定功能页版本号的情况：
```typescript
{
  functionalPages: {
    settings: {
      // 加载指定版本的功能页
      appid: "tycryc71qaug8at6yt",
    },
    settings: {
      // 加载 1.0.0 版本的功能页
      appid: "tycryc71qaug8at6yt",
      version: "1.0.0"
    },
    settings: {
      // 通过 entryCode 查找 appid，加载线上最新可用版本的功能页。entryCode 优先级高于 appid
      entryCode: "entryyvaqnocapvsl1",
      // 此时 appid 和 version 字段会被忽略
      appid: "tycryc71qaug8at6yt",
      version: "1.0.0"
    },
  },
}
```
该场景下可能会遇到如下几种情况或异常：
- 仅指定 appid： 此时会加载线上最新可用版本的功能页，若不存在任何可用版本，则表现为无法跳转到该功能页，跳转接口会抛出异常。
- 指定 appid 和 version： 此时会加载指定版本的功能页，若不存在该版本，则表现为无法跳转到该功能页，跳转接口会抛出异常。
- 指定 entryCode 的情况： 此时 appid 和 version 字段会被忽略，会通过 entryCode 查找 appid，若查到，则会加载线上最新可用版本的功能页；若未查到则表现为无法跳转到该功能页，跳转接口会抛出异常。
## webview 站点

是随着小程序一同发布的静态文件站点，减轻开发者部署静态 html 文件负担，支持离线模式的技术。开发者可以在小程序中使用 WebView 组件加载 webview 站点，实现小程序与 webview 站点的无缝衔接。

### webview 站点的特性

- 支持离线模式，提高访问速度
- 支持与小程序逻辑层通信

### webview 站点的使用

#### 1. 声明 webview 站点文件目录

通过在 `src/global.config.ts` 的 `tuya` 配置中声明 `webviewRoot` 字段，指定 webview 站点文件目录，如下：

```ts
// src/global.config.ts
import { GlobalConfig } from '@ray-js/types';

export const tuya = {
  webviewRoot: 'my-webview',
};

const globalConfig: GlobalConfig = {
  basename: '',
};

export default globalConfig;
```

则小程序会以 `webviewRoot` 字段指定的目录进行部署，加载 webview 站点文件。

目录结构如下：

```bash
├── src
│   ├── global.config.ts
│   └── pages
│       └── index
│           └── index.tsx
└── my-webview
    ├── index.html
    └── index.js
```

> 注意：`webviewRoot` 字段只能声明一次，使用相对路径，不支持绝对路径。注意目录的关系。

#### 2. 使用 WebView 组件加载 webview 站点

站点协议为 `webview://`，在 Ray 页面中使用 [WebView](/cn/miniapp/develop/ray/component/open/web-view) 组件：

```tsx | pure
// src/pages/index/index.tsx
import React, { useRef } from 'react';
import { WebView } from '@ray-js/ray';

export default function IndexPage() {
  return (
    <WebView
      id="yourId"
      src="webview://my-webview/index.html"
      onMessage={(event) => {
        const messageData = event.detail;
        // messageData = { msg: '发到逻辑层 -> 1********' }
        console.log('收到 webview 消息:', messageData);
      }}
      onLoad={() => console.log('webview 加载成功')}
      onError={() => console.log('webview 加载失败')}
    />
  );
}
```

其中 `src` 属性的值为 `webview://` 开头，后面跟着 `webviewRoot` 字段指定的目录，以及 webview 站点文件的路径。

- `onMessage`：webview 站点与小程序逻辑层通信
- `onLoad`：webview 站点加载成功
- `onError`：webview 站点加载失败

#### 3. webview 站点与小程序逻辑层通信

webview 站点与小程序逻辑层通信，通过 [@tuya-miniapp/jssdk](https://www.npmjs.com/package/@tuya-miniapp/jssdk) 实现。

```html
<!-- my-webview/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webview 站点</title>
</head>
<body>
  <script src="index.js"></script>
</body>
</html>
```

```js | pure
// my-webview/index.js
// 发送消息到逻辑层
window.ty.miniProgram.postMessage({
  data: {
    msg: '发到逻辑层 -> ' + Date.now()
  }
});

// 接受来自逻辑层的消息
window.ty.miniProgram.onMessage(function (event) {
  const messageData = event.data;
  // messageData = { msg: '发到 h5 里 -> 1********' }
});
```

在 Ray 页面中通过 `ty.createWebviewContext` 向 webview 站点发送消息：

```tsx | pure
// src/pages/index/index.tsx
import React, { useEffect, useRef } from 'react';
import { createWebviewContext, WebView } from '@ray-js/ray';

export default function IndexPage() {
  const webviewContextRef = useRef(null);

  useEffect(() => {
    webviewContextRef.current = createWebviewContext('yourId');
  }, []);

  function sendMessage() {
    webviewContextRef.current?.postMessage({
      data: { msg: '发到 h5 里 -> ' + Date.now() },
    });
  }

  return (
    <WebView
      id="yourId"
      src="webview://my-webview/index.html"
      onMessage={(event) => {
        console.log('收到 webview 消息:', event.detail);
      }}
    />
  );
}
```

### webview 站点文件类型

支持的文件后缀： `.jpg` `.jpeg` `.png` `.gif` `.bmp` `.ico` `.tiff` `.svg` `.ttf` `.woff` `.woff2` `.json` `.html` `.htm` `.js` `.css` `.mp3` `.mp4`

虽然 webview 站点支持的文件类型较多，并不意味着所有文件都可以放在 webview 站点中，开发者需要根据实际情况，选择合适的文件类型，以及文件大小。过大的文件会导致小程序加载速度变慢，影响用户体验，或无法上传到小程序平台。

### 使用条件

- Tuya MiniApp IDE `>= 0.5.10`
- 基础库版本 `>= 2.14.2`
- 容器版本 `>= 3.12.0`
- @tuya-miniapp/jssdk `>= 0.1.2`

### 注意事项

1. webview 站点文件目录中的文件，不支持使用小程序的组件，如 `View`、`ScrollView` 等，只支持静态 html 标签；
2. 开发者需保障 webview 站点文件的合法性，不得包含违法、色情、暴力等内容，否则将会被小程序平台封禁；
3. js 脚本需保障安全性，不得包含恶意代码，否则将会被小程序平台封禁；
4. js 脚本需保障兼容性，例如：使用 es5 语法，不使用 es6 语法，否则可能在移动端浏览器上出现兼容性问题；
### 内存缓存生命周期说明

为便于更清晰地感知小程序进入与恢复内存缓存的状态变化，小程序 **App 对象** 上新增内存缓存相关生命周期事件，用于区分不同阶段并处理不同逻辑。

#### 新增生命周期事件

| 事件名称 | 事件标识   | 触发时机                       |
| -------- | ---------- | ------------------------------ |
| 暂停     | `onPause`  | 小程序进入内存缓存状态时触发   |
| 恢复     | `onResume` | 小程序从内存缓存状态恢复时触发 |

#### 兼容性说明

为保证现有小程序不受影响，原有的 `App.onShow` 与 `App.onHide` 生命周期仍会正常触发。

在涉及内存缓存的场景下，生命周期事件的触发顺序如下：

##### 进入内存缓存

1. 触发 `App.onPause`
2. 触发 `App.onHide`

##### 从内存缓存状态恢复

1. 触发 `App.onResume`
2. 触发 `App.onShow`

```js
export default class App extends React.Component {
  // did mount 的触发时机是在 onLaunch 的时候
  componentDidMount() {
    console.log('App launch');
  }
  onPause() {
    console.log('进入内存缓存状态');
  }
  onResume() {
    console.log('从内存缓存状态恢复')
  }
  render() {
    return this.props.children;
  }
}
```

对于函数组件的 App, 可以通过 useAppEvent hook 来监听生命周期

- ray 版本需 `>= 1.7.39`

```js
import { useAppEvent } from '@ray-js/ray';

export default function App(props) {
  useAppEvent('onPause', () => {
    console.log('进入内存缓存状态');
  });
  useAppEvent('onResume', () => {
    console.log('从内存缓存状态恢复')
  });
  return props.children;
}
```

### 1. 小程序生命周期

小程序从启动到最终销毁，会经历多个不同的状态，在不同状态下有不同的运行表现。  
整体流程如下图所示：

#### 1.1 小程序启动

从用户的角度来看，小程序的启动可以分为两种：

- **冷启动**：  
  当用户第一次打开小程序，或者小程序被销毁后再次打开时，需要重新加载全部资源并启动，这种情况称为冷启动。

- **热启动**：  
  当用户之前已经打开过小程序，在短时间内再次进入时，小程序并未销毁，只是从后台恢复到前台，这称为热启动。

> 在生命周期术语中，我们通常将“启动”特指冷启动，而热启动一般描述为「后台切前台」。

#### 1.2 前台与后台

当小程序启动后并展示给用户时，处于「**前台**」状态。  
用户离开小程序时，小程序并不会立即销毁，而是进入「**后台**」状态，此时仍会短暂保留在内存中。

**进入后台的常见方式包括：**

- 点击右上角胶囊按钮离开小程序
- iOS 从屏幕左侧右滑返回
- Android 点击返回键
- 小程序运行时切后台（Home 键或手势）
- 小程序运行时锁屏

当用户再次回到 App 并打开该小程序，小程序会重新进入「前台」状态。

#### 1.3 小程序销毁

当小程序长时间未被使用或系统资源不足时，小程序会被彻底销毁。  
销毁后，再次打开即为冷启动。

**常见销毁场景包括：**

- 小程序进入后台后 10 分钟未重新进入前台；
- 同时打开超过三个小程序时，最早进入后台的小程序会被销毁。

---

### 2. 小程序冷启动的页面

当小程序冷启动时，打开的页面有以下情况：

- **A 类场景**：启动场景中不带 path，小程序容器会根据 `entryPagePath` 进入默认页面。
- **B 类场景**：启动场景中带有 path，小程序将直接进入对应页面。

---

### 3. 小程序热启动的页面

热启动时，小程序打开的页面规则如下：

- 默认情况下，热启动会回到小程序冷启动时进入的第一个页面；
- 若配置了 `cachePageStack: true`，则会**保留上次的浏览状态**，即恢复上次退出前的页面堆栈。

> 配置项位置：`global.config.ts`

| **属性**       | **类型** | **必填** | **描述**               |
| -------------- | -------- | -------- | ---------------------- |
| cachePageStack | boolean  | 否       | 退出时是否保留所有页面 |

---

### 4. 主动销毁

如果业务上希望小程序每次启动都重新加载，可以通过如下配置项实现主动销毁：

> 配置项位置：`global.config.ts`

| **属性**     | **类型** | **必填** | **描述**             |
| ------------ | -------- | -------- | -------------------- |
| disableCache | boolean  | 否       | 退出时是否销毁小程序 |

当配置为 `true` 时，小程序生命周期如下图所示：

---

### 5. 不进行内存缓存的场景说明

在某些情况下，小程序关闭时会**直接销毁**，而不会进行内存缓存。  
也就是说，下次打开时会重新加载，而非从内存中恢复。

以下情况会触发直接关闭（不缓存）：

- **非正式版本的小程序**：
  如开发版、体验版等不做缓存。

- **关闭时有白屏**：
  若用户关闭时小程序页面异常（如白屏），系统会直接销毁，避免恢复异常页面。

- **关闭时小程序流程未结束**：
  比如仍有小程序启动流程、接口请求在执行中，此时不会缓存。

- **小程序主动禁用缓存**：
  若在`global.config.ts`配置中设置了 `disableCache: true`，关闭后直接销毁。

- **开启了体验评分功能的小程序**：
  当用户可对小程序进行体验评分时，为保证体感一致性，不使用缓存。

- **处于原生 Tab 栏的小程序**：
  在 Native Tab 栏中的小程序不支持内存缓存，会直接关闭。

---

### 6. 补充说明

- 只有在满足缓存条件的情况下，小程序关闭时才会进入内存缓存状态
- 被缓存的小程序在再次打开时，可更快恢复到上次状态，提升体验
- 若不满足缓存条件或被主动销毁，下次打开小程序即为冷启动

### 7. 常见问题（FAQ）

#### Q1：为什么我点击手机的返回键退出小程序后，再次进入时还停留在上次页面？

这是因为当前小程序在关闭时被**内存缓存**了。  
当你再次打开时，系统会直接恢复上次的状态，而不是重新启动。

**解决方法：**
在小程序的全局配置文件 `global.config.ts` 中设置：

```ts
   disableCache: true
```

#### Q2：我想保留小程序上次操作的页面，下次打开还能接着用，要怎么配置？

只需确保：

- 没有设置`disableCache: true`
- 没有触发直接关闭的情况（见上文第5节）

默认情况下，小程序会自动进入内存缓存模式，下次打开会恢复到上次界面。

#### Q3: 哪些情况下小程序不会被缓存？

- 小程序是开发版/体验版
- 关闭时出现白屏
- 启动时后台任务未完成
- 启用了体验评分功能
- 在 Native Tab 栏中
- 显示配置了 `disableCache: true`
