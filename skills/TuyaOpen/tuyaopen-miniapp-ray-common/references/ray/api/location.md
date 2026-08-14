# 位置 (location)

### map.getLocation

获取当前的地理位置、速度

> 需引入`MapKit`，且在`>=1.0.6`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { getLocation } = map;
```

**参数**

**Object object**

| 属性                   | 类型       | 默认值 | 必填 | 说明                                                                               |
| ---------------------- | ---------- | ------ | ---- | ---------------------------------------------------------------------------------- |
| type                   | `string`   |        | 是   | wgs84 返回 gps 坐标，gcj02 返回可用于 openLocation 的坐标                          |
| altitude               | `boolean`  |        | 是   | 传入 true 会返回高度信息，由于获取高度需要较高精确度，会减慢接口返回速度           |
| isHighAccuracy         | `boolean`  |        | 是   | 开启高精度定位                                                                     |
| highAccuracyExpireTime | `number`   |        | 是   | 高精度定位超时时间(ms)，指定时间内返回最高精度，该值 3000ms 以上高精度定位才有效果 |
| complete               | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                   |
| success                | `function` |        | 否   | 接口调用成功的回调函数                                                             |
| fail                   | `function` |        | 否   | 接口调用失败的回调函数                                                             |

**object.success 回调参数**

**参数**

**Object res**

| 属性               | 类型     | 说明                                         |
| ------------------ | -------- | -------------------------------------------- |
| latitude           | `number` | 纬度，范围为 -90~90，负数表示南纬            |
| longitude          | `number` | 经度，范围为 -180~180，负数表示西经          |
| speed              | `number` | 速度，单位 m/s                               |
| accuracy           | `number` | 位置的精确度                                 |
| altitude           | `number` | 高度，单位 m                                 |
| verticalAccuracy   | `number` | 垂直精度，单位 m（Android 无法获取，返回 0） |
| horizontalAccuracy | `number` | 水平精度，单位 m                             |
| cityName           | `string` | 城市名称street                               |
| streetName         | `string` | 街道名称                                     |
| address            | `string` | 位置名称                                     |
| countryCode        | `string` | 国家码                                       |
| postalCode         | `string` | 邮编                                         |
| countryName        | `string` | 国家名                                       |
| province           | `string` | 省名                                         |
| district           | `string` | 区名, 次级区域名                             |

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
 * 获取当前的地理位置、速度
 */
export function getLocation(params: {
  /** wgs84 返回 gps 坐标，gcj02 返回可用于 openLocation 的坐标 */
  type: string;
  /** 传入 true 会返回高度信息，由于获取高度需要较高精确度，会减慢接口返回速度 */
  altitude: boolean;
  /** 开启高精度定位 */
  isHighAccuracy: boolean;
  /** 高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果 */
  highAccuracyExpireTime: number;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 纬度，范围为 -90~90，负数表示南纬 */
    latitude: number;
    /** 经度，范围为 -180~180，负数表示西经 */
    longitude: number;
    /** 速度，单位 m/s */
    speed: number;
    /** 位置的精确度 */
    accuracy: number;
    /** 高度，单位 m */
    altitude: number;
    /** 垂直精度，单位 m（Android 无法获取，返回 0） */
    verticalAccuracy: number;
    /** 水平精度，单位 m */
    horizontalAccuracy: number;
    /** 城市名称street */
    cityName: string;
    /** 街道名称 */
    streetName: string;
    /** 位置名称 */
    address: string;
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
### map.getMapList

 获取可跳转第三方地图的地图类型

> 需引入`MapKit`，且在`>=2.1.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { getMapList } = map;
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

| 属性 | 类型    | 说明                                                                                         |
| ---- | ------- | -------------------------------------------------------------------------------------------- |
| maps | `array` | 可跳转的地图厂商，目前支持：BMK：百度地图 MA：高德地图 TENCENT：腾讯地图 Google：Google 地图 |

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
 * 获取可跳转第三方地图的地图类型
 */
