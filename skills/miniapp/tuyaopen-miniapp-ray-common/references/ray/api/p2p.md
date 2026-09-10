# P2P (p2p)

### p2p.P2PSDKInit

P2P SDK 初始化

> 需引入`P2PKit`，且在`>=2.1.0`版本才可使用。

> 在 ODM/v5.12.0 以上可以使用。

#### Use in Ray

```js
// @ray-js/ray >=1.4.62
import { p2p } from '@ray-js/ray';
const { P2PSDKInit } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * P2P SDK 初始化
 */
export function P2PSDKInit(params: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.deInitSDK

 P2P SDK 反初始化

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { deInitSDK } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * P2P SDK 反初始化
 */
export function deInitSDK(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.isP2PActive

 检查 P2P 连接

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { isP2PActive } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                                                     |
| -------- | ---------- | ------ | ---- | ------------------------------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                                                  |
| mode     | `number`   |        | 否   | 连接模式,0:INTERNET 1:LAN                                                |
| timeout  | `number`   |        | 否   | 超时时长,单位：ms,设置 0 会设置成默认值，Internet：15000ms， Lan：3000ms |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                         |
| success  | `function` |        | 否   | 接口调用成功的回调函数                                                   |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                                                   |

**函数定义示例**

```typescript
/**
 * 检查P2P连接
 */
