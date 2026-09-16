# 服务大厅 & 路由（VAS pageType / nativePageRoute / miniIdLabs）

VAS 运营 Banner（LayoutVas）的 `pageType` 跳转规则、原生页路由、外部小程序 ID。

## Knowledge

### 来源

- VAS 数据：`src/api/serviceHall/index.ts`（`getServiceHallSetting` / `getVasServiceConfigList`）
- VAS 渲染：`src/components/layout-vas/index.tsx`（`@ray-js/ray-ipc-half-horizontal-drag`）
- 路由常量：`src/config/cameraData.ts`
- 跳原生 / 小程序：`@ray-js/ray-ipc-utils` 的 `goToIpcPageNativeRoute` / `goToMiniProgramByShortLink`

### `nativePageRoute`（原生面板路由）

```ts
nativePageRoute = {
  ipcAlbumPanel:    'ipc_album_panel',       // 相册
  ipcCloudPanel:    'camera_cloud_panel',    // 云回放
  ipcPlayBackPanel: 'camera_playback_panel', // SD 卡回放
  ipcMessagePanel:  'camera_message_panel',  // 消息中心
};
```

跳转：

```ts
import { goToIpcPageNativeRoute } from '@ray-js/ray-ipc-utils';
import { nativePageRoute } from '@/config/cameraData';
import { getDevId, showToastError } from '@/utils';

const r = await goToIpcPageNativeRoute(nativePageRoute.ipcAlbumPanel, getDevId());
if (r.code === -1) showToastError(r?.msg?.errorMsg);
```

返回 `{ code: 0 | -1, msg: { errorMsg } }`；非 0 必须 toast 出来，否则用户点了像没反应。

### `miniIdLabs`（外部小程序 ID）

```ts
miniIdLabs = {
  deviceSettings:    'tycryc71qaug8at6yt', // 设备设置
  vasMini:           'tyeavwo0j4oocvdrf1', // 增值服务
  ipcHelpMini:       'tybxwaylc6inpkrgeu', // 帮助反馈
  ipcServiceHallMini:'tyhtutw16qihykz97n', // 服务大厅
};
```

跳转两种方式：

```ts
// 方式 1：openMiniPanelByCode（模板封装，更短）
import { openMiniPanelByCode } from '@/utils';
openMiniPanelByCode('setting');                  // 设备设置
openMiniPanelByCode('vas', { from: 'home' });    // 增值服务，带参

// 方式 2：直接 goToMiniProgramByShortLink（VAS 的 servicehall 等场景）
import { goToMiniProgramByShortLink } from '@ray-js/ray-ipc-utils';
goToMiniProgramByShortLink(item.shortLink, item.position);
```

### `panelCloudFunLabs`（云端配置 image-id → 字段名）

```ts
panelCloudFunLabs = {
  tyabijq3gf: 'playerFit',   // 'contain' | 'cover'
  tyabis5d9w: 'brandColor',  // hex
};
```

模板启动时通过 `usePanelConfig()` 拉取 `fun.tyabis5d9w` 等并写入 `panelInfo.brandColor` / `playerFit`，业务代码直接读 redux 即可。

### `global.config.ts`（设备设置功能页）

```ts
tuya.functionalPages.settings = {
  appid: 'tycryc71qaug8at6yt',
  entryCode: 'entrye0n05idydmmfv',
};
```

`ty.onAppMore(...)` 已在 `composeLayout.tsx` 注册为跳设备设置 — **不要**再注册一次。

### VAS Banner `pageType` 6 种跳转规则

模板拉取的 VAS 配置每条都有 `pageType` 决定如何跳。`LayoutVas` / `goByVas`（`src/utils/goByVas.ts` 等）已经实现，引用时按下表：

| `pageType` | 含义 | 跳转方式 |
|---|---|---|
| `1` | 跳云存原生页 | `goToIpcPageNativeRoute(nativePageRoute.ipcCloudPanel, devId)` |
| `2` | 跳服务大厅小程序 | `openMiniPanelByCode('vas')` 或 `goToMiniProgramByShortLink` |
| `3` | 内嵌 H5 | `ty.openInnerH5({ url })` |
| `4` | 跳指定 appid 的小程序 | `ty.navigateToMiniProgram({ appId, ... })` |
| `5` | 跳模板内页面 | `router.push(item.path)` |
| `6` | 自定义事件（业务自接）| `customEventDispatch` 或自己 dispatch |

具体字段（`pageType` / `pageUrl` / `extraData`）以服务端响应为准，参见 `getServiceHallSetting` 的返回类型。

### `getServiceHallSetting` 标准用法

```ts
import { getServiceHallSetting } from '@/api/serviceHall';
import { getDevId } from '@/utils';

const { code, data } = await getServiceHallSetting({
  devId: getDevId(),
  // 其他参数按 SDK 定义
});
if (code === 0) {
  // data.list 给 LayoutVas 渲染 banner
}
```

## Constraints

- **Must**: 跳原生页用 `goToIpcPageNativeRoute(route, devId)`；返回 `code === -1` 必须 toast `errorMsg`。
- **Must**: 跳设备设置用 `openMiniPanelByCode('setting')`，**不要**自己拼 `navigateToMiniProgram` 参数。
- **Must**: 云回放入口 `visibilityCondition` 用 `getIsSupportedCloudStorageSync(devId)`，不要硬编码可见。
- **Must**: SD 卡回放入口 `visibilityCondition` 必须读 `sd_status` DP（值在 `getDevCameraSdStatus` 列表里才可见）。
- **Must**: 消息中心入口在可移动机型（`getDevCategory('mobilecam')`）通常隐藏 — 移动设备消息走另一套。
- **Must not**: 自己写 `ty.navigateToMiniProgram({ appId: 'tycryc71...' })` —— 模板已封装，绕过会丢失 `position` 等参数。
- **Must not**: 把 `appid` / `entryCode` / `miniId` 写到组件代码里硬编码 — 一律从 `cameraData.ts` 引入。
