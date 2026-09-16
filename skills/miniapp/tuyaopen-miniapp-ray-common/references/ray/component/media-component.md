# 媒体组件 (media-component)

[AI-generated summary: 本文档介绍Tuya Miniapp Ray平台的媒体组件库，包含摄像头预览、图片加载、实时视频流播放和视频播放等功能。提供了完整的属性配置、事件回调和代码示例，支持图片缩放模式、视频清晰度切换、云台控制等高级特性。覆盖内容：Camera、Image、IpcPlayer、Video、NativeVideo、devicePosition、resolution、clarity、soundMode、onInitdone、onError、lazyLoad、fadeDuration、mode、autoplay、muted、controls、onPlay、onPause、onEnded、borderRadius、backgroundColor]

### Camera

> [VERSION] @ray-js/ray >= 0.6.9

#### 描述

系统相机组件，用于预览与拍摄。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `mode` | `"normal"` | 否 | `"normal"` | 应用模式，只在初始化时有效，不能动态变更 |
| `resolution` | `"low" \| "medium" \| "high"` | 否 | `"medium"` | 分辨率，不支持动态修改 |
| `devicePosition` | `"front" \| "back"` | 否 | `"back"` | 摄像头朝向 |
| `flash` | `"auto" \| "on" \| "off" \| "torch"` | 否 | `"auto"` | 闪光灯模式 |
| `borderWidth` | `number` | 否 | `0` | 边框宽度，单位 px |
| `borderStyle` | `"solid" \| "dashed"` | 否 | `"solid"` | 边框样式 |
| `borderColor` | `string` | 否 | `"#ffffff"` | 边框颜色，须为十六进制格式 |
| `borderRadius` | `number` | 否 | `0` | 边框圆角，单位 px |
| `borderRadiusTopLeft` | `number` | 否 | - | 边框左上角圆角，单位 px |
| `borderRadiusTopRight` | `number` | 否 | - | 边框右上角圆角，单位 px |
| `borderRadiusBottomLeft` | `number` | 否 | - | 边框左下角圆角，单位 px |
| `borderRadiusBottomRight` | `number` | 否 | - | 边框右下角圆角，单位 px |
| `backgroundColor` | `string` | 否 | `"#ffffff"` | 背景颜色，须为十六进制格式 |
| `onBindstop` | `(event: CameraStopEvent) => void` | 否 | - | 摄像头在非正常终止时触发，如退出后台等情况 |
| `onError` | `(event: CameraErrorEvent) => void` | 否 | - | 用户不允许使用摄像头时触发 |
| `onInitdone` | `(event: CameraInitdoneEvent) => void` | 否 | - | 相机初始化完成时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Camera, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>相机预览</Text>
      <Camera
        style={{ width: '100%', height: '300px' }}
        devicePosition="back"
        flash="auto"
        resolution="high"
        onInitdone={(e) => console.log('初始化完成, 最大缩放:', e.detail.maxZoom)}
        onError={(e) => console.log('相机错误:', e.detail.errMsg)}
        onBindstop={() => console.log('相机非正常终止')}
      />
    </View>
  );
}
```

##### 自定义边框

```tsx
import React, { useState } from 'react';
import { Camera, View, Button } from '@ray-js/ray';

