# 场景 (scenes)


## 规则

#### bindRule

**接口描述**

将按键条件与场景规则关联。

**请求参数**

| 参数                | 数据类型 | 说明                       | 是否必填 |
| ------------------- | -------- | -------------------------- | -------- |
| associativeEntityId | String   | 与面板/设备建立绑定关系,通常为设备ID、DP点、群组、规则，dpId#value等 | 是       |
| ruleId              | String   | 关联场景 ID                | 是       |
| entitySubIds        | String   | 关联 DP 点                 | 是       |
| expr                | Array    | 关联 DP 点、动作组合       | 是       |
| bizDomain           | String   | 业务域                     | 是       |
| gid        | String   | 家庭 ID  | 是 `引入HomeKit并使用getCurrentHomeInfo获取homeId传入` |

**返回参数**

| 参数                   | 数据类型 | 说明                       |
| ---------------------- | -------- | -------------------------- |
| associativeEntityId    | String   | 与面板/设备建立绑定关系,通常为设备ID、DP点、群组、规则，dpId#value等 |
| associativeEntityValue | String   | 当associativeEntityId不足以区分情况下使用，通常可关联设备、DP值、群组、规则等                    |
| bizDomain              | String   | 业务域                     |
| id                     | Number   | 数据 ID                    |
| ownerId                | String   | 家庭 ID                    |
| sourceEntityId         | String   | 设备 ID                    |
| triggerRuleId          | String   | 规则 ID                    |
| triggerRuleVO          | Object   | 执行动作设备信息           |

**请求示例**

```js
import { bindRule } from '@ray-js/ray';

bindRule({
  associativeEntityId: '1#single_click',
  ruleId: 'xxxxx',
  entitySubIds: '1',
  expr: [['$dp1', '==', '单击']],
  bizDomain: 'wirelessSwitchBindScene',
  gid: '123456'
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
{
  "associativeEntityId": "1#double_click",
  "associativeEntityValue": "huqzuD0Bb8wz1wxM",
  "bizDomain": "wirelessSwitchBindScene",
  "id": 295022,
  "ownerId": "11740421",
  "sourceEntityId": "vdevo161469104176416",
  "triggerRuleId": "53BlwWMpfUJMFHYu",
  "triggerRuleVO": {}
}
```
#### unbindRule

> `@ray-js/ray^1.5.15` 版本新增

**接口描述**

解绑联动。

**请求参数**

| 参数     | 数据类型 | 说明     | 是否必填 |
| -------- | -------- | -------- | -------- |
| `bindId` | `string` | 解绑 ID  | 是       |
| `gid`    | `string` | 家庭 ID  | 是       |

**返回参数**

| 参数     | 数据类型 | 说明           |
| -------- | -------- | -------------- |
| `result` | `boolean` | 解绑是否成功   |

**请求示例**

```ts
import { unbindRule } from '@ray-js/ray';

unbindRule({
  bindId: 'some bindId',
  gid: 'some gid',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
true
```
#### removeRule

**接口描述**

移除相关按键条件下的场景规则。

**请求参数**

| 参数                   | 数据类型 | 说明         | 是否必填 |
| ---------------------- | -------- | ------------ | -------- |
| bizDomain              | String   | 业务域       | 是       |
| devId         | String   | 设备 ID      | 是       |
| associativeEntityId    | String   | 与面板/设备建立绑定关系,通常为设备ID、DP点、群组、规则，dpId#value等 | 是       |
| associativeEntityValue | String   | 当associativeEntityId不足以区分情况下使用，通常可关联设备、DP值、群组、规则等     | 是       |
| gid        | String   | 家庭 ID  | 是 `引入HomeKit并使用getCurrentHomeInfo获取homeId传入` |

**返回参数**

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| result | Boolean  | 删除是否成功 |

**请求示例**

```js
import { removeRule } from '@ray-js/ray';

removeRule({
  bizDomain: 'wirelessSwitchBindScene',
  devId: 'vdevo161473760344855',
  associativeEntityId: '1#scene_1',
  associativeEntityValue: 'y2zAjojrpeZx9Dtu',
  gid: '123456'
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
true
```
#### enableRule

**接口描述**

开启已绑定规则。

**请求参数**