export function isP2PActive(params: {
  /** 设备id */
  deviceId: string;
  /** 连接模式,0:INTERNET  1:LAN */
  mode?: number;
  /** 超时时长,单位：ms,设置0会设置成默认值，Internet：15000ms， Lan：3000ms */
  timeout?: number;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.isP2PActiveSync

 检查 P2P 连接同步方法

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { isP2PActiveSync } = p2p;
```

**参数**

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                     |
| -------- | -------- | ------ | ---- | ------------------------------------------------------------------------ |
| deviceId | `string` |        | 是   | 设备 id                                                                  |
| mode     | `number` |        | 否   | 连接模式,0:INTERNET 1:LAN                                                |
| timeout  | `number` |        | 否   | 超时时长,单位：ms,设置 0 会设置成默认值，Internet：15000ms， Lan：3000ms |

**函数定义示例**

```typescript
/**
 * 检查P2P连接
 */
export function isP2PActiveSync(params: {
  /** 设备id */
  deviceId: string;
  /** 连接模式,0:INTERNET  1:LAN */
  mode?: number;
  /** 超时时长,单位：ms,设置0会设置成默认值，Internet：15000ms， Lan：3000ms */
  timeout?: number;
}): null;
```
### p2p.connectDevice

 建立 P2P 连接

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { connectDevice } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                                                     |
| -------- | ---------- | ------ | ---- | ------------------------------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                                                  |
| mode     | `number`   |        | 否   | 连接模式,0:INTERNET 1:LAN                                                |
| timeout  | `number`   |        | 否   | 超时时长,单位：ms,设置 0 会设置成默认值，Internet：15000ms， Lan：3000ms |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                         |
| success  | `function` |        | 否   | 接口调用成功的回调函数                                                   |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                                                   |

**函数定义示例**

```typescript
/**
 * 建立P2P连接
 */
export function connectDevice(params: {
  /** 设备id */
  deviceId: string;
  /** 连接模式,0:INTERNET  1:LAN */
  mode?: number;
  /** 超时时长,单位：ms,设置0会设置成默认值，Internet：15000ms， Lan：3000ms */
  timeout?: number;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.disconnectDevice

 和设备断开连接

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { disconnectDevice } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 和设备断开连接
 */
export function disconnectDevice(params: {
  /** 设备id */
  deviceId: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.uploadFile

 P2P 上传文件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { uploadFile } = p2p;
```

**参数**

**Object object**

| 属性          | 类型       | 默认值 | 必填 | 说明                                             |
| ------------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId      | `string`   |        | 是   | 设备 id                                          |
| albumName     | `string`   |        | 是   | albumName 和设备端约定字段                       |
| filePath      | `string`   |        | 是   | 文件本地路径                                     |
| extData       | `string`   |        | 否   | 扩展字段                                         |
| extDataLength | `number`   |        | 否   | 扩展字段长度                                     |
| complete      | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success       | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail          | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * P2P上传文件
 */
export function uploadFile(params: {
  /** 设备id */
  deviceId: string;
  /** albumName 和设备端约定字段 */
  albumName: string;
  /** 文件本地路径 */
  filePath: string;
  /** 扩展字段 */
  extData?: string;
  /** 扩展字段长度 */
  extDataLength?: number;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.cancelUploadTask

 取消传输任务

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { cancelUploadTask } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 取消传输任务
 */
export function cancelUploadTask(params: {
  /** 设备id */
  deviceId: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.downloadFile

 P2P 下载文件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { downloadFile } = p2p;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                                                                                      |
| --------- | ---------- | ------ | ---- | --------------------------------------------------------------------------------------------------------- |
| deviceId  | `string`   |        | 是   | 设备 id                                                                                                   |
| albumName | `string`   |        | 是   | albumName 和设备端约定字段                                                                                |
| filePath  | `string`   |        | 是   | 下载文件本地存储路径                                                                                      |
| jsonfiles | `string`   |        | 是   | 下载的文件名称，eg: {&#34;files&#34;:[&#34;filesname1&#34;, &#34;filesname2&#34;, &#34;filesname3&#34; ]} |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                          |
| success   | `function` |        | 否   | 接口调用成功的回调函数                                                                                    |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                                                                                    |

**函数定义示例**

```typescript
/**
 * P2P下载文件
 */
export function downloadFile(params: {
  /** 设备id */
  deviceId: string;
  /** albumName 和设备端约定字段 */
  albumName: string;
  /** 下载文件本地存储路径 */
  filePath: string;
  /** 下载的文件名称，eg: {"files":["filesname1", "filesname2", "filesname3" ]} */
  jsonfiles: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.cancelDownloadTask

 取消下载任务

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { cancelDownloadTask } = p2p;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 取消下载任务
 */
export function cancelDownloadTask(params: {
  /** 设备id */
  deviceId: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.downloadStream

 P2P 下载数据流

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { downloadStream } = p2p;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                                                                                      |
| --------- | ---------- | ------ | ---- | --------------------------------------------------------------------------------------------------------- |
| deviceId  | `string`   |        | 是   | 设备 id                                                                                                   |
| albumName | `string`   |        | 是   | albumName 和设备端约定字段                                                                                |
| jsonfiles | `string`   |        | 是   | 下载的文件名称，eg: {&#34;files&#34;:[&#34;filesname1&#34;, &#34;filesname2&#34;, &#34;filesname3&#34; ]} |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                          |
| success   | `function` |        | 否   | 接口调用成功的回调函数                                                                                    |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                                                                                    |

**函数定义示例**

```typescript
/**
 * P2P下载数据流
 */
export function downloadStream(params: {
  /** 设备id */
  deviceId: string;
  /** albumName 和设备端约定字段 */
  albumName: string;
  /** 下载的文件名称，eg: {"files":["filesname1", "filesname2", "filesname3" ]} */
  jsonfiles: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.queryAlbumFileIndexs

 查询设备相册文件索引列表

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { queryAlbumFileIndexs } = p2p;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                             |
| --------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId  | `string`   |        | 是   | 设备 id                                          |
| albumName | `string`   |        | 是   | albumName 和设备端约定字段                       |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success   | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性  | 类型     | 说明     |
| ----- | -------- | -------- |
| count | `number` | 文件个数 |
| items | `array`  | 文件索引 |

**object.fail 回调参数**

**参数**

**Object res**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

**函数定义示例**

```typescript
/**
 * 查询设备相册文件索引列表
 */
export function queryAlbumFileIndexs(params: {
  /** 设备id */
  deviceId: string;
  /** albumName 和设备端约定字段 */
  albumName: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 文件个数 */
    count: number;
    /** 文件索引 */
    items: ThingP2PAlbumFileIndex[];
  }) => void;
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string;
    errorCode: string | number;
    innerError: {
      errorCode: string | number;
      errorMsg: string;
    };
  }) => void;
}): void;
```
### p2p.onSessionStatusChange

 连接状态改变回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { onSessionStatusChange } = p2p;
```

**参数**

**function callback**

连接状态改变回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明                      |
| -------- | -------- | ------ | ---- | ------------------------- |
| deviceId | `string` |        | 是   | 设备 id                   |
| status   | `number` |        | 是   | 状态值, 小于 0 为断开连接 |

**函数定义示例**

```typescript
/**
 * 连接状态改变回调
 */
export function onSessionStatusChange(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 状态值, 小于0为断开连接 */
    status: number;
  }) => void,
): void;
```
### p2p.offSessionStatusChange

 取消监听：连接状态改变回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { offSessionStatusChange } = p2p;
```

**参数**

**function callback**

取消监听：连接状态改变回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明                      |
| -------- | -------- | ------ | ---- | ------------------------- |
| deviceId | `string` |        | 是   | 设备 id                   |
| status   | `number` |        | 是   | 状态值, 小于 0 为断开连接 |

**函数定义示例**

```typescript
/**
 * 取消监听：连接状态改变回调
 */
export function offSessionStatusChange(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 状态值, 小于0为断开连接 */
    status: number;
  }) => void,
): void;
```
### onUploadProgressUpdate

#### 功能描述

上传进度回调

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { onUploadProgressUpdate } from '@ray-js/ray'
onUploadProgressUpdate({ ... })
```

**原生小程序中使用**

```javascript
ty.onUploadProgressUpdate({ ... })
```

#### 参数

**function listener**
上传进度回调
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明          |
| -------- | ------ | ------ | ---- | ------------- |
| filePath | string |        | 是   | the file path |
| progress | number |        | 是   | progress      |
### offUploadProgressUpdate

#### 功能描述

移除监听：上传进度回调

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { offUploadProgressUpdate } from '@ray-js/ray'
offUploadProgressUpdate({ ... })
```

**原生小程序中使用**

```javascript
ty.offUploadProgressUpdate({ ... })
```

#### 参数

**function listener**

onUploadProgressUpdate 传入的监听函数。不传此参数则移除所有监听函数。
### p2p.onDownloadProgressUpdate

 单个文件下载进度回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { onDownloadProgressUpdate } = p2p;
```

**参数**

**function callback**

单个文件下载进度回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明               |
| -------- | -------- | ------ | ---- | ------------------ |
| deviceId | `string` |        | 是   | 设备 id            |
| fileName | `string` |        | 是   | 正在下载的文件名称 |
| progress | `number` |        | 是   | 上传/下载进度      |

**函数定义示例**

```typescript
/**
 * 单个文件下载进度回调
 */
export function onDownloadProgressUpdate(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 正在下载的文件名称 */
    fileName: string;
    /** 上传/下载进度 */
    progress: number;
  }) => void,
): void;
```
### p2p.offDownloadProgressUpdate

 取消监听：单个文件下载进度回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { offDownloadProgressUpdate } = p2p;
```

**参数**

**function callback**

取消监听：单个文件下载进度回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明               |
| -------- | -------- | ------ | ---- | ------------------ |
| deviceId | `string` |        | 是   | 设备 id            |
| fileName | `string` |        | 是   | 正在下载的文件名称 |
| progress | `number` |        | 是   | 上传/下载进度      |

**函数定义示例**

```typescript
/**
 * 取消监听：单个文件下载进度回调
 */
export function offDownloadProgressUpdate(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 正在下载的文件名称 */
    fileName: string;
    /** 上传/下载进度 */
    progress: number;
  }) => void,
): void;
```
### p2p.onDownloadTotalProgressUpdate

 下载总进度回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { onDownloadTotalProgressUpdate } = p2p;
```

**参数**

**function callback**

下载总进度回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明          |
| -------- | -------- | ------ | ---- | ------------- |
| deviceId | `string` |        | 是   | 设备 id       |
| progress | `number` |        | 是   | 上传/下载进度 |

**函数定义示例**

```typescript
/**
 * 下载总进度回调
 */
export function onDownloadTotalProgressUpdate(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 上传/下载进度 */
    progress: number;
  }) => void,
): void;
```
### p2p.offDownloadTotalProgressUpdate

 取消监听：下载总进度回调

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { offDownloadTotalProgressUpdate } = p2p;
```

**参数**

**function callback**

取消监听：下载总进度回调的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明          |
| -------- | -------- | ------ | ---- | ------------- |
| deviceId | `string` |        | 是   | 设备 id       |
| progress | `number` |        | 是   | 上传/下载进度 |

**函数定义示例**

```typescript
/**
 * 取消监听：下载总进度回调
 */
export function offDownloadTotalProgressUpdate(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 上传/下载进度 */
    progress: number;
  }) => void,
): void;
```
### p2p.onFileDownloadComplete

 单文件下载完成事件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { onFileDownloadComplete } = p2p;
```

**参数**

**function callback**

单文件下载完成事件的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明    |
| -------- | -------- | ------ | ---- | ------- |
| deviceId | `string` |        | 是   | 设备 id |
| fileName | `string` |        | 是   | 文件名  |
| index    | `number` |        | 是   | 索引    |

**函数定义示例**

```typescript
/**
 * 单文件下载完成事件
 */
export function onFileDownloadComplete(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 文件名 */
    fileName: string;
    /** 索引 */
    index: number;
  }) => void,
): void;
```
### p2p.offFileDownloadComplete

 取消监听：单文件下载完成事件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { offFileDownloadComplete } = p2p;
```

**参数**

**function callback**

取消监听：单文件下载完成事件的回调函数

**回调参数 Object res**

| 属性     | 类型     | 默认值 | 必填 | 说明    |
| -------- | -------- | ------ | ---- | ------- |
| deviceId | `string` |        | 是   | 设备 id |
| fileName | `string` |        | 是   | 文件名  |
| index    | `number` |        | 是   | 索引    |

**函数定义示例**

```typescript
/**
 * 取消监听：单文件下载完成事件
 */
export function offFileDownloadComplete(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 文件名 */
    fileName: string;
    /** 索引 */
    index: number;
  }) => void,
): void;
```
### p2p.onStreamPacketReceive

 收到数据包事件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { onStreamPacketReceive } = p2p;
```