export function getMapList(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 可跳转的地图厂商，目前支持：BMK：百度地图 MA：高德地图 TENCENT：腾讯地图 Google：Google地图 */
    maps: string[];
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
### map.chooseLocation

 打开地图选择位置。

> 需引入`MapKit`，且在`>=1.0.6`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { chooseLocation } = map;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                             |
| --------- | ---------- | ------ | ---- | ------------------------------------------------ |
| latitude  | `number`   |        | 否   | 目标地纬度                                       |
| longitude | `number`   |        | 否   | 目标地经度                                       |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success   | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性      | 类型     | 说明                                                                |
| --------- | -------- | ------------------------------------------------------------------- |
| name      | `string` | 位置名称                                                            |
| address   | `string` | 详细地址                                                            |
| latitude  | `number` | 纬度，浮点数，范围为-90~90，负数表示南纬。使用 gcj02 国测局坐标系   |
| longitude | `number` | 经度，浮点数，范围为-180~180，负数表示西经。使用 gcj02 国测局坐标系 |

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
 * 打开地图选择位置。
 */
export function chooseLocation(params?: {
  /** 目标地纬度 */
  latitude?: number;
  /** 目标地经度 */
  longitude?: number;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 位置名称 */
    name: string;
    /** 详细地址 */
    address: string;
    /** 纬度，浮点数，范围为-90~90，负数表示南纬。使用 gcj02 国测局坐标系 */
    latitude: number;
    /** 经度，浮点数，范围为-180~180，负数表示西经。使用 gcj02 国测局坐标系 */
    longitude: number;
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
### map.updateGeofence

 更新地理围栏

权限: [scope.location]

> 需引入`MapKit`，且在`>=3.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { updateGeofence } = map;
```

**参数**

**Object object**

| 属性               | 类型       | 默认值 | 必填 | 说明                                             |
| ------------------ | ---------- | ------ | ---- | ------------------------------------------------ |
| registerGeoFence   | `array`    |        | 是   | 注册的地理围栏                                   |
| unregisterGeoFence | `array`    |        | 是   | 取消的地理围栏                                   |
| complete           | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success            | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail               | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success 回调参数**

**参数**

**Object res**

| 属性    | 类型      | 说明     |
| ------- | --------- | -------- |
| success | `boolean` | 更新成功 |

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
 * 更新地理围栏
 *权限: [scope.location]
 */
export function updateGeofence(params: {
  /** 注册的地理围栏 */
  registerGeoFence: GeofenceInfo[];
  /** 取消的地理围栏 */
  unregisterGeoFence: GeofenceInfo[];
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 更新成功 */
    success?: boolean;
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
### map.isGeofenceReachLimit

 地理围栏是否达到上限

权限: [scope.location]

> 需引入`MapKit`，且在`>=3.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { isGeofenceReachLimit } = map;
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

| 属性       | 类型      | 说明                 |
| ---------- | --------- | -------------------- |
| reachLimit | `boolean` | 地理围栏是否达到上限 |

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
 * 地理围栏是否达到上限
 *权限: [scope.location]
 */
export function isGeofenceReachLimit(params?: {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void;
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 地理围栏是否达到上限 */
    reachLimit?: boolean;
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
### map.openGeofenceMap

 打开地理围栏地图页面,获取地理围栏信息(新建或者编辑地理围栏)

权限: [scope.location]

> 需引入`MapKit`，且在`>=3.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { openGeofenceMap } = map;
```

**参数**

**Object object**

| 属性       | 类型       | 默认值 | 必填 | 说明                                             |
| ---------- | ---------- | ------ | ---- | ------------------------------------------------ |
| geoTitle   | `string`   |        | 否   | 地理围栏名称                                     |
| longitude  | `number`   |        | 否   | 经度                                             |
| latitude   | `number`   |        | 否   | 纬度                                             |
| radius     | `number`   |        | 否   | 半径                                             |
| geofenceId | `string`   |        | 否   | id                                               |
| type       | `number`   |        | 否   | 半径 0:进度地理围栏 1：离开地理围栏              |
| complete   | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success    | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail       | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 打开地理围栏地图页面,获取地理围栏信息(新建或者编辑地理围栏)
 *权限: [scope.location]
 */
export function openGeofenceMap(params?: {
  /** 地理围栏名称 */
  geoTitle?: string;
  /** 经度 */
  longitude?: number;
  /** 纬度 */
  latitude?: number;
  /** 半径 */
  radius?: number;
  /** id */
  geofenceId?: string;
  /**
   * 半径
   * 0:进度地理围栏
   * 1：离开地理围栏
   */
  type?: number;
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
### map.openMapAppLocation

 使用三方地图查看位置

> 需引入`MapKit`，且在`>=2.1.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { openMapAppLocation } = map;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                                                                 |
| --------- | ---------- | ------ | ---- | ------------------------------------------------------------------------------------ |
| latitude  | `number`   |        | 是   | 纬度，范围为 -90~90，负数表示南纬                                                    |
| longitude | `number`   |        | 是   | 经度，范围为 -180~180，负数表示西经                                                  |
| name      | `string`   |        | 是   | 位置名                                                                               |
| address   | `string`   |        | 是   | 地址的详细说明                                                                       |
| mapType   | `string`   |        | 是   | 地图类型，目前支持：BMK：百度地图 MA：高德地图 TENCENT：腾讯地图 Google：Google 地图 |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                     |
| success   | `function` |        | 否   | 接口调用成功的回调函数                                                               |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                                                               |

**函数定义示例**

```typescript
/**
 * 使用三方地图查看位置
 */
export function openMapAppLocation(params: {
  /** 纬度，范围为 -90~90，负数表示南纬 */
  latitude: number;
  /** 经度，范围为 -180~180，负数表示西经 */
  longitude: number;
  /** 位置名 */
  name: string;
  /** 地址的详细说明 */
  address: string;
  /** 地图类型，目前支持：BMK：百度地图 MA：高德地图 TENCENT：腾讯地图 Google：Google地图 */
  mapType: string;
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
### map.registerGeofence

 注册地理围栏

权限: [scope.location]

> 需引入`MapKit`，且在`>=3.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { registerGeofence } = map;
```

**参数**

**Object object**

| 属性       | 类型       | 默认值 | 必填 | 说明                                             |
| ---------- | ---------- | ------ | ---- | ------------------------------------------------ |
| geoTitle   | `string`   |        | 否   | 地理围栏名称                                     |
| longitude  | `number`   |        | 否   | 经度                                             |
| latitude   | `number`   |        | 否   | 纬度                                             |
| radius     | `number`   |        | 否   | 半径                                             |
| geofenceId | `string`   |        | 否   | id                                               |
| type       | `number`   |        | 否   | 半径 0:进度地理围栏 1：离开地理围栏              |
| complete   | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success    | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail       | `function` |        | 否   | 接口调用失败的回调函数                           |

**函数定义示例**

```typescript
/**
 * 注册地理围栏
 *权限: [scope.location]
 */
export function registerGeofence(params?: {
  /** 地理围栏名称 */
  geoTitle?: string;
  /** 经度 */
  longitude?: number;
  /** 纬度 */
  latitude?: number;
  /** 半径 */
  radius?: number;
  /** id */
  geofenceId?: string;
  /**
   * 半径
   * 0:进度地理围栏
   * 1：离开地理围栏
   */
  type?: number;
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
### map.unregisterGeofence

 取消地理围栏
权限: [scope.location]

> 需引入`MapKit`，且在`>=3.0.1`版本才可使用
>
> 
>
> 

#### Use in Ray

```js
// @ray-js/ray >=1.1.0
import { map } from '@ray-js/ray';
const { unregisterGeofence } = map;
```

**参数**

**Object object**

| 属性    | 类型    |  默认值    |  必填    |  说明    |
| ------ | ------ | ------ | ------ | ------ |
| geoTitle | `string` | |  否 | 地理围栏名称 |
| longitude | `number` | |  否 | 经度 |
| latitude | `number` | |  否 | 纬度 |
| radius | `number` | |  否 | 半径 |
| geofenceId | `string` | |  否 | id |
| type | `number` | |  否 | 半径 0:进度地理围栏 1：离开地理围栏 |
| complete | `function` | |  否 | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success | `function` | |  否 | 接口调用成功的回调函数 |
| fail | `function` | |  否 | 接口调用失败的回调函数 |

**函数定义示例**

```typescript
/**
 * 取消地理围栏
 *权限: [scope.location]
 */
export function unregisterGeofence(params?: {
  /** 地理围栏名称 */
  geoTitle?: string
  /** 经度 */
  longitude?: number
  /** 纬度 */
  latitude?: number
  /** 半径 */
  radius?: number
  /** id */
  geofenceId?: string
  /**
   * 半径
   * 0:进度地理围栏
   * 1：离开地理围栏
   */
  type?: number
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
  /** 接口调用成功的回调函数 */
  success?: (params: null) => void
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string
    errorCode: string | number
    innerError: {
      errorCode: string | number
      errorMsg: string
    }
  }) => void
}): void


```
### map.transformLocation

根据经纬度获取地址

> 需引入`MapKit`，且在`>=3.2.2`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.4.38
import { map } from '@ray-js/ray';
const { transformLocation } = map;
```

**参数**

**Object object**

| 属性      | 类型       | 默认值 | 必填 | 说明                                                      |
| --------- | ---------- | ------ | ---- | --------------------------------------------------------- |
| type      | `string`   |        | 是   | wgs84 返回 gps 坐标，gcj02 返回可用于 openLocation 的坐标 |
| latitude  | `number`   |        | 是   | 纬度，范围为 -90~90，负数表示南纬                         |
| longitude | `number`   |        | 是   | 经度，范围为 -180~180，负数表示西经                       |
| complete  | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）          |
| success   | `function` |        | 否   | 接口调用成功的回调函数                                    |
| fail      | `function` |        | 否   | 接口调用失败的回调函数                                    |

**object.success回调参数**

**参数**

**Object res**

| 属性        | 类型     | 说明                                |
| ----------- | -------- | ----------------------------------- |
| latitude    | `number` | 纬度，范围为 -90~90，负数表示南纬   |
| longitude   | `number` | 经度，范围为 -180~180，负数表示西经 |
| cityName    | `string` | 城市名称street                      |
| streetName  | `string` | 街道名称                            |
| address     | `string` | 位置名称                            |
| countryCode | `string` | 国家码                              |
| postalCode  | `string` | 邮编                                |
| countryName | `string` | 国家名                              |
| province    | `string` | 省名                                |
| district    | `string` | 区名, 次级区域名                    |

**object.fail回调参数**

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
 * 根据经纬度获取地址
 */
export function transformLocation(params: {
  /** wgs84 返回 gps 坐标，gcj02 返回可用于 openLocation 的坐标 */
  type: string
  /** 纬度，范围为 -90~90，负数表示南纬 */
  latitude: number
  /** 经度，范围为 -180~180，负数表示西经 */
  longitude: number
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
  /** 接口调用成功的回调函数 */
  success?: (params: {
    /** 纬度，范围为 -90~90，负数表示南纬 */
    latitude: number
    /** 经度，范围为 -180~180，负数表示西经 */
    longitude: number
    /** 城市名称street */
    cityName: string
    /** 街道名称 */
    streetName: string
    /** 位置名称 */
    address: string
    /** 国家码 */
    countryCode: string
    /** 邮编 */
    postalCode: string
    /** 国家名 */
    countryName: string
    /** 省名 */
    province: string
    /** 区名, 次级区域名 */
    district: string
  }) => void
  /** 接口调用失败的回调函数 */
  fail?: (params: {
    errorMsg: string
    errorCode: string | number
    innerError: {
      errorCode: string | number
      errorMsg: string
    }
  }) => void
}): void


```
