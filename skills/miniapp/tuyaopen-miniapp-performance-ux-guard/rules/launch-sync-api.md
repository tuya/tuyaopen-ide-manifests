---
id: launch-sync-api
priority: CRITICAL
category: Launch > Init
---

# 启动阶段避免阻塞式同步 API

## Rule
启动阶段（onLaunch/onLoad）减少同步 API 调用，避免阻塞 JS 线程；设备静态信息优先使用已缓存的接口或内存态。多个缓存 key 需要读取或写入时，Ray 小程序优先使用 `batchGetStorage` / `batchSetStorage` 批量异步处理。

参考：[batchGetStorage](https://developer.tuya.com/cn/miniapp/develop/ray/api/storage/batchGetStorage)、[batchSetStorage](https://developer.tuya.com/cn/miniapp/develop/ray/api/storage/batchSetStorage)。

## Bad (Ray 小程序)

```tsx
function bootstrap() {
  const user = ty.getStorageSync('user');
  const theme = ty.getStorageSync('theme');
  const featureFlags = ty.getStorageSync('featureFlags');
  const deviceInfo = ty.getSystemInfoSync();

  initApp({ user, theme, featureFlags, deviceInfo });
}
```

启动阶段连续调用同步 API，阻塞 JS 执行并推迟首屏。

## Good (Ray 小程序)

```tsx
import { batchGetStorage } from '@ray-js/ray';

async function bootstrap() {
  const deviceInfo = getCachedDeviceInfo();
  const sessionState = appStore.sessionState;

  batchGetStorage({
    keyList: ['user', 'theme', 'featureFlags'],
    success: ({ dataList }) => {
      hydrateCache(dataList);
    },
  });

  initApp({ deviceInfo, sessionState });
}
```

非关键持久化数据批量异步读取，静态设备信息和会话态优先使用已缓存内存值；写入多个 key 时同理优先 `batchSetStorage`。

## Why
同步 API 会阻塞 JS 执行线程，多次调用累积延迟可达数十毫秒，直接推迟首屏渲染。