export default function () {
  const [position, setPosition] = useState<'back' | 'front'>('back');

  return (
    <View style={{ padding: '20px' }}>
      <Camera
        style={{ width: '100%', height: '300px' }}
        devicePosition={position}
        flash="off"
        resolution="medium"
        borderWidth={2}
        borderStyle="dashed"
        borderColor="#1890ff"
        borderRadius={16}
        backgroundColor="#000000"
        onInitdone={(e) => console.log('初始化完成:', e.detail)}
      />
      <Button
        style={{ marginTop: '10px' }}
        onClick={() => setPosition(position === 'back' ? 'front' : 'back')}
      >
        切换摄像头（当前: {position === 'back' ? '后置' : '前置'}）
      </Button>
    </View>
  );
}
```

### 相关链接

相关 API：[createCameraContext](/cn/miniapp/develop/miniapp/api/media/camera/createCameraContext)。这是基于异层渲染的原生组件, 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayCamera" 
  qrCodeUrl="/images/qrCode/rayCamera.png" 
  lang="zh">
</DemoBlock>

### 常见问题

1. 同一页面只能插入一个 `camera` 组件。
2. Tuya MiniApp IDE 上不支持。
3. 相关原理请参考 [基于异层渲染的原生组件](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
4. 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
### Image

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

图片组件，支持多种裁剪和缩放模式。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `src` | `string` | 是 | - | 图片资源地址 |
| `mode` | `"scaleToFill" \| "aspectFit" \| "aspectFill" \| "widthFix" \| "heightFix" \| "top" \| "bottom" \| "center" \| "left" \| "right" \| "top left" \| "top right" \| "bottom left" \| "bottom right"` | 否 | `"scaleToFill"` | 图片裁剪、缩放的模式 |
| `lazyLoad` | `boolean` | 否 | `false` | 懒加载，进入一定范围后再加载 |
| `fadeDuration` | `number` | 否 | `0` | 加载过程中渐显时长，单位 ms |
| `onError` | `(event: ImageErrorEvent) => void` | 否 | - | 加载失败时触发 |
| `onLoad` | `(event: ImageLoadEvent) => void` | 否 | - | 载入完毕时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Image, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Image
        src="https://images.tuyacn.com/smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg"
        style={{ width: '200px', height: '200px' }}
        onLoad={(e) => console.log('图片加载完成:', e.detail)}
        onError={(e) => console.log('图片加载失败:', e.detail)}
      />
    </View>
  );
}
```

##### 缩放模式

```tsx
import React, { useState } from 'react';
import { Image, View, Text, Button } from '@ray-js/ray';

export default function () {
  const [mode, setMode] = useState<string>('scaleToFill');
  const imgSrc = 'https://images.tuyacn.com/smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg';

  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>当前模式: {mode}</Text>
      <Image
        src={imgSrc}
        mode={mode}
        style={{ width: '300px', height: '200px', border: '1px solid #eee' }}
      />
      <View style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="mini" onClick={() => setMode('scaleToFill')}>
          scaleToFill
        </Button>
        <Button size="mini" onClick={() => setMode('aspectFit')}>
          aspectFit
        </Button>
        <Button size="mini" onClick={() => setMode('aspectFill')}>
          aspectFill
        </Button>
        <Button size="mini" onClick={() => setMode('widthFix')}>
          widthFix
        </Button>
      </View>
    </View>
  );
}
```

##### 懒加载与渐显

```tsx
import React from 'react';
import { Image, View, Text } from '@ray-js/ray';

export default function () {
  const imgSrc = 'https://images.tuyacn.com/smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg';

  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>懒加载 + 渐显 500ms:</Text>
      <Image
        src={imgSrc}
        lazyLoad
        fadeDuration={500}
        style={{ width: '300px', height: '200px' }}
        onLoad={(e) => console.log('加载完成:', e.detail)}
        onError={(e) => console.log('加载失败:', e.detail)}
      />
    </View>
  );
}
```
### IpcPlayer

> [VERSION] @ray-js/ray >= 0.6.9

#### 描述

