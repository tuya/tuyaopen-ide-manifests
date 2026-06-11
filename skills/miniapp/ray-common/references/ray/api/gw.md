# 网关 (gw)

### openDeviceGWSubHelpList

网关面板配网子设备，打开配网子设备帮助列表

#### 引入

```js
import { openDeviceGWSubHelpList } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.58`版本才可使用。IDE模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| gwId     | `string`   |        | 否   | 网关Id                                           |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 请求示例

```ts
openDeviceGWSubHelpList({
    gwId: 'xxx'
}).then(() => {
  console.log('打开配网子设备帮助列表');
});
```
### openDeviceGWSubSearchConfigure

网关面板配网子设备，打开搜索配网页面

#### 引入

```js
import { openDeviceGWSubSearchConfigure } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.58`版本才可使用。IDE模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| gwId     | `string`   |        | 否   | 网关Id                                           |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 请求示例

```ts
openDeviceGWSubSearchConfigure({
    gwId: 'xxx'
}).then(() => {
  console.log('打开搜索配网页面');
});
```
### 下发更新LQI指令

`sendCmdForRefreshDeviceLQI`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { sendCmdForRefreshDeviceLQI } = gateway;
```

**参数**

**SendCmdForRefreshDeviceLQIParams**

下发更新LQI指令的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明    |
| ----- | -------- | ------ | ---- | ------- |
| devId | `string` |        | 是   | 子设备Id |

**返回**

**SendCmdForRefreshDeviceLQIResponse**

下发更新LQI指令的响应值。

| 属性   | 类型      | 说明         |
| ------ | --------- | ------------ |
| result | `boolean` | 是否下发成功 |

**函数定义示例**

```typescript
/**
 * 下发更新LQI指令
 * @param {SendCmdForRefreshDeviceLQIParams} params - 下发更新LQI指令请求参数
 * @returns {Promise<SendCmdForRefreshDeviceLQIResponse>} - 下发更新LQI指令结果的 Promise 对象
 */
export const sendCmdForRefreshDeviceLQI: (
  params: SendCmdForRefreshDeviceLQIParams
) => Promise<SendCmdForRefreshDeviceLQIResponse>;
```

### 获取设备最新LQI

`getLastDeviceLQI`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { getLastDeviceLQI } = gateway;
```

**参数**

**GetLastDeviceLQIParams**

获取设备最新LQI的请求参数。

| 属性       | 类型     | 默认值 | 必填 | 说明                   |
| ---------- | -------- | ------ | ---- | ---------------------- |
| devId      | `string` |        | 是   | 子设备Id               |
| offsetTime | `number` |        | 是   | 时间偏移量，单位为毫秒 |

**返回**

**GetLastDeviceLQIResponse**

获取设备最新LQI的响应值。

| 属性       | 类型      | 说明           |
| ---------- | --------- | -------------- |
| deviceId   | `string`  | 设备id         |
| deviceName | `string`  | 设备名称       |
| isGateway  | `boolean` | 是否是网关     |
| lqi        | `number`  | 子设备lqi值    |

**函数定义示例**

```typescript
/**
 * 获取设备最新LQI
 * @param {GetLastDeviceLQIParams} params - 获取设备最新LQI请求参数
 * @returns {Promise<GetLastDeviceLQIResponse[]>} - 获取设备最新LQI结果的 Promise 对象
 */
export const getLastDeviceLQI: (
  params: GetLastDeviceLQIParams
) => Promise<GetLastDeviceLQIResponse[]>;
```

### 查询设备高级能力

`getSeniorAbility`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { getSeniorAbility } = gateway;
```

**参数**

**GetSeniorAbilityParams**

查询设备高级能力的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明    |
| ----- | -------- | ------ | ---- | ------- |
| devId | `string` |        | 是   | 设备Id |

**返回**

**GetSeniorAbilityResponse**

查询设备高级能力的响应值。

| 属性 | 类型     | 说明           |
| ---- | -------- | -------------- |
| [key: string] | `string` | 设备高级能力键值对 |

**函数定义示例**

```typescript
/**
 * 查询设备高级能力
 * @param {GetSeniorAbilityParams} params - 查询设备高级能力请求参数
 * @returns {Promise<GetSeniorAbilityResponse>} - 查询设备高级能力结果的 Promise 对象
 */
export const getSeniorAbility: (
  params: GetSeniorAbilityParams
) => Promise<GetSeniorAbilityResponse>;
```

### 获取网关子设备数量限制

`getGatewaySubDevLimit`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { getGatewaySubDevLimit } = gateway;
```