**参数**

**function callback**

收到数据包事件的回调函数

**回调参数 Object res**

| 属性             | 类型     | 默认值 | 必填 | 说明                           |
| ---------------- | -------- | ------ | ---- | ------------------------------ |
| deviceId         | `string` |        | 是   | 设备 id                        |
| totalFiles       | `number` |        | 是   | 文件个数                       |
| fileName         | `string` |        | 是   | 文件名                         |
| fileIndex        | `number` |        | 是   | 索引,目前错误数据              |
| fileLength       | `number` |        | 是   | 文件大小                       |
| packetData       | `string` |        | 是   | 数据                           |
| packetLength     | `number` |        | 是   | 包大小                         |
| fileSerialNumber | `number` |        | 是   | 文件序列号                     |
| packetIndex      | `number` |        | 是   | 包索引                         |
| packetType       | `number` |        | 是   | 包头/包尾 0b00XY Y:包头 X:包尾 |

**函数定义示例**

```typescript
/**
 * 收到数据包事件
 */
export function onStreamPacketReceive(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 文件个数 */
    totalFiles: number;
    /** 文件名 */
    fileName: string;
    /** 索引,目前错误数据 */
    fileIndex: number;
    /** 文件大小 */
    fileLength: number;
    /** 数据 */
    packetData: string;
    /** 包大小 */
    packetLength: number;
    /** 文件序列号 */
    fileSerialNumber: number;
    /** 包索引 */
    packetIndex: number;
    /** 包头/包尾 0b00XY Y:包头  X:包尾 */
    packetType: number;
  }) => void,
): void;
```
### p2p.offStreamPacketReceive

 取消监听：收到数据包事件