实时视频播放组件。基于异层渲染的原生组件，请注意原生组件使用限制。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `deviceId` | `string` | 是 | `""` | 设备 id，组件的唯一标识符，必须设置 |
| `autoplay` | `boolean` | 否 | `false` | 自动播放 |
| `muted` | `boolean` | 否 | - | 是否静音 |
| `clarity` | `"ss" \| "normal" \| "hd" \| "ud" \| "ssp" \| "auto" \| "audio"` | 否 | `"normal"` | 清晰度：ss 省流量、normal 标清、hd 高清、ud 超清、ssp 超超清、auto 自动、audio 音频模式 |
| `soundMode` | `"speaker" \| "ear"` | 否 | `"speaker"` | 声音输出方式：speaker 扬声器、ear 听筒 |
| `orientation` | `"vertical" \| "horizontal"` | 否 | `"vertical"` | 画面方向：vertical 竖直、horizontal 水平 |
| `objectFit` | `"contain" \| "fillCrop"` | 否 | `"contain"` | 填充模式：contain 长边填满，fillCrop 铺满裁剪 |
| `autoPauseIfNavigate` | `boolean` | 否 | `true` | 跳转本小程序其他页面时是否自动暂停实时音视频 |
| `autoPauseIfOpenNative` | `boolean` | 否 | `true` | 跳转 App 其他原生页面时是否自动暂停实时音视频 |
| `rotateZ` | `number` | 否 | `0` | 摄像头旋转角度，0~360 |
| `scalable` | `boolean` | 否 | `true` | 当前是否可缩放 |
| `scaleMultiple` | `number` | 否 | `0` | 缩放比例，仅在 scalable 为 true 时生效 |
| `ptzControllable` | `boolean` | 否 | `true` | 是否开启视频区域云平台控制 |
| `borderWidth` | `number \| string` | 否 | `0` | 边框宽度，单位 px |
| `borderStyle` | `"solid" \| "dashed"` | 否 | `"solid"` | 边框样式：solid、dashed |
| `borderColor` | `string` | 否 | `"#ffffff"` | 边框颜色，十六进制 |
| `borderRadius` | `number \| string` | 否 | `0` | 边框圆角，单位 px |
| `backgroundColor` | `string` | 否 | `"#ffffff"` | 背景颜色，十六进制 |
| `onConnectchange` | `(event: IpcPlayerConnectChangeEvent) => void` | 否 | - | 当连接状态发生变化时触发，请使用 onConnectChange |
| `onPreviewchange` | `(event: IpcPlayerPreviewChangeEvent) => void` | 否 | - | 当预览状态发生变化时触发，请使用 onPreviewChange |
| `onOnlinechange` | `(event: IpcPlayerOnlineChangeEvent) => void` | 否 | - | 当设备在线状态变化时触发，请使用 onOnlineChange |
| `onInitdone` | `(event: IpcPlayerInitDoneEvent) => void` | 否 | - | 初始化完成时触发，请使用 onInitDone |
| `onZoomchange` | `(event: IpcPlayerZoomChangeEvent) => void` | 否 | - | 视频缩放比例变化时触发，请使用 onZoomChange |
| `onVideotap` | `(event: IpcPlayerVideotapEvent) => void` | 否 | - | 点击视频时触发，请使用 onVideoTap |
| `onConnectChange` | `(event: IpcPlayerConnectChangeEvent) => void` | 否 | - | 当连接状态发生变化时触发，state 为 0 表示连接成功 |
| `onPreviewChange` | `(event: IpcPlayerPreviewChangeEvent) => void` | 否 | - | 当预览状态发生变化时触发，state 为 1 表示开始预览成功，0 表示结束预览成功 |
| `onOnlineChange` | `(event: IpcPlayerOnlineChangeEvent) => void` | 否 | - | 当 IPC 设备在线状态变化时触发 |
| `onInitDone` | `(event: IpcPlayerInitDoneEvent) => void` | 否 | - | 初始化完成时触发 |
| `onZoomChange` | `(event: IpcPlayerZoomChangeEvent) => void` | 否 | - | 视频缩放比例及当前倍数变化时触发 |
| `onVideoTap` | `(event: IpcPlayerVideotapEvent) => void` | 否 | - | 点击视频时触发 |
| `onError` | `(event: IpcPlayerErrorEvent) => void` | 否 | - | 状态异常时触发 |
| `onSessionDidDisconnected` | `(event: IpcPlayerSessionDidDisconnectedEvent) => void` | 否 | - | 断开连接 |
| `onCameraPreviewFailure` | `(event: IpcPlayerCameraPreviewFailureEvent) => void` | 否 | - | 预览失败 |
| `onCameraNotifyWeakNetwork` | `(event: IpcPlayerCameraNotifyWeakNetworkEvent) => void` | 否 | - | 弱网通知 |
| `onCreateViewSuccess` | `(event: IpcPlayerCreateViewSuccessEvent) => void` | 否 | - | 异层组件创建成功时触发 |
| `onSelectVideoIndex` | `(event: IpcPlayerSelectVideoIndexEvent) => void` | 否 | - | 选中视频索引时触发 |
| `onLayoutStatusChanged` | `(event: IpcPlayerLayoutStatusChangedEvent) => void` | 否 | - | 布局状态改变时触发 |
| `onLocalizerViewLocated` | `(event: IpcPlayerLocalizerViewLocatedEvent) => void` | 否 | - | 定位器定位时触发 |
| `onSwipeAtVideoIndex` | `(event: IpcPlayerSwipeAtVideoIndexEvent) => void` | 否 | - | 滑动播放器手势上报、需要转动云台时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { IpcPlayer, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>IPC 实时视频</Text>
      <IpcPlayer
        deviceId="your-device-id"
        autoplay
        style={{ width: '100%', height: '300px' }}
        onInitDone={(e) => {
          console.log('初始化完成，最大缩放倍数:', e.detail.maxScaleMultiple);
        }}
        onError={(e) => {
          console.log('错误:', e.detail);
        }}
      />
    </View>
  );
}
```

##### IPC 播放控制

```tsx
import React, { useState } from 'react';
import { IpcPlayer, View, Text, Button, createIpcPlayerContext } from '@ray-js/ray';