| 参数   | 数据类型 | 说明    | 是否必填 |
| ------ | -------- | ------- | -------- |
| ruleId | String   | 规则 ID | 是       |

**返回参数**

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| result | Boolean  | 删除是否成功 |

**请求示例**

```javascript
import { enableRule } from '@ray-js/ray';

enableRule({
  ruleId: 'y2zAjojrpeZx9Dtu',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```js
true;
```
#### disableRule

**接口描述**

关闭已绑定规则。

**请求参数**

| 参数   | 数据类型 | 说明    | 是否必填 |
| ------ | -------- | ------- | -------- |
| ruleId | String   | 规则 ID | 是       |

**返回参数**

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| result | Boolean  | 删除是否成功 |

**请求示例**

```javascript
import { disableRule } from '@ray-js/ray';

disableRule({
  ruleId: 'y2zAjojrpeZx9Dtu',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```js
true;
```
#### triggerRule

**接口描述**

一键触发场景联动，由云端执行。

**请求参数**

| 参数   | 数据类型 | 说明    | 是否必填 |
| ------ | -------- | ------- | -------- |
| ruleId | String   | 规则 ID | 是       |

**返回参数**

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| result | Boolean  | 执行是否成功 |

**请求示例**

```js
import { triggerRule } from '@ray-js/ray';

triggerRule({
  ruleId: 'y2zAjojrpeZx9Dtu',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```js
true;
```

## 查询

#### getBindRuleList

**接口描述**

查询设备条件已绑定的场景。

**请求参数**

| 参数       | 数据类型 | 说明     | 是否必填                                               |
| ---------- | -------- | -------- | ------------------------------------------------------ |
| bizDomain  | String   | 业务域   | 是                                                     |
| devId      | String   | 设备 ID  | 是 `@ray-js/ray^1.4.61` 开始支持                       |
| entityType | Number   | 实体类型 | 是  `1` 为关联实体为设备 ，`2` 为关联实体为联动规则                                                 |
| gid        | String   | 家庭 ID  | 是 `引入HomeKit并使用getCurrentHomeInfo获取homeId传入` |

**返回参数**

| 参数 | 数据类型 | 说明     |
| ---- | -------- | -------- |
| data | Array    | 规则列表 |

**请求示例**

```js
import { getBindRuleList, home } from '@ray-js/ray';
// Need HomeKit
const { homeId } = await home.getCurrentHomeInfo()

getBindRuleList({
  devId: 'vdevo161469104176416',
  bizDomain: 'wirelessSwitchBindScene',
  entityType: 2,
  gid: homeId
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
[
  {
    "associativeEntityId": "1#double_click",
    "associativeEntityValueList": [
      {
        "actions": [
          {
            "actionDisplay": "开关 : 开启",
            "actionDisplayNew": {
              "83": [
                "开关",
                "开启"
              ]
            },
            "actionExecutor": "dpIssue",
            "actionStrategy": "edge",
            "attribute": 0,
            "defaultIconUrl": "some icon url",
            "devDelMark": false,
            "enabled": true,
            "entityId": "some deviceId",
            "entityName": "调试产品-幻彩3路-vdevo",
            "executorProperty": {
              "83": true
            },
            "extraProperty": {},
            "gmtModified": 1718024675855,
            "id": "some id",
            "offGwSync": false,
            "orderNum": 1,
            "ruleId": "some ruleId",
            "status": true,
            "uid": "some uid"
          }
        ],
        "arrowIconUrl": "some arrow icon url",
        "attribute": 68,
        "auditStatus": 0,
        "background": "",
        "bindId": 4069307,
        "boundForPanel": false,
        "boundForWiFiPanel": true,
        "code": "",
        "commonField": "{\"subMatchType\":1,\"panelType\":1}",
        "containDeviceDelete": false,
        "coverIcon": "some cover icon url",
        "description": "",
        "disableTime": 0,
        "displayColor": "BA7B69",
        "enabled": true,
        "forceCloudTrigger": false,
        "gmtCreate": 1705027381008,
        "gmtModified": 1718024675861,
        "id": "some ruleId",
        "iotAutoAlarm": false,
        "isAlarmIssue": false,
        "isLogicRule": false,
        "linkageType": 0,
        "localLinkage": false,
        "matchType": 1,
        "name": "打开三路开关",
        "needCleanGidSid": false,
        "needValidOutOfWork": false,
        "newLocalScene": false,
        "offGwSync": false,
        "offGwSyncSuccess": false,
        "orderWeight": 1,
        "outOfWork": 0,
        "ownerId": "some owner id",
        "panelType": 1,
        "permissionCode": "",
        "ruleGenre": 1,
        "ruleSource": 0,
        "ruleType": 3,
        "runtimeEnv": "prod",
        "scenarioRule": true,
        "status": true,
        "statusConditions": [],
        "stickyOnTop": true,
        "subMatchType": 1,
        "triggerRuleEnable": true,
        "triggerRuleId": "some trigger rule id",
        "uid": "some uid"
      }
    ],
    "bindId": 4069307,
    "bizDomain": "wirelessSwitchBindScene",
    "enable": true,
    "sourceEntityId": "some device id"
  }
]
```
#### getLinkageDeviceList

**接口描述**

查询家庭下支持联动的所有设备。

**请求参数**

| 参数       | 数据类型 | 说明     | 是否必填 |
| ---------- | -------- | -------- | -------- |
| gid        | String   | 家庭 ID  | 是  `引入HomeKit并使用getCurrentHomeInfo获取homeId传入`     |
| sourceType | String   | 请求类型 | 是       |

**返回参数**

| 参数 | 数据类型 | 说明     |
| ---- | -------- | -------- |
| data | Array    | 设备列表 |

**请求示例**

```js
import { getLinkageDeviceList, home } from '@ray-js/ray';
// Need HomeKit
const { homeId } = await home.getCurrentHomeInfo()

getLinkageDeviceList({
  gid: homeId,
  sourceType: 'wirelessSwitch',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
[
  {
    "category": "wxkg",
    "datapoints": [],
    "devId": "vdevo161473760344855",
    "iconUrl": "xxxx",
    "name": "无线开关",
    "productId": "xxxx"
  }
]
```
#### getSceneList

**接口描述**

查询设备支持的一键执行场景。

**请求参数**

| 参数  | 数据类型 | 说明    | 是否必填 |
| ----- | -------- | ------- | -------- |
| devId | String   | 设备 ID | 是   `@ray-js/ray^1.4.61` 开始支持        |
| gid   | String   | 家庭 ID | 是    `引入HomeKit并使用getCurrentHomeInfo获取homeId传入`   |

**返回参数**

| 参数 | 数据类型 | 说明     |
| ---- | -------- | -------- |
| data | Array    | 场景列表 |

**请求示例**

```js
import { getSceneList, Home } from '@ray-js/ray';
// Need HomeKit
const { homeId } = await home.getCurrentHomeInfo()

getSceneList({
  devId: 'vdevo161469104176416',
  gid: homeId
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```json
[
  {
    "actions": [],
    "attribute": 4,
    "auditStatus": 0,
    "background": "",
    "boundForPanel": false,
    "boundForWiFiPanel": false,
    "code": "",
    "commonField": "",
    "coverIcon": "xxx",
    "disableTime": 0,
    "displayColor": "23AFA9",
    "enabled": true,
    "devId": "vdevo161473760344855",
    "name": "222",
    "id": "tgnVdPuWVoAZ1W89"
  }
]
```
#### getSceneListV2

> `@ray-js/ray^1.5.15` 版本新增

**接口描述**

查询家庭下一键执行列表，会去掉失效或自动化规则。

**请求参数**

| 参数                        | 数据类型  | 说明                             | 是否必填 |
| --------------------------- | --------- | -------------------------------- | -------- |
| `devId`                     | `string`  | 设备 ID                          | 是       |
| `gid`                       | `string`  | 家庭 ID                          | 是       |
| `containStandardZigBee` | `boolean` | 是否包含标准场景，默认为 `false` | 否       |

**返回参数**

| 参数                         | 数据类型  | 说明           |
| ---------------------------- | --------- | -------------- |
| `response`                   | `Array`   | 一键执行列表   |
| `response.actions`           | `Array<ISceneAction>`   | 执行动作       |
| `response.background`        | `string`  | 背景图地址     |
| `response.boundForPanel`     | `boolean` | 面板绑定       |
| `response.boundForWiFiPanel` | `boolean` | WiFi 面板绑定  |
| `response.coverIcon`         | `string`  | 图标           |
| `response.displayColor`      | `string`  | 背景颜色       |
| `response.enabled`           | `boolean` | 规则是否启用   |
| `response.id`                | `string`  | 执行规则 ID    |
| `response.name`              | `string`  | 联动名称或备注 |

**ISceneAction**

| 属性                  | 类型     | 描述                               |
| --------------------- | -------- | ---------------------------------- |
| `actionDisplay`       | `string` | 执行动作的显示名称                 |
| `actionExecutor`      | `string` | 执行动作的执行者                   |
| `actionStrategy`      | `string` | 执行动作的策略                     |
| `entityId`            | `string` | 实体ID，表示动作所属的实体的ID     |
| `gmtModified`         | `number` | 修改时间戳                         |
| `id`                  | `string` | 动作的唯一ID                       |
| `orderNum`            | `number` | 动作的顺序号                       |
| `ruleId`              | `string` | 规则ID，表示动作所属的规则的ID     |
| `status`              | `boolean` | 动作状态                           |

**请求示例**

```js
import { getSceneListV2 } from '@ray-js/ray';
// Need HomeKit
const { homeId } = await home.getCurrentHomeInfo()

getSceneListV2({
  devId: 'vdevo161469104176416',
  gid: homeId,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

```json
[
  {
    "actions": [
      {
        "actionDisplay": "开关 : 开启",
        "actionDisplayNew": {
          "83": [
            "开关",
            "开启"
          ]
        },
        "actionExecutor": "dpIssue",
        "actionStrategy": "edge",
        "attribute": 0,
        "devDelMark": false,
        "enabled": true,
        "entityId": "some deviceId",
        "entityName": "调试产品-幻彩3路-vdevo",
        "executorProperty": {
          "83": true
        },
        "extraProperty": {},
        "gmtModified": 1718024675855,
        "id": "some id",
        "offGwSync": false,
        "orderNum": 1,
        "ruleId": "some ruleId",
        "status": true,
        "uid": "some uid"
      }
    ],
    "alarmIssue": false,
    "attribute": 4,
    "auditStatus": 0,
    "background": "",
    "boundForPanel": false,
    "boundForWiFiPanel": false,
    "code": "",
    "commonField": "{\"subMatchType\":1}",
    "containDeviceDelete": false,
    "coverIcon": "some cover icon",
    "description": "",
    "disableTime": 0,
    "displayColor": "BA7B69",
    "enabled": true,
    "forceCloudTrigger": false,
    "gmtCreate": 1705027381008,
    "gmtModified": 1718024675861,
    "id": "some id",
    "iotAutoAlarm": false,
    "isAlarmIssue": false,
    "isLogicRule": false,
    "linkageType": 0,
    "localLinkage": false,
    "logicRule": false,
    "matchType": 1,
    "name": "打开三路开关",
    "needCleanGidSid": false,
    "needValidOutOfWork": false,
    "newLocalScene": false,
    "offGwSync": false,
    "offGwSyncSuccess": false,
    "orderWeight": 1,
    "outOfWork": 0,
    "ownerId": "some owner id",
    "panelType": 0,
    "permissionCode": "",
    "ruleGenre": 1,
    "ruleSource": 0,
    "ruleType": 3,
    "runtimeEnv": "prod",
    "scenarioRule": true,
    "status": true,
    "statusConditions": [],
    "stickyOnTop": true,
    "subMatchType": 1,
    "uid": "some uid"
  }
]
```

## 一键执行和自动化

#### getSceneListByHomeID

> [VERSION] @tuya-miniapp/cloud-api >= 1.1.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置-云能力 进行授权配置。
> 注意：返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

##### 描述

获取家庭下一键执行和自动化场景列表

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭ID |

##### 返回值

类型: `Promise<Scene[]>`

GetSceneListByHomeIDResult（字段含义见类型定义与 minituya 返回参数）

###### 引用对象

###### `interface` Action

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actionExecutor` | `string` | 是 | 执行动作的执行者 |
| `actionStrategy` | `string` | 是 | 执行动作的策略 |
| `attribute` | `number` | 是 | 属性值 |
| `defaultIconUrl` | `string` | 是 | 默认图标 URL |
| `devDelMark` | `boolean` | 是 | 如果当前是设备类型条件，该字段表达关联设备是否被移除 |
| `enabled` | `boolean` | 是 | 动作是否启用 |
| `entityId` | `string` | 是 | 实体ID，表示动作所属的实体的ID |
| `executorProperty` | `Record<string, string \| number \| false \| true>` | 是 | 动作执行信息 |
| `executorPropertyKeyOrder` | `string[]` | 是 | `executorProperty` 内键的展示/下发顺序 |
| `extraProperty` | `Record<string, unknown>` | 是 | 额外信息 |
| `gmtModified` | `number` | 是 | 修改时间戳 |
| `id` | `string` | 是 | 动作的唯一ID |
| `offGwSync` | `boolean` | 是 | 网关同步标记，表示是否网关同步 |
| `orderNum` | `number` | 是 | 动作的顺序号 |
| `ruleId` | `string` | 是 | 规则ID，表示动作所属的规则的ID |
| `status` | `boolean` | 是 | 动作状态 |
| `uid` | `string` | 是 | 用户ID，表示动作所属的用户的ID |

###### `interface` Condition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attribute` | `number` | 是 | 属性值 |
| `condType` | `number` | 是 | 条件类型 |
| `defaultIconUrl` | `string` | 是 | 默认图标 URL |
| `devDelMark` | `boolean` | 是 | 如果当前是设备类型条件，该字段表达关联设备是否被移除 |
| `enabled` | `boolean` | 是 | 条件是否启用 |
| `entityId` | `string` | 是 | 实体ID，表示条件所属的实体的ID |
| `entitySubIds` | `string` | 是 | 条件关联的子实体 ID 列表（如多 DP 组合） |
| `entityType` | `number` | 是 | 条件类型 |
| `expr` | `string \| number[][]` | 是 | 条件表达式 |
| `extraInfo` | `Record<string, unknown>` | 是 | 额外信息 |
| `handleStrategy` | `string` | 是 | 条件命中后的处理策略标识 |
| `iconUrl` | `string` | 是 | 图标URL |
| `id` | `string` | 是 | 条件ID，表示条件所属的条件的ID |
| `orderNum` | `number` | 是 | 条件在规则内的排序号 |
| `ruleId` | `string` | 是 | 联动ID，表示条件所属的联动的ID |
| `serviceProvider` | `string` | 是 | 服务提供商标识 |
| `support` | `number` | 是 | 能力/服务支持位标记（与云端约定） |

##### 示例代码

###### 请求示例

```typescript
import { getSceneListByHomeID } from '@tuya-miniapp/cloud-api';

getSceneListByHomeID({
  gid: '123456789',
})
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error('Failed to get scene list:', error);
  });
```

###### 返回示例

```javascript
[
  {
    id: 'scene_001',
    name: '回家模式',
    coverIcon: 'https://example.com/icon.png',
    description: '回家时自动开启灯光',
    displayColor: '6559D1',
    enabled: true,
    matchType: 1,
    ruleGenre: 2,
    ruleType: 3,
    runtimeEnv: 'prod',
    scenarioRule: true,
    actions: [
      {
        id: 'action_001',
        actionExecutor: 'dpIssue',
        actionStrategy: 'edge',
        attribute: 3,
        defaultIconUrl: 'https://example.com/icon.png',
        deleteDevIcon: 'https://example.com/icon.png',
        devDelMark: true,
        enabled: true,
        entityId: 'device_001',
        executorProperty: {
          '28': 18,
        },
        executorPropertyKeyOrder: ['28'],
        extraProperty: {
          dpScale: 0,
          path: '/pages/device/detail/index',
        },
        gmtModified: 1699200000000,
        offGwSync: false,
        orderNum: 1,
        ruleId: 'scene_001',
        status: false,
        uid: 'user_001',
      },
    ],
    conditions: [
      {
        id: 'condition_001',
        attribute: 3,
        condType: 1,
        defaultIconUrl: 'https://example.com/icon.png',
        deleteDevIcon: 'https://example.com/icon.png',
        devDelMark: true,
        enabled: true,
        entityId: 'device_002',
        entitySubIds: '1',
        entityType: 1,
        expr: [['$dp1', '==', 'disarmed']],
        extraInfo: {},
        handleStrategy: '',
        iconUrl: 'https://example.com/icon.png',
        orderNum: 1,
        ruleId: 'scene_001',
        serviceProvider: '',
        support: 0,
      },
    ],
    arrowIconUrl: 'https://example.com/arrow.png',
    attribute: 4,
    auditStatus: 0,
    background: '',
    boundForPanel: false,
    boundForWiFiPanel: false,
    categorys: ['home', 'light'],
    code: '',
    commonField: '{"subMatchType":1}',
    containDeviceDelete: false,
    deviceIds: ['device_001', 'device_002'],
    disableTime: 0,
    forceCloudTrigger: false,
    gmtCreate: 1699200000000,
    gmtModified: 1699200000000,
    iotAutoAlarm: false,
    isAlarmIssue: false,
    isLogicRule: false,
    linkageType: 0,
    localLinkage: false,
    needCleanGidSid: false,
    needValidOutOfWork: false,
    newLocalScene: false,
    offGwSync: false,
    offGwSyncSuccess: false,
    orderWeight: 1,
    outOfWork: 0,
    ownerId: '123456789',
    panelType: 0,
    permissionCode: '',
    ruleSource: 0,
    status: true,
    statusConditions: [],
    stickyOnTop: true,
    subMatchType: 1,
    uid: 'user_001',
  },
];
```
#### getSceneAndAuto

> [VERSION] @tuya-miniapp/cloud-api >= 1.1.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置-云能力 进行授权配置。

##### 描述

面板获取设备所有场景和自动化

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devOrGroupId` | `string` | 是 | 设备 ID 或群组 ID，用于查询与该设备或群组相关的所有场景和自动化 |

##### 返回值

类型: `Promise<SceneAndAuto>`

SceneAndAuto（autos 为自动化列表，scenes 为一键执行列表；字段含义见类型定义与 minituya 返回参数）

###### SceneAndAuto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `autos` | `SceneOrAuto[]` | 是 | 自动化列表 |
| `scenes` | `SceneOrAuto[]` | 是 | 一键执行列表 |

###### 引用对象

###### `interface` SceneOrAuto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `background` | `string` | 否 | 场景背景 |
| `displayColor` | `string` | 是 | 场景展示颜色 |
| `displayIcon` | `string` | 是 | 场景展示图标 |
| `enabled` | `boolean` | 是 | 场景是否启用 |
| `id` | `string` | 是 | 场景 ID |
| `name` | `string` | 是 | 场景名称 |
| `sceneIcons` | `Object[]` | 否 | 场景图标列表 只有 Auto 自动化存在该字段，Scene 一键执行不存在 |

###### `type` SceneOrAuto.sceneIcons

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `defaultIconName` | `string` | 是 | 默认图标资源名 |
| `isRemoved` | `boolean` | 是 | 是否已移除 |
| `removeIconName` | `string` | 是 | 移除态图标资源名 |
| `type` | `"action" \| "arrow" \| "condition"` | 是 | 图标语义：动作 / 箭头 / 条件 |
| `url` | `string` | 是 | 图标 URL |

##### 示例代码

###### 请求示例

```typescript
import { getSceneAndAuto } from '@tuya-miniapp/cloud-api';

getSceneAndAuto('device_id_123456')
  .then(response => {
    console.log('自动化列表:', response.autos);
    console.log('一键执行列表:', response.scenes);
  })
  .catch(error => {
    console.error('Failed to get scene and auto:', error);
  });
```

###### 返回示例

```javascript
{
  "autos": [
    {
      "background": "#FF5722",
      "displayColor": "#FF5722",
      "displayIcon": "https://example.com/icon.png",
      "enabled": true,
      "id": "auto_123",
      "name": "自动开灯",
      "sceneIcons": [
        {
          "defaultIconName": "condition_icon",
          "isRemoved": false,
          "removeIconName": "",
          "type": "condition",
          "url": "https://example.com/condition_icon.png"
        },
        {
          "defaultIconName": "arrow_icon",
          "isRemoved": false,
          "removeIconName": "",
          "type": "arrow",
          "url": "https://example.com/arrow_icon.png"
        },
        {
          "defaultIconName": "action_icon",
          "isRemoved": false,
          "removeIconName": "",
          "type": "action",
          "url": "https://example.com/action_icon.png"
        }
      ]
    }
  ],
  "scenes": [
    {
      "displayColor": "#4CAF50",
      "displayIcon": "https://example.com/scene_icon.png",
      "enabled": true,
      "id": "scene_456",
      "name": "回家模式"
    }
  ]
}
```

##### 补充说明

1. **区别说明**：

   - `autos`（自动化）：包含触发条件和执行动作，满足条件时自动执行。自动化包含 `sceneIcons` 字段。
   - `scenes`（一键执行）：手动点击执行的场景，不包含触发条件。一键执行不包含 `sceneIcons` 字段。

2. **参数说明**：

   - `devOrGroupId` 参数接受设备 ID 或群组 ID，用于查询与该设备或群组相关的所有场景和自动化。
   - 该接口会自动区分自动化和一键执行场景，并分别返回在 `autos` 和 `scenes` 字段中。

3. **错误处理**：
   - 如果 `devOrGroupId` 为空或无效，接口会抛出错误："getSceneAndAuto failed: devId or groupId is null!"
   - 接口内部会捕获错误并转换为统一格式，建议使用 `.catch()` 处理错误情况。
#### saveDeviceLinkageScene

> [VERSION] @tuya-miniapp/cloud-api >= 1.1.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置-云能力 进行授权配置。
> 注意：该方法联动条件和动作仅支持设备 DP 类型，且设备需要在当前家庭下。该方法保存的场景不会显示在 app 场景 tab 中，如有需要，建议自行设计 UI。

##### 描述

保存或编辑场景(仅支持设备联动设备)

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭ID |
| `name` | `string` | 是 | 场景名称 |
| `coverIcon` | `string` | 是 | 图标 |
| `actions` | `SceneActionInput[]` | 是 | 动作列表 |
| `conditions` | `SceneCondition[]` | 否 | 条件列表，新建更新自动化时必传，新建更新一键执行时不传 |
| `enabled` | `boolean` | 是 | 是否启用 |
| `matchType` | `number` | 是 | 匹配类型 1:当满足任一条件时执行 2:当满足所有条件时执行 |
| `displayColor` | `string` | 是 | 背景色 |
| `id` | `string` | 否 | 场景ID 更新时必传，新增时不需要传 |

###### SceneActionInput

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 否 | - | 动作ID 新增时不需要传，更新时必传 |
| `devDelMark` | `boolean` | 是 | - | 关联设备是否被移除 |
| `entityId` | `string` | 是 | - | 设备ID |
| `executorProperty` | `Record<string, string \| number \| boolean>` | 是 | - | 执行属性 |
| `extraProperty` | `Record<string, unknown>` | 是 | - | 额外属性 |

###### SceneCondition

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 否 | - | 条件ID 新增时不需要传，更新时必传 |
| `entitySubIds` | `string` | 是 | - | 条件关联的dpId |
| `iconUrl` | `string` | 是 | - | 产品图标URL |
| `entityId` | `string` | 是 | - | 条件关联的设备ID |
| `expr` | `string \| number[][]` | 是 | - | 条件表达式 |
| `devDelMark` | `boolean` | 是 | - | 关联设备是否被移除 |
| `entityType` | `number` | 是 | - | 条件类型 1: 小于、等于、大于 41: 区间内、区间外 |
| `extraInfo` | `Record<string, unknown>` | 是 | - | 额外信息 |

##### 返回值

类型: `Promise<SaveDeviceLinkageSceneResult>`

SaveDeviceLinkageSceneResult（字段含义见类型定义与 minituya 返回参数）

###### SaveDeviceLinkageSceneResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 场景名称 |
| `ruleId` | `string` | 是 | 场景ID |
| `ruleGenre` | `number` | 否 | 规则类型 1:场景，2自动化 |

##### 示例代码

###### 请求示例

```typescript
import { saveDeviceLinkageScene } from '@tuya-miniapp/cloud-api';

// 新增场景
saveDeviceLinkageScene({
  gid: '123456789',
  name: '回家模式',
  coverIcon: 'https://example.com/icon.png',
  actions: [
    {
      devDelMark: false,
      entityId: 'device_001',
      executorProperty: {
        '1': true,
        '2': 50,
      },
      extraProperty: {},
    },
  ],
  conditions: [
    {
      entitySubIds: '1',
      iconUrl: 'https://example.com/icon.png',
      entityId: 'device_002',
      expr: [['1', '==', 'true']],
      devDelMark: false,
      entityType: 1,
      extraInfo: {},
    },
  ],
  enabled: true,
  matchType: 1,
  displayColor: '#FF5722',
})
  .then(response => {
    console.log('Scene saved:', response);
  })
  .catch(error => {
    console.error('Failed to save scene:', error);
  });

// 更新场景
saveDeviceLinkageScene({
  gid: '123456789',
  id: 'scene_001',
  name: '回家模式（已更新）',
  coverIcon: 'https://example.com/icon.png',
  actions: [
    {
      id: 'action_001',
      devDelMark: false,
      entityId: 'device_001',
      executorProperty: {
        '1': true,
        '2': 80,
      },
      extraProperty: {},
    },
  ],
  conditions: [],
  enabled: true,
  matchType: 1,
  displayColor: '#FF5722',
})
  .then(response => {
    console.log('Scene updated:', response);
  })
  .catch(error => {
    console.error('Failed to update scene:', error);
  });
```

###### 返回示例

```javascript
{
  name: '回家模式',
  ruleId: 'scene_001',
  ruleGenre: 1,
}
```
#### removeScene

> [VERSION] @tuya-miniapp/cloud-api >= 1.1.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置-云能力 进行授权配置。

##### 描述

删除场景

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭ID |
| `ruleId` | `string` | 是 | 场景ID |

##### 返回值

类型: `Promise<boolean>`

RemoveSceneResult（true 表示删除成功，false 表示失败；见 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { removeScene } from '@tuya-miniapp/cloud-api';

removeScene({
  gid: '123456789',
  ruleId: 'scene_001',
})
  .then(response => {
    console.log('Scene removed:', response);
  })
  .catch(error => {
    console.error('Failed to remove scene:', error);
  });
```

###### 返回示例

```javascript
true
```

## 场景功能页

#### openGuideScene

跳转场景引导页面

##### 引入

```js
import { openGuideScene } from '@ray-js/ray';
```
> @ray-js/ray 需在 `>=1.4.32`版本才可使用。IDE模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| action    | `string`   |        | 否   | 操作, `add` `edit`   （Android端在App 5.10.0及以上版本支持）                                       |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

##### 请求示例

```ts
openGuideScene().then(() => {
  console.log('调用成功打开场景引导页面');
});
```
#### openCreateScene

跳转创建场景页面
_注意：当前Android端仅支持 Zigbee 本地场景。_

##### 引入

```js
import { openCreateScene } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.32`版本才可使用。IDE模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| devId    | `string`   |        | 否   | 设备 id （Android端在App 5.10.0及以上版本支持）  |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

##### 请求示例

```ts
openCreateScene({
  devId: "devId"
}).then(() => {
  console.log('调用成功打开创建场景页面');
});
```
#### openCreateTapToRunScene

跳转创建一键执行类型的场景页面

##### 引入

```js
import { openCreateTapToRunScene } from '@ray-js/ray';
```

> 需引入 BizKit  `>=4.6.0` 版本，且 @ray-js/ray `>=1.5.17` 版本才可使用，IDE 模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ | 
| complete | `function` |       | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

##### 请求示例

```ts
openCreateTapToRunScene({
  devId: "devId"
}).then(() => {
  console.log('调用成功打开创建场景页面');
});
```

##### 预览示例
#### openEditScene

跳转编辑场景页面

##### 引入

```js
import { openEditScene } from '@ray-js/ray';
```

> @ray-js/ray 需在 `>=1.4.32`版本才可使用。IDE模拟器与真机调试环境当前无法使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| devId    | `string`   |        | 否   | 设备 id （Android端在App 5.10.0及以上版本支持）  |
| sceneId  | `string`   |        | 否   | 场景 id （Android端在App 5.10.0及以上版本支持）  |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

##### 请求示例

```ts
openEditScene({
  devId: "devId"
  sceneId: "sceneId"
}).then(() => {
  console.log('调用成功打开创建场景页面');
});
```