> 需引入`P2PKit`，且在`>=2.0.3`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.3.15
import { p2p } from '@ray-js/ray';
const { offStreamPacketReceive } = p2p;
```

**参数**

**function callback**

取消监听：收到数据包事件的回调函数

**回调参数 Object res**

| 属性             | 类型     | 默认值 | 必填 | 说明                           |
| ---------------- | -------- | ------ | ---- | ------------------------------ |
| deviceId         | `string` |        | 是   | 设备 id                        |
| totalFiles       | `number` |        | 是   | 文件个数                       |
| fileName         | `string` |        | 是   | 文件名                         |
| fileIndex        | `number` |        | 是   | 索引,目前错误数据              |
| fileLength       | `number` |        | 是   | 文件大小                       |
| packetData       | `string` |        | 是   | 数据                           |
| packetLength     | `number` |        | 是   | 包大小                         |
| fileSerialNumber | `number` |        | 是   | 文件序列号                     |
| packetIndex      | `number` |        | 是   | 包索引                         |
| packetType       | `number` |        | 是   | 包头/包尾 0b00XY Y:包头 X:包尾 |

**函数定义示例**

```typescript
/**
 * 取消监听：收到数据包事件
 */
export function offStreamPacketReceive(
  listener: (params: {
    /** 设备id */
    deviceId: string;
    /** 文件个数 */
    totalFiles: number;
    /** 文件名 */
    fileName: string;
    /** 索引,目前错误数据 */
    fileIndex: number;
    /** 文件大小 */
    fileLength: number;
    /** 数据 */
    packetData: string;
    /** 包大小 */
    packetLength: number;
    /** 文件序列号 */
    fileSerialNumber: number;
    /** 包索引 */
    packetIndex: number;
    /** 包头/包尾 0b00XY Y:包头  X:包尾 */
    packetType: number;
  }) => void,
): void;
```