export default function () {
  const [isOnline, setIsOnline] = useState(false);
  const [connectState, setConnectState] = useState(-1);
  const [previewState, setPreviewState] = useState(-1);
  const playerId = 'myIpcPlayer';

  const handleStartPreview = () => {
    const ctx = createIpcPlayerContext(playerId);
    ctx.startPreview();
  };

  const handleStopPreview = () => {
    const ctx = createIpcPlayerContext(playerId);
    ctx.stopPreview();
  };

  return (
    <View style={{ padding: '20px' }}>
      <IpcPlayer
        id={playerId}
        deviceId="your-device-id"
        autoplay={false}
        muted={false}
        clarity="hd"
        soundMode="speaker"
        orientation="vertical"
        objectFit="contain"
        scalable
        ptzControllable
        borderRadius={8}
        style={{ width: '100%', height: '300px' }}
        onConnectChange={(e) => {
          console.log('连接状态变化:', e.detail.state);
          setConnectState(e.detail.state);
        }}
        onPreviewChange={(e) => {
          console.log('预览状态变化:', e.detail.state);
          setPreviewState(e.detail.state);
        }}
        onOnlineChange={(e) => {
          console.log('在线状态变化:', e.detail.online);
          setIsOnline(e.detail.online);
        }}
        onZoomChange={(e) => {
          console.log('缩放变化:', e.detail.zoomLevel);
        }}
        onVideoTap={() => {
          console.log('点击视频');
        }}
        onError={(e) => {
          console.log('错误:', e.detail);
        }}
      />
      <View style={{ marginTop: '10px' }}>
        <Text>设备在线: {isOnline ? '是' : '否'}</Text>
        <Text>连接状态: {connectState === 0 ? '已连接' : '未连接'}</Text>
        <Text>预览状态: {previewState === 1 ? '预览中' : '未预览'}</Text>
      </View>
      <View style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', gap: '8px' }}>
        <Button size="mini" onClick={handleStartPreview}>开始预览</Button>
        <Button size="mini" onClick={handleStopPreview}>停止预览</Button>
      </View>
    </View>
  );
}
```

### 错误码

| 值    | 说明                              |
| ----- | --------------------------------- |
| -1000 | 其他未知异常                      |
| -1001 | connect 失败                      |
| -1002 | 开启预览失败                      |
| -1003 | 结束预览失败                      |
| -1004 | 设置静音失败                      |
| -1005 | 设置清晰度失败                    |
| -1006 | 截图失败                          |
| -1007 | 属性不合法                        |
| -1008 | 设置参数不合法                    |
| -1009 | disconnect 失败                   |
| -1010 | 网络状态不可用                    |
| -1011 | 设备离线                          |
| -1012 | 设备被移除                        |
| -1013 | startTalk fail                    |
| -1014 | StopTalk fail                     |
| -1015 | StartRecord fail                  |
| -1016 | StopRecord fail                   |
| -1017 | IsTalkBacking fail                |
| -1018 | SetAvailableRockerDirections fail |
| -1019 | IsPTZControllable fail            |
| -1020 | SetTrackingStatus fail            |
| -1021 | GetVideoInfo fail                 |

### 相关链接

相关 API：[createIpcPlayerContext](/cn/miniapp/develop/miniapp/api/media/ipc/createIpcContext)。这是基于异层渲染的原生组件, 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。

### 常见问题

1. `ipc-player` 默认宽度 300px、高度 225px，可通过 tyss 设置宽高。
2. Tuya MiniApp IDE 上暂不支持。
3. 相关原理请参考 [基于异层渲染的原生组件](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
4. 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
### Video

> [VERSION] @ray-js/ray >= 1.4.24

#### 描述

视频组件，支持播放控件、弹幕与全屏。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `src` | `string` | 是 | - | 要播放视频的资源地址，支持网络路径 |
| `duration` | `number` | 否 | `0` | 指定视频时长 |
| `controls` | `boolean` | 否 | `true` | 是否显示默认播放控件（播放/暂停按钮、播放进度、时间） |
| `danmuList` | `VideoDanmuItem[]` | 否 | - | 弹幕列表 |
| `danmuBtn` | `boolean` | 否 | `false` | 是否显示弹幕按钮，只在初始化时有效，不能动态变更 |
| `enableDanmu` | `boolean` | 否 | `false` | 是否展示弹幕，只在初始化时有效，不能动态变更 |
| `autoplay` | `boolean` | 否 | `false` | 是否自动播放 |
| `loop` | `boolean` | 否 | `false` | 是否循环播放 |
| `muted` | `boolean` | 否 | `false` | 是否静音播放 |
| `initialTime` | `number` | 否 | `0` | 指定视频初始播放位置 |
| `showFullscreenBtn` | `boolean` | 否 | `true` | 是否显示全屏按钮 |
| `showPlayBtn` | `boolean` | 否 | `true` | 是否显示视频底部控制栏的播放按钮 |
| `showCenterPlayBtn` | `boolean` | 否 | `true` | 是否显示视频中间的播放按钮 |
| `objectFit` | `"contain" \| "fill" \| "cover"` | 否 | `"contain"` | 当视频大小与 video 容器大小不一致时，视频的表现形式 |
| `poster` | `string` | 否 | - | 视频封面的图片网络资源地址 |
| `showMuteBtn` | `boolean` | 否 | `false` | 是否显示静音按钮 |
| `autoPause` | `boolean` | 否 | `true` | 非可视区域是否自动暂停 |
| `borderRadius` | `number` | 否 | `0` | 指定视频圆角半径（px） |
| `onPlay` | `() => void` | 否 | - | 当开始/继续播放时触发 |
| `onPause` | `() => void` | 否 | - | 当暂停播放时触发 |
| `onEnded` | `() => void` | 否 | - | 当播放到末尾时触发 |
| `onWaiting` | `() => void` | 否 | - | 视频出现缓冲时触发 |
| `onError` | `(event: VideoErrorEvent) => void` | 否 | - | 视频播放出错时触发 |
| `onProgress` | `(event: VideoProgressEvent) => void` | 否 | - | 加载进度变化时触发，只支持一段加载 |
| `onLoadedmetadata` | `(event: VideoLoadedmetadataEvent) => void` | 否 | - | 视频元数据加载完成时触发 |
| `onCanplay` | `() => void` | 否 | - | 当浏览器可以播放视频时触发 |
| `onCanplayThrough` | `() => void` | 否 | - | 当浏览器可在不因缓冲而停顿的情况下进行播放时触发 |
| `onPlaying` | `() => void` | 否 | - | 当视频在已因缓冲而暂停或停止后已就绪时触发 |
| `onRateChange` | `() => void` | 否 | - | 当视频的播放速度已更改时触发 |
| `onVolumeChange` | `() => void` | 否 | - | 当音量已更改时触发 |
| `onSeekComplete` | `(event: VideoSeekCompleteEvent) => void` | 否 | - | seek 完成时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Video, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Video
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        controls
        style={{ width: '100%', height: '200px' }}
        onPlay={() => console.log('开始播放')}
        onPause={() => console.log('暂停播放')}
        onEnded={() => console.log('播放结束')}
      />
    </View>
  );
}
```