**参数**

**GetGatewaySubDevLimitParams**

获取网关子设备数量限制的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明    |
| ----- | -------- | ------ | ---- | ------- |
| devId | `string` |        | 是   | 设备Id |

**返回**

**GetGatewaySubDevLimitResponse**

获取网关子设备数量限制的响应值。

| 属性 | 类型     | 说明           |
| ---- | -------- | -------------- |
| max  | `number` | 子设备数量上限 |
| blu  | `number` | 蓝牙子设备数量上限 |
| zig  | `number` | zigbee子设备数量上限 |
| ver  | `number` | 版本，嵌入式端上报 |

**函数定义示例**

```typescript
/**
 * 获取网关子设备数量限制
 * @param {GetGatewaySubDevLimitParams} params - 获取网关子设备数量限制请求参数
 * @returns {Promise<GetGatewaySubDevLimitResponse>} - 获取网关子设备数量限制结果的 Promise 对象
 */
export const getGatewaySubDevLimit: (
  params: GetGatewaySubDevLimitParams
) => Promise<GetGatewaySubDevLimitResponse>;
```

### mesh类设备拖拽

`updateRelationMesh`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { updateRelationMesh } = gateway;
```

**参数**

**UpdateRelationMeshParams**

mesh类设备拖拽的请求参数。

| 属性         | 类型       | 默认值 | 必填 | 说明                   |
| ------------ | ---------- | ------ | ---- | ---------------------- |
| nodeIds      | `string[]` |        | 是   | 需要拖拽的子设备id列表 |
| sourceMeshId | `string`   |        | 否   | 原meshId或者网关Id     |
| targetMeshId | `string`   |        | 否   | 目标meshId或者网关Id   |

**返回**

**UpdateRelationMeshResponse**

mesh类设备拖拽的响应值。

| 属性           | 类型       | 说明                 |
| -------------- | ---------- | -------------------- |
| repeatNodeIds  | `string[]` | 已在网关下的设备列表 |

**函数定义示例**

```typescript
/**
 * mesh类设备拖拽
 * @param {UpdateRelationMeshParams} params - mesh类设备拖拽请求参数
 * @returns {Promise<UpdateRelationMeshResponse>} - mesh类设备拖拽结果的 Promise 对象
 */
export const updateRelationMesh: (
  params: UpdateRelationMeshParams
) => Promise<UpdateRelationMeshResponse>;
```

### 蓝牙单点类设备拖拽

`updateRelationBlue`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { updateRelationBlue } = gateway;
```

**参数**

**UpdateRelationBlueParams**

蓝牙单点类设备拖拽的请求参数。

| 属性         | 类型                              | 默认值 | 必填 | 说明                   |
| ------------ | --------------------------------- | ------ | ---- | ---------------------- |
| nodes        | `{ devId: string; uuid: string }[]` |        | 是   | 需要拖拽的子设备id与uuid列表 |
| sourceMeshId | `string`                          |        | 否   | 原网关Id               |
| targetMeshId | `string`                          |        | 否   | 目标网关Id             |

**返回**

**UpdateRelationBlueResponse**

蓝牙单点类设备拖拽的响应值。

| 属性           | 类型       | 说明                 |
| -------------- | ---------- | -------------------- |
| repeatNodeIds  | `string[]` | 已在网关下的设备列表 |

**函数定义示例**

```typescript
/**
 * 蓝牙单点类设备拖拽
 * @param {UpdateRelationBlueParams} params - 蓝牙单点类设备拖拽请求参数
 * @returns {Promise<UpdateRelationBlueResponse>} - 蓝牙单点类设备拖拽结果的 Promise 对象
 */
export const updateRelationBlue: (
  params: UpdateRelationBlueParams
) => Promise<UpdateRelationBlueResponse>;
```

### beacon类设备拖拽

`updateRelationBeacon`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { updateRelationBeacon } = gateway;
```

**参数**

**UpdateRelationBeaconParams**

beacon类设备拖拽的请求参数。

| 属性         | 类型                              | 默认值 | 必填 | 说明                   |
| ------------ | --------------------------------- | ------ | ---- | ---------------------- |
| nodes        | `{ devId: string; mac: string }[]` |        | 是   | 需要拖拽的子设备id与mac列表 |
| sourceMeshId | `string`                          |        | 否   | 原网关Id               |
| targetMeshId | `string`                          |        | 否   | 目标网关Id             |

**返回**

**UpdateRelationBeaconResponse**

beacon类设备拖拽的响应值。

| 属性           | 类型       | 说明                 |
| -------------- | ---------- | -------------------- |
| repeatNodeIds  | `string[]` | 已在网关下的设备列表 |

**函数定义示例**

```typescript
/**
 * beacon类设备拖拽
 * @param {UpdateRelationBeaconParams} params - beacon类设备拖拽请求参数
 * @returns {Promise<UpdateRelationBeaconResponse>} - beacon类设备拖拽结果的 Promise 对象
 */
