# 位置服务

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

## 接口能力

对位置服务的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.4.13` 使用。**

| 接口名                    | 描述                              |
| ------------------------- | --------------------------------- |
| getOutdoorsTracksDetail   | 获取设备轨迹点                    |
| getOutdoorsTracksLocation | 批量查询设备实时位置              |
| getOutdoorsTracksSegments | 获取设备轨迹分段                  |
| reportOutdoorsLocation    | 设备位置上报 `@ray-js/ray^1.4.39` |

### getOutdoorsTracksDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

根据时间段获取设备轨迹点。结束时间与起始时间差小于等于 7 天，单次最多返回 1000 个轨迹点。如果时间段内的轨迹点数量大于 1000 则返回前 1000 个轨迹点以及下次查询的开始时间。为提升响应速度，同时避免轨迹点过多造成请求超时，建议缩短每次请求的时间区间，将轨迹拆分成多段进行拼接。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `startTime` | `number` | 是 | 开始时间 13 位时间戳 |
| `endTime` | `number` | 是 | 结束时间 13 位时间戳 |
| `coordType` | `string` | 否 | 经纬度定位坐标系类型：WGS84、GCJ02、BD09LL；不传时国内默认高德，国外默认谷歌 |
| `needRated` | `boolean` | 否 | 倍率转换 |

#### 返回值

类型: `Promise<GetOutdoorsTracksDetailResult>`

GetOutdoorsTracksDetailResult（字段含义见类型定义与 minituya 返回值表）

###### GetOutdoorsTracksDetailResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `pointList` | `Point[]` | 是 | 轨迹点列表 |
| `startTime` | `number` | 是 | 下一页查询时的开始时间戳 |
| `hasMore` | `boolean` | 是 | 是否还有下一页 |

##### 引用对象

###### `interface` Point

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 点位 id |
| `mpId` | `number` | 是 | 移动点位 id |
| `coords` | `string` | 是 | 坐标串 |
| `pic` | `string` | 是 | 图片地址 |
| `encryption` | `Object` | 是 | 路径点位坐标等敏感字段的加密信息 |

###### `type` Point.encryption

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 加密密钥 |

#### 示例代码

##### 请求示例

```typescript
import { getOutdoorsTracksDetail } from '@tuya-miniapp/cloud-api';