##### 播放配置

```tsx
import React from 'react';
import { Video, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Video
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        poster="https://vjs.zencdn.net/v/oceans.png"
        controls
        autoplay={false}
        loop
        muted
        initialTime={5}
        objectFit="cover"
        showFullscreenBtn
        showPlayBtn
        showCenterPlayBtn={false}
        showMuteBtn
        autoPause
        borderRadius={12}
        style={{ width: '100%', height: '200px' }}
        onError={(e) => console.log('播放错误:', e.detail.errMsg)}
        onWaiting={() => console.log('缓冲中')}
      />
    </View>
  );
}
```

##### 弹幕与事件

```tsx
import React from 'react';
import { Video, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Video
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        controls
        enableDanmu
        danmuBtn
        danmuList={[
          { text: '精彩', color: '#ff0000', time: 1 },
          { text: '好看', color: '#00ff00', time: 3 },
          { text: '太棒了', color: '#0000ff', time: 5 },
        ]}
        style={{ width: '100%', height: '200px' }}
        onPlay={() => console.log('开始播放')}
        onPause={() => console.log('暂停')}
        onEnded={() => console.log('播放结束')}
        onProgress={(e) => console.log('缓冲:', e.detail.buffered + '%')}
        onLoadedmetadata={(e) => console.log('元数据:', e.detail.width, 'x', e.detail.height, '时长:', e.detail.duration)}
        onSeekComplete={(e) => console.log('seek 完成:', e.detail.position)}
      />
    </View>
  );
}
```