export const updateRelationBeacon: (
  params: UpdateRelationBeaconParams
) => Promise<UpdateRelationBeaconResponse>;
```

### 获取网关的能力

`getGatewayAbility`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { getGatewayAbility } = gateway;
```

**参数**

**GetGatewayAbilityParams**

获取网关的能力的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明                       |
| ----- | -------- | ------ | ---- | -------------------------- |
| devIds | `string` |        | 是   | 设备id拼成的字符串，以逗号分隔 |

**返回**

**GetGatewayAbilityResponse**

获取网关的能力的响应值。

| 属性        | 类型     | 说明           |
| ----------- | -------- | -------------- |
| capability  | `number` | 能力值         |
| devId       | `string` | 设备id         |
| lqi         | `number` | 设备信号质量   |
| performance | `number` | 网关性能指标   |
| subMaximum  | `object` | 子设备数量上限 |

**subMaximum对象**

| 属性    | 类型     | 说明                 |
| ------- | -------- | -------------------- |
| data    | `object` | 各类型子设备数量上限 |
| version | `number` | 版本                 |

**函数定义示例**

```typescript
/**
 * 获取网关的能力
 * @param {GetGatewayAbilityParams} params - 获取网关的能力请求参数
 * @returns {Promise<GetGatewayAbilityResponse[]>} - 获取网关的能力结果的 Promise 对象
 */
export const getGatewayAbility: (
  params: GetGatewayAbilityParams
) => Promise<GetGatewayAbilityResponse[]>;
```

### 获取设备日志

`getSecurityDeviceLog`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { gateway } from '@ray-js/ray';
const { getSecurityDeviceLog } = gateway;
```

**参数**

**GetSecurityDeviceLogParams**

获取设备日志的请求参数。

| 属性     | 类型     | 默认值 | 必填 | 说明     |
| -------- | -------- | ------ | ---- | -------- |
| queryStr | `string` |        | 是   | 查询字符串 |

**queryStr参数说明**

| 属性           | 类型       | 说明                                       |
| -------------- | ---------- | ------------------------------------------ |
| deviceId       | `string`   | 设备id                                     |
| dpId           | `string`   | dp点id，传空查所有                         |
| eventType      | `string[]` | 事件类型，传空查所有                       |
| queryType      | `number`   | 传0，后端会根据设备判断走收费逻辑还是免费逻辑 |
| startTime      | `number`   | 开始时间                                   |
| lastRowKey     | `string`   | 分页时上一页的最后一个 rowkey              |
| lastEventTime  | `number`   | 分页时上一页的最后一条数据的time           |
| size           | `number`   | 每页大小                                   |

**返回**

**GetSecurityDeviceLogResponse**

获取设备日志的响应值。

| 属性                  | 类型     | 说明           |
| --------------------- | -------- | -------------- |
| devId                 | `string` | 设备id         |
| datas                 | `object[]` | 日志数据列表   |
| hasNext               | `boolean` | 是否还有下一页 |
| totalCount            | `number` | 总数           |
| currentPageStartRowKey | `string` | 当前页起始key  |

**datas对象**

| 属性       | 类型     | 说明         |
| ---------- | -------- | ------------ |
| rowkey     | `string` | key          |
| dpName     | `string` | dp名称       |
| createTime | `number` | 创建时间     |
| eventTime  | `number` | 上报时间     |
| dpId       | `string` | dpId         |
| eventType  | `string` | 事件类型     |
| value      | `string` | dp值         |
| deviceId   | `string` | 设备id       |

**函数定义示例**

```typescript
/**
 * 获取设备日志
 * @param {GetSecurityDeviceLogParams} params - 获取设备日志请求参数
 * @returns {Promise<GetSecurityDeviceLogResponse>} - 获取设备日志结果的 Promise 对象
 */
export const getSecurityDeviceLog: (
  params: GetSecurityDeviceLogParams
) => Promise<GetSecurityDeviceLogResponse>;
```

---