getOutdoorsTracksDetail({
  deviceId: 'vdevo16245017293',
  startTime: 1625198100154,
  endTime: 1625198190154,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  "deviceId": "vdevo16245017293****",
  "hasMore": false,
  "pointList": [
    {
      "lon": 114.003117,
      "battery": 100,
      "speed": 100,
      "protocol": "GPS",
      "lat": 22.594031,
      "mileage": 0,
      "timestamp": 1625198100154
    }
  ]
}
```
### getOutdoorsTracksLocation

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通���权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

根据设备 ID 批量查询设备实时位置。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceIds` | `string` | 是 | 设备 ID 集合，以逗号分开，最多 50 个 |
| `coordType` | `string` | 否 | 经纬度定位坐标系类型：WGS84、GCJ02、BD09LL；不传时国内默认高德，国外默认谷歌 |

#### 返回值

类型: `Promise<GetOutdoorsTracksLocationResult>`

GetOutdoorsTracksLocationResult（字段含义见类型定义与 minituya 返回值表）

###### GetOutdoorsTracksLocationResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceLocationList` | `DeviceLocationItem[]` | 是 | 各设备实时位置列表 |

##### 引用对象

###### `type` DeviceLocationItem

实时位置项：文档「DeviceLocationItem 说明」将 `protocol` 写作数值类型，「返回示例」为字符串（如 `"GPS"`）；上报时间参数表为 `reportTime`，返回示例为 `timestamp`。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `lon` | `number` | 是 | 经度 |
| `lat` | `number` | 是 | 纬度 |
| `speed` | `number` | 是 | 速度 |
| `protocol` | `string` | 是 | 定位协议 |
| `reportTime` | `number` | 否 | 上报时间（参数表） |
| `timestamp` | `number` | 否 | 时间戳（部分返回示例） |

#### 示例代码

##### 请求示例

```typescript
import { getOutdoorsTracksLocation } from '@tuya-miniapp/cloud-api';

getOutdoorsTracksLocation({
  deviceIds: 'vdevo16245017293',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  "deviceLocationList": [
    {
      "deviceId": "vdevo16245017293****",
      "lon": 114.003117,
      "speed": 100,
      "protocol": "GPS",
      "lat": 22.594031,
      "timestamp": 1625198100154
    }
  ]
}
```
### getOutdoorsTracksSegments

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

分页获取设备轨迹分段，结束时间与起始时间差小于等于 7 天，单次最多返回 1000 个轨迹分段。如果时间段内的轨迹分段数量大于 1000 就返回前 1000 个轨迹分段以及下次查询的分页的起始 ID。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `startTime` | `number` | 是 | 开始时间 13 位时间戳 |
| `endTime` | `number` | 是 | 结束时间 13 位时间戳 |
| `lastId` | `number` | 否 | 下一页起始 ID，第一次请求传空 |
| `needRated` | `boolean` | 否 | 倍率转换 |
| `lessMileage` | `number` | 否 | 只返回里程大于 lessMileage 的轨迹 |

#### 返回值

类型: `Promise<TrackSegment[]>`

GetOutdoorsTracksSegmentsResult（字段含义见类型定义与 minituya 返回值表）

##### 引用对象

###### `type` SegmentItem

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `startTime` | `number` | 是 | 分段开始时间（13 位时间戳） |
| `endTime` | `number` | 是 | 分段结束时间（13 位时间戳） |
| `duration` | `number` | 是 | 持续时长 |
| `speed` | `number` | 是 | 速度 |
| `mileage` | `number` | 是 | 里程 |
| `battery` | `number` | 是 | 电量 |

#### 示例代码

##### 请求示例

```typescript
import { getOutdoorsTracksSegments } from '@tuya-miniapp/cloud-api';

getOutdoorsTracksSegments({
  deviceId: 'vdevo16245017293',
  startTime: 1625198100154,
  endTime: 1625198190154,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  "deviceId": "vdevo16245017293****",
  "segmentList": [
    {
      "endTime": 1625198190154,
      "battery": 5,
      "speed": 100,
      "duration": 3000,
      "startTime": 1625198100154,
      "mileage": 10
    }
  ],
  "hasMore": false
}
```
### reportOutdoorsLocation

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

设备位置上报。本封装将 lon、lat 及可选扩展字段序列化为云端所需的 payload JSON 字符串后提交。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `pid` | `string` | 是 | 产品 ID |
| `lat` | `number` | 是 | 纬度，例如：12.1 |
| `lon` | `number` | 是 | 经度，例如：123.1 |
| `accuracy` | `number` | 否 | 精度，单位：米，例如：100 |
| `battery` | `number` | 否 | 电量，例如：10 |
| `direction` | `number` | 否 | 方向数值，范围 [0~360]，例如：10 |
| `height` | `number` | 否 | 高度，单位：米，例如：10 |
| `coordinate` | `"GCJ02" \| "BD09LL"` | 否 | 坐标系：GCJ02、BD09LL 等，例如 GCJ02 |
| `speed` | `number` | 否 | 速度，单位 km/h，例如：100 |
| `mileage` | `number` | 否 | 里程，单位 KM，例如：100 |
| `start` | `boolean` | 否 | 启动，true/false，例如：false |
| `connectStatus` | `1 \| 2` | 否 | 连接/断开：1 或 2，例如：1 |

#### 返回值

类型: `Promise<boolean>`

boolean：文档说明为 true 表示成功，false 表示失败。

#### 示例代码

##### 请求示例

```typescript
import { reportOutdoorsLocation } from '@tuya-miniapp/cloud-api';

reportOutdoorsLocation({
  deviceId: 'vdevo16245017293',
  pid: 'p16245017293',
  lat: 12.1,
  lon: 123.1,
  accuracy: 100,
  battery: 10,
  direction: 10,
  height: 10,
  coordinate: 'GCJ02',
  speed: 100,
  mileage: 100,
  start: false,
  connectStatus: 1,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true
```
### openOutdoorCyclingNavigation

跳转骑行导航页面

#### 引入

```js
import { openOutdoorCyclingNavigation } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.29`版本才可使用

> `开发者工具`环境无法使用，需要打包后或真机调试使用。

> 注意：当前功能仅在`智慧出行App`开通使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| devId    | `string`   |        | 否   | 设备 id                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 请求示例

```ts
openOutdoorCyclingNavigation({
  devId: "devId"
}).then(() => {
  console.log('调用成功跳转骑行导航页面');
});
```
### getOutdoorDeviceIcon

根据设备ids获取出行产品图片

#### 引入

```js
import { getOutdoorDeviceIcon } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.43`版本才可使用

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceIds    | `string[]`   |        | 是   | 设备 ids                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**返回**
```ts
type Res ={
  [productId: string]: { icon: string; smallIcon: string };
};
```

#### 请求示例

```ts
getOutdoorDeviceIcon({
    deviceIds: ['vdevo170652473904684'],
}).then(res => {
    console.log('getOutdoorDeviceIcon', res);
});
```

#### 返回示例
```json
{
    "4ms1azmcxy7wjwj8": {
        "icon": "https://images.tuyacn.com/smart/program_category_icon/ms.png",
        "smallIcon": "https://images.tuyacn.com/smart/icon/bay1605582134561QSaA/d3f661e710e726ab8ab3e665cd639282.png"
    }
}
```
### outdoor.currentDevice

###### 出行获取当前首页展示的设备 ID

> 需引入`OutdoorKit`，且在`>=1.0.0`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { currentDevice } = outdoor;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性     | 类型     | 说明             |
| -------- | -------- | ---------------- |
| deviceID | `string` | deviceID 设备 ID |

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
 * 出行获取当前首页展示的设备ID
 */
export function currentDevice(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** deviceID 设备ID */
    deviceID: string;
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
### outdoor.getBoundDeviceIdList

###### 获取已绑定设备 ID 集合

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { getBoundDeviceIdList } = outdoor;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性      | 类型    | 说明                     |
| --------- | ------- | ------------------------ |
| devIdList | `array` | 返回已绑定的设备 ID 集合 |

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
 * 获取已绑定设备ID集合
 */
export function getBoundDeviceIdList(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 返回已绑定的设备ID集合 */
    devIdList: string[];
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
### outdoor.getUnbindDeviceIdList

###### 获取可绑定设备 ID 集合

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { getUnbindDeviceIdList } = outdoor;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性      | 类型    | 说明                     |
| --------- | ------- | ------------------------ |
| devIdList | `array` | 返回可绑定的设备 ID 集合 |

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
 * 获取可绑定设备ID集合
 */
export function getUnbindDeviceIdList(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 返回可绑定的设备ID集合 */
    devIdList: string[];
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
### outdoor.bindSlaveDevice

###### 从设备绑定

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { bindSlaveDevice } = outdoor;
```

**参数**

**Object object**

| 属性        | 类型       | 默认值 | 必填 | 说明                                             |
| ----------- | ---------- | ------ | ---- | ------------------------------------------------ |
| slaveDevId  | `string`   |        | 是   | 从设备 ID                                        |
| masterDevId | `string`   |        | 是   | 主设备 ID                                        |
| complete    | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success     | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail        | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 从设备绑定
 */
export function bindSlaveDevice(params: {
  /** 从设备ID */
  slaveDevId: string;
  /** 主设备ID */
  masterDevId: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.unbindDevice

###### 从设备移除

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { unbindDevice } = outdoor;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| devId    | `string`   |        | 是   | 从设备 ID                                        |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 从设备移除
 */
export function unbindDevice(params: {
  /** 从设备ID */
  devId: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.saveTTSData

###### 保存骑行语音播报数据

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { saveTTSData } = outdoor;
```

**参数**

**Object object**

| 属性              | 类型       | 默认值 | 必填 | 说明                                             |
| ----------------- | ---------- | ------ | ---- | ------------------------------------------------ |
| ttsMainSwitch     | `boolean`  |        | 是   | 骑行数据播报总开关                               |
| weather           | `boolean`  |        | 是   | 天气                                             |
| abnormalWear      | `boolean`  |        | 是   | 骑行数据播报总开关                               |
| cyclingMileage    | `boolean`  |        | 是   | 骑行里程                                         |
| lowBattery        | `boolean`  |        | 是   | 低电量                                           |
| electricThreshold | `number`   |        | 是   | 具体电量数值                                     |
| callReminder      | `boolean`  |        | 是   | 骑行里程                                         |
| complete          | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success           | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail              | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 保存骑行语音播报数据
 */
export function saveTTSData(params: {
  /** 骑行数据播报总开关 */
  ttsMainSwitch: boolean;
  /** 天气 */
  weather: boolean;
  /** 骑行数据播报总开关 */
  abnormalWear: boolean;
  /** 骑行里程 */
  cyclingMileage: boolean;
  /** 低电量 */
  lowBattery: boolean;
  /** 具体电量数值 */
  electricThreshold: number;
  /** 骑行里程 */
  callReminder: boolean;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.getTTSData

###### 获取骑行播报数据

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { getTTSData } = outdoor;
```

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性              | 类型      | 说明               |
| ----------------- | --------- | ------------------ |
| ttsMainSwitch     | `boolean` | 骑行数据播报总开关 |
| weather           | `boolean` | 天气               |
| abnormalWear      | `boolean` | 骑行数据播报总开关 |
| cyclingMileage    | `boolean` | 骑行里程           |
| lowBattery        | `boolean` | 低电量             |
| electricThreshold | `number`  | 具体电量数值       |
| callReminder      | `boolean` | 骑行里程           |

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
 * 获取骑行播报数据
 */
export function getTTSData(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 骑行数据播报总开关 */
    ttsMainSwitch: boolean;
    /** 天气 */
    weather: boolean;
    /** 骑行数据播报总开关 */
    abnormalWear: boolean;
    /** 骑行里程 */
    cyclingMileage: boolean;
    /** 低电量 */
    lowBattery: boolean;
    /** 具体电量数值 */
    electricThreshold: number;
    /** 骑行里程 */
    callReminder: boolean;
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
### outdoor.isCallPhoneGranted

###### 是否有通话权限

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { isCallPhoneGranted } = outdoor;
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
 * 是否有通话权限
 */
export function isCallPhoneGranted(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.requestCallPhonePermission

###### 申请通话权限

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { requestCallPhonePermission } = outdoor;
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
 * 申请通话权限
 */
export function requestCallPhonePermission(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.saveDialViewTag

###### 小程序表盘设置

> 需引入`OutdoorKit`，且在`>=1.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { saveDialViewTag } = outdoor;
```

**参数**

**Object object**

| 属性          | 类型       | 默认值 | 必填 | 说明                                             |
| ------------- | ---------- | ------ | ---- | ------------------------------------------------ |
| leftViewTag   | `string`   |        | 是   | 表盘左侧                                         |
| centerViewTag | `string`   |        | 是   | 表盘中间数据                                     |
| rightViewTag  | `string`   |        | 是   | 表盘右侧数据                                     |
| complete      | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success       | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail          | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 小程序表盘设置
 */
export function saveDialViewTag(params: {
  /** 表盘左侧 */
  leftViewTag: string;
  /** 表盘中间数据 */
  centerViewTag: string;
  /** 表盘右侧数据 */
  rightViewTag: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
### outdoor.switchDevice

###### 切换设备，会弹出 Native 切换选择器

> 需引入`OutdoorKit`，且在`>=1.0.4`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.40
import { outdoor } from '@ray-js/ray';
const { switchDevice } = outdoor;
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
 * 切换设备，会弹出Native切换选择器
 */
export function switchDevice(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: boolean) => void;
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