### 相关链接

相关 API: [createVideoContext](/cn/miniapp/develop/miniapp/api/media/video/createVideoContext)

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayVideo" 
  qrCodeUrl="/images/qrCode/rayVideo.png" 
  lang="zh">
</DemoBlock>

### 常见问题

#### Video 默认宽高和格式

1. `video` 默认宽度 300px、高度 225px，可通过 tyss 设置宽高。
2. `video` 支持三种视频格式：MP4、WebM、Ogg。
   - MP4 = MPEG 4 文件使用 H264 视频编解码器和 AAC 音频编解码器
   - WebM = WebM 文件使用 VP8 视频编解码器和 Vorbis 音频编解码器
   - Ogg = Ogg 文件使用 Theora 视频编解码器和 Vorbis 音频编解码器

#### 如何获取视频播放进度？

可通过`onTimeupdate` 获取视频播放时长。
### NativeVideo

> [VERSION] @ray-js/ray >= 0.6.9

#### 描述

原生视频播放组件。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `src` | `string` | 是 | - | 要播放视频的资源地址，支持网络路径；注意分区部署情况下视频是否支持访问 |
| `duration` | `number` | 否 | - | 指定视频时长，单位秒 |
| `controls` | `boolean` | 否 | `true` | 是否显示默认播放控件（播放/暂停按钮、播放进度、时间） |
| `autoplay` | `boolean` | 否 | `false` | 是否自动播放 |
| `loop` | `boolean` | 否 | `false` | 是否循环播放 |
| `muted` | `boolean` | 否 | `false` | 是否静音播放 |
| `initialTime` | `number` | 否 | `0` | 指定视频初始播放位置 |
| `showFullscreenBtn` | `boolean` | 否 | `true` | 是否显示全屏按钮 |
| `showPlayBtn` | `boolean` | 否 | `true` | 是否显示视频底部控制栏的播放按钮 |
| `showCenterPlayBtn` | `boolean` | 否 | `true` | 是否显示视频中间的播放按钮 |
| `objectFit` | `"contain" \| "fill" \| "cover"` | 否 | `"contain"` | 当视频大小与 video 容器大小不一致时，视频的表现形式 |
| `poster` | `string` | 否 | - | 视频封面图资源地址 |
| `showMuteBtn` | `boolean` | 否 | `false` | 是否显示静音按钮 |
| `borderWidth` | `number` | 否 | `0` | 边框的宽度，单位 px |
| `borderStyle` | `"solid" \| "dashed"` | 否 | `"solid"` | 边框的样式，可选值 solid 和 dashed |
| `borderColor` | `string` | 否 | `"#ffffff"` | 边框的颜色，必须为十六进制格式 |
| `borderRadius` | `number` | 否 | `0` | 边框的圆角，单位 px |
| `borderRadiusTopLeft` | `number` | 否 | - | 边框的左上角圆角大小，单位 px |
| `borderRadiusTopRight` | `number` | 否 | - | 边框的右上角圆角大小，单位 px |
| `borderRadiusBottomLeft` | `number` | 否 | - | 边框的左下角圆角大小，单位 px |
| `borderRadiusBottomRight` | `number` | 否 | - | 边框的右下角圆角大小，单位 px |
| `backgroundColor` | `string` | 否 | `"#ffffff"` | 背景颜色，必须为十六进制格式 |
| `onPlay` | `() => void` | 否 | - | 当开始/继续播放时触发 |
| `onPause` | `() => void` | 否 | - | 当暂停播放时触发 |
| `onEnded` | `() => void` | 否 | - | 当播放到末尾时触发 |
| `onTimeupdate` | `(event: NativeVideoTimeUpdateEvent) => void` | 否 | - | 播放进度变化时触发 |
| `onFullscreenchange` | `(event: NativeVideoFullscreenChangeEvent) => void` | 否 | - | 视频进入和退出全屏时触发 |
| `onWaiting` | `() => void` | 否 | - | 视频出现缓冲时触发 |
| `onError` | `(event: NativeVideoErrorEvent) => void` | 否 | - | 视频播放出错时触发 |
| `onProgress` | `(event: NativeVideoProgressEvent) => void` | 否 | - | 加载进度变化时触发，只支持一段加载 |
| `onLoadedmetadata` | `(event: NativeVideoLoadedMetadataEvent) => void` | 否 | - | 视频元数据加载完成时触发 |
| `onControlstoggle` | `(event: NativeVideoControlsToggleEvent) => void` | 否 | - | 切换 controls 显示隐藏时触发 |
| `onSeekcomplete` | `(event: NativeVideoSeekCompleteEvent) => void` | 否 | - | seek 完成时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { NativeVideo, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <NativeVideo
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        controls
        style={{ width: '100%', height: '200px' }}
        onPlay={() => console.log('开始播放')}
        onPause={() => console.log('暂停播放')}
        onEnded={() => console.log('播放结束')}
      />
    </View>
  );
}
```

##### 播放配置与封面

```tsx
import React from 'react';
import { NativeVideo, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <NativeVideo
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        poster="https://vjs.zencdn.net/v/oceans.png"
        controls
        autoplay={false}
        loop
        muted
        initialTime={3}
        objectFit="cover"
        showFullscreenBtn
        showPlayBtn
        showCenterPlayBtn={false}
        showMuteBtn
        style={{ width: '100%', height: '200px' }}
        onError={(e) => console.log('播放错误:', e.detail.errMsg)}
        onWaiting={() => console.log('缓冲中')}
        onTimeupdate={(e) => console.log('进度:', e.detail.currentTime, '/', e.detail.duration)}
      />
    </View>
  );
}
```

##### 自定义边框与事件

```tsx
import React from 'react';
import { NativeVideo, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <NativeVideo
        src="https://images.tuyacn.com/smart/miniapp/static/bay1749025753119qEYE/1776224294688148269da.mp4"
        controls
        borderWidth={2}
        borderStyle="dashed"
        borderColor="#1890ff"
        borderRadius={16}
        backgroundColor="#000000"
        style={{ width: '100%', height: '200px' }}
        onPlay={() => console.log('播放')}
        onPause={() => console.log('暂停')}
        onEnded={() => console.log('结束')}
        onFullscreenchange={(e) => console.log('全屏:', e.detail.fullScreen, '方向:', e.detail.direction)}
        onControlstoggle={(e) => console.log('控件显示:', e.detail.show)}
        onProgress={(e) => console.log('缓冲:', e.detail.buffered + '%')}
        onLoadedmetadata={(e) => console.log('元数据:', e.detail.width, 'x', e.detail.height)}
        onSeekcomplete={(e) => console.log('seek:', e.detail.position)}
      />
    </View>
  );
}
```

### 相关链接

相关 API: [createNativeVideoContext](/cn/miniapp/develop/miniapp/api/media/native-video/createNativeVideoContext)。这是基于异层渲染的原生组件, 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayVideo" 
  qrCodeUrl="/images/qrCode/rayVideo.png" 
  lang="zh">
</DemoBlock>

### 常见问题

1. `native-video` 默认宽度 300px、高度 225px，可通过 tyss 设置宽高。
2. 相关原理请参考 [基于异层渲染的原生组件](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
3. 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
4. `native-video` 支持的视频格式：MP4（MPEG 4 文件使用 H264 视频编解码器和 AAC 音频编解码器）。
