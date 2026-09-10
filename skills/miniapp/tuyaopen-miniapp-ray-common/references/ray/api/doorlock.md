# 门锁 (doorlock)


## 基础功能

#### init

##### 功能描述

初始化 SDK。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 使用 SDK 前必须先调用此方法进行初始化
- 如果未提供 deviceId 和 devInfo，将从启动参数中获取设备 id
- 如果提供了 deviceId 但 devInfo 为空或不匹配，将自动获取设备信息

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| options | LockSDKOption | - | 否 | 初始化参数 |

###### LockSDKOption 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| deviceId | string | - | 否 | 设备 id |
| devInfo | any | - | 否 | 设备信息 |
| strictMode | boolean | true | 否 | 是否严格模式，如果为 true，则 dp 数据进行严格校验，否则不进行严格校验 |
| passwordDigitalBase | number | 10 | 否 | 密码支持的进制，只支持十以内的进制，默认为十进制 |
| passwordSupportZero | boolean | true | 否 | 密码是否支持 0，默认为 true |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { init } from '@ray-js/lock-sdk';

// 方式1：从启动参数获取设备 id
await init();

// 方式2：提供设备 id
await init({
  deviceId: 'xxx'
});

// 方式3：提供完整的初始化配置
await init({
  deviceId: 'xxx',
  strictMode: true,
  passwordDigitalBase: 10,
  passwordSupportZero: true
});
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### destroy

##### 功能描述

销毁 SDK。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 销毁 SDK 会清除所有状态和事件监听器
- 销毁后需要重新初始化才能使用

##### 参数

无参数。

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { destroy } from '@ray-js/lock-sdk';

destroy();
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### getCurrentUser

##### 功能描述

获取当前用户信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回当前登录用户的信息
- 支持强制刷新
- 默认会使用缓存数据

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| isForce | boolean | false | 否 | 是否强制刷新 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |
| lockUserId | number | 锁端用户 id |
| userType | UserType | 用户类型 |
| allOpenDps | string | 支持的开锁 dp |
| allOpenType | number[] | 支持的开锁类型 |
| productAttribute | number | 产品属性 |
| phase | number | 阶段 |
| admin | boolean | 是否管理员 |
| offlineUnlock | boolean | 是否支持离线开锁 |
| permanent | boolean | 是否永久有效 |

##### 代码示例

```javascript
import { getCurrentUser } from '@ray-js/lock-sdk';

// 获取缓存数据
const user = await getCurrentUser();

// 强制刷新
const user2 = await getCurrentUser(true);

console.log('用户ID:', user.userId);
console.log('是否管理员:', user.admin);
```

##### 返回示例

```json
{
  "userId": "xxx",
  "lockUserId": 1,
  "userType": 10,
  "allOpenDps": "1,2,3",
  "allOpenType": [1, 2, 3],
  "productAttribute": 1,
  "phase": 1,
  "admin": true,
  "offlineUnlock": true,
  "permanent": true
}
```

##### 错误码

无错误码。
#### getCurrentUserSync

##### 功能描述

获取当前用户信息。注意：此方法只能在初始化后使用。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此方法是同步方法
- 只能在初始化后使用
- 返回的是缓存数据，可能不是最新的

##### 参数

无参数。

##### 返回数据

返回 CurrentUser 对象，结构同 getCurrentUser 返回的数据。

##### 代码示例

```javascript
import { getCurrentUserSync } from '@ray-js/lock-sdk';

const user = getCurrentUserSync();

if (user) {
  console.log('用户ID:', user.userId);
  console.log('是否管理员:', user.admin);
} else {
  console.log('用户信息未初始化');
}
```

##### 返回示例

```json
{
  "userId": "xxx",
  "lockUserId": 1,
  "userType": 10,
  "allOpenDps": "1,2,3",
  "allOpenType": [1, 2, 3],
  "productAttribute": 1,
  "phase": 1,
  "admin": true,
  "offlineUnlock": true,
  "permanent": true
}
```

##### 错误码

无错误码。
#### getDeviceStatus

##### 功能描述

获取设备状态信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回当前设备的状态信息
- 设备状态包括：在线、离线、休眠

##### 参数

无参数。

##### 返回数据

返回 DeviceStatus 对象，结构如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 设备状态，可能的值：offline（离线）、online（在线）、sleep（休眠） |
| connectEanble | boolean | 是否可手动连接设备 |
| onlineType | string | 在线类型，当 type 为 online 时有效，可能的值：local（本地）、cloud（云端）、ble（蓝牙）、none（无）、unknown（未知） |
| sleepPeriod | SleepPeriod | 休眠时间段，仅当 type 为 sleep 时有效 |

###### SleepPeriod 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| start | number | 开始时间（分钟） |
| end | number | 结束时间（分钟） |

##### 代码示例

```javascript
import { getDeviceStatus } from '@ray-js/lock-sdk';

const status = getDeviceStatus();

console.log('设备状态:', status.type);
if (status.type === 'online') {
  console.log('在线类型:', status.onlineType);
} else if (status.type === 'sleep') {
  console.log('休眠时间段:', status.sleepPeriod);
}
```

##### 返回示例

```json
{
  "type": "online",
  "connectEanble": true,
  "onlineType": "cloud",
  "sleepPeriod": null
}
```

##### 错误码

无错误码。
#### onDeviceStatusChange

##### 功能描述

注册设备状态信息变更事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 当设备状态发生变化时，会触发回调函数
- 需要在组件卸载时注销监听器

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| callback | function | - | 是 | 设备状态变更回调函数 |

###### callback 函数参数

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 设备状态，可能的值：offline（离线）、online（在线）、sleep（休眠） |
| connectEanble | boolean | 是否可手动连接设备 |
| onlineType | string | 在线类型，当 type 为 online 时有效 |
| sleepPeriod | SleepPeriod | 休眠时间段，仅当 type 为 sleep 时有效 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onDeviceStatusChange, offDeviceStatusChange } from '@ray-js/lock-sdk';

const handleStatusChange = (status) => {
  console.log('设备状态:', status.type);
  if (status.type === 'online') {
    console.log('在线类型:', status.onlineType);
  }
};

// 注册监听器
onDeviceStatusChange(handleStatusChange);

// 注销监听器
offDeviceStatusChange(handleStatusChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### offDeviceStatusChange

##### 功能描述

注销设备状态信息变更事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要传入与注册时相同的回调函数
- 注销后不再接收设备状态变更事件

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| callback | function | - | 是 | 设备状态变更回调函数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onDeviceStatusChange, offDeviceStatusChange } from '@ray-js/lock-sdk';

const handleStatusChange = (status) => {
  console.log('设备状态:', status.type);
};

// 注册监听器
onDeviceStatusChange(handleStatusChange);

// 注销监听器
offDeviceStatusChange(handleStatusChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### getWiFiSignal

##### 功能描述

获取设备信号强度。此方法只向设备触发动作不返回信号强度，信号强度变化通过 onWiFiSignalChange 监听。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 设备必须云端在线
- 信号强度需要通过 onWiFiSignalChange 监听器获取
- 此方法只是触发设备上报信号强度

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { getWiFiSignal, onWiFiSignalChange } from '@ray-js/lock-sdk';

// 监听信号强度变化
onWiFiSignalChange((params) => {
  console.log('信号强度:', params.signal);
  console.log('信号等级:', params.level);
});

// 触发获取信号强度
await getWiFiSignal();
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 设备不在线 |
#### onWiFiSignalChange

##### 功能描述

监听设备信号强度变化。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 当信号强度发生变化时，会触发回调函数
- 需要在组件卸载时注销监听器

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| cb | function | - | 是 | 信号强度变化回调函数 |

###### cb 函数参数

| 属性 | 类型 | 说明 |
|------|------|------|
| signal | number | 信号强度值 |
| level | string | 信号等级，可能的值：good（良好）、normal（一般）、weak（弱）、bad（差） |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onWiFiSignalChange, offWiFiSignalChange } from '@ray-js/lock-sdk';

const handleSignalChange = (params) => {
  console.log('信号强度:', params.signal);
  console.log('信号等级:', params.level);
};

// 注册监听器
onWiFiSignalChange(handleSignalChange);

// 注销监听器
offWiFiSignalChange(handleSignalChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### offWiFiSignalChange

##### 功能描述

注销设备信号强度变化监听。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要传入与注册时相同的回调函数
- 注销后不再接收信号强度变化事件

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| cb | function | - | 是 | 信号强度变化回调函数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onWiFiSignalChange, offWiFiSignalChange } from '@ray-js/lock-sdk';

const handleSignalChange = (params) => {
  console.log('信号强度:', params.signal);
};

// 注册监听器
onWiFiSignalChange(handleSignalChange);

// 注销监听器
offWiFiSignalChange(handleSignalChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。

## 用户管理

#### getUserInfo

##### 功能描述

获取用户详细信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要通过用户 id 和昵称来查找用户
- 如果找不到用户，将抛出错误

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 用户 id |
| nickName | string | - | 是 | 用户昵称 |

##### 返回数据

返回 Promise，Promise 中的数据为 UserInfo 对象。

###### UserInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |
| lockUserId | number | 锁端用户 id |
| avatarUrl | string | 用户头像 |
| backHomeNotifyAttr | number | 回家通知属性 |
| effectiveFlag | number | 状态 |
| nickName | string | 昵称 |
| offlineUnlock | boolean | 是否支持离线开锁 |
| timeScheduleInfo | TimeScheduleInfo | 生效时间配置 |
| unlockDetails | UnlockDetail[] | 开锁方式列表 |
| userContact | string | 用户账号 |
| userType | UserType | 用户类型 |
| isAccountUser | boolean | 是否为账号用户 |

###### TimeScheduleInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveTime | number | 生效日期，单位毫秒 |
| expiredTime | number | 失效日期，单位毫秒 |
| permanent | boolean | 是否永久有效 |
| scheduleDetails | ScheduleDetail | 重复配置，permanent 为 true 时，无此配置 |

###### ScheduleDetail 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| repeat | boolean | 是否周重复 |
| effectiveTime | number | 每天的生效时间，单位分钟 |
| invalidTime | number | 每天的失效时间，单位分钟 |
| timeZoneId | string | 时区 |
| weeks | Week | 周重复数据，数组长度为 7，依次表示周日到周六，0 表示不生效，1 表示生效 |

###### UnlockDetail 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| count | number | 本类开锁方式的数量 |
| dpCode | string | 对应的开锁方式dp code |
| dpId | number | 对应的开锁方式dp id |
| type | UnlockMethodType | 本类开锁方式的类型，可能的值：finger（指纹）、face（人脸）、password（密码）、card（卡片）、fingerVein（指静脉）、hand（掌静脉）、eye（眼纹） |
| unlockList | UnlockMethodBaseInfo[] | 本类开锁方式详细列表 |

###### UnlockMethodBaseInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| unlockId | string | 开锁方式硬件 id |
| unlockName | string | 开锁方式名称 |
| isBound | boolean | 是否为云端关联的开锁方式，true 表示关联的开锁方式，false 表示非关联的开锁方式 |
| id | number | 开锁方式 id，云端分配的开锁方式 id |
| photoUnlock | boolean | 是否为图片开锁方式 |
| isSpecial | boolean | 是否为特殊开锁方式 |

##### 代码示例

```javascript
import { getUserInfo } from '@ray-js/lock-sdk';

const userInfo = await getUserInfo({
  userId: 'xxx',
  nickName: '张三'
});

console.log('用户昵称:', userInfo.nickName);
console.log('开锁方式数量:', userInfo.unlockDetails.length);
```

##### 返回示例

```json
{
  "userId": "xxx",
  "lockUserId": 1,
  "avatarUrl": "https://xxx",
  "nickName": "张三",
  "offlineUnlock": true,
  "timeScheduleInfo": {
    "effectiveTime": 1234567890000,
    "expiredTime": 1235173890000,
    "permanent": false
  },
  "unlockDetails": [
    {
      "count": 2,
      "dpCode": "unlock_finger",
      "dpId": 1,
      "type": "finger",
      "unlockList": [
        {
          "unlockId": "1",
          "unlockName": "指纹1",
          "isBound": true,
          "id": 123,
          "photoUnlock": false,
          "isSpecial": false
        },
        {
          "unlockId": "2",
          "unlockName": "指纹2",
          "isBound": true,
          "id": 124,
          "photoUnlock": false,
          "isSpecial": false
        }
      ]
    }
  ],
  "userContact": "1********",
  "userType": 10,
  "isAccountUser": true,
  "backHomeNotifyAttr": 0,
  "effectiveFlag": 1
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1048 | 用户不存在 |
#### getUsers

##### 功能描述

获取门锁成员列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 支持分页查询
- 支持关键字搜索
- 默认每页条数为 10

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| page | number | 1 | 否 | 当前页码 |
| pageSize | number | 10 | 否 | 每页条数 |
| keyword | string | "" | 否 | 搜索关键字 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| list | UserInfo[] | 用户列表 |
| hasMore | boolean | 是否还有更多数据 |

###### UserInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |
| lockUserId | number | 锁端用户 id |
| avatarUrl | string | 用户头像 |
| backHomeNotifyAttr | number | 回家通知属性 |
| effectiveFlag | number | 状态 |
| nickName | string | 昵称 |
| offlineUnlock | boolean | 是否支持离线开锁 |
| timeScheduleInfo | TimeScheduleInfo | 生效时间配置 |
| unlockDetails | UnlockDetail[] | 开锁方式列表 |
| userContact | string | 用户账号 |
| userType | UserType | 用户类型 |
| isAccountUser | boolean | 是否为账号用户 |

###### TimeScheduleInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveTime | number | 生效日期，单位毫秒 |
| expiredTime | number | 失效日期，单位毫秒 |
| permanent | boolean | 是否永久有效 |
| scheduleDetails | ScheduleDetail | 重复配置，permanent 为 true 时，无此配置 |

###### ScheduleDetail 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| repeat | boolean | 是否周重复 |
| effectiveTime | number | 每天的生效时间，单位分钟 |
| invalidTime | number | 每天的失效时间，单位分钟 |
| timeZoneId | string | 时区 |
| weeks | Week | 周重复数据，数组长度为 7，依次表示周日到周六，0 表示不生效，1 表示生效 |

###### UnlockDetail 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| count | number | 本类开锁方式的数量 |
| dpCode | string | 对应的开锁方式dp code |
| dpId | number | 对应的开锁方式dp id |
| type | UnlockMethodType | 本类开锁方式的类型，可能的值：finger（指纹）、face（人脸）、password（密码）、card（卡片）、fingerVein（指静脉）、hand（掌静脉）、eye（眼纹） |
| unlockList | UnlockMethodBaseInfo[] | 本类开锁方式详细列表 |

###### UnlockMethodBaseInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| unlockId | string | 开锁方式硬件 id |
| unlockName | string | 开锁方式名称 |
| isBound | boolean | 是否为云端关联的开锁方式，true 表示关联的开锁方式，false 表示非关联的开锁方式 |
| id | number | 开锁方式 id，云端分配的开锁方式 id |
| photoUnlock | boolean | 是否为图片开锁方式 |
| isSpecial | boolean | 是否为特殊开锁方式 |

##### 代码示例

```javascript
import { getUsers } from '@ray-js/lock-sdk';

const result = await getUsers({
  page: 1,
  pageSize: 10,
  keyword: '张三'
});

console.log('用户数量:', result.list.length);
console.log('是否还有更多:', result.hasMore);
```

##### 返回示例

```json
{
  "list": [
    {
      "userId": "xxx",
      "lockUserId": 1,
      "avatarUrl": "https://xxx",
      "nickName": "张三",
      "offlineUnlock": true,
      "timeScheduleInfo": {
        "effectiveTime": 1234567890000,
        "expiredTime": 1235173890000,
        "permanent": false,
        "scheduleDetails": {
          "repeat": true,
          "effectiveTime": 480,
          "invalidTime": 1080,
          "timeZoneId": "Asia/Shanghai",
          "weeks": [0, 1, 1, 1, 1, 1, 0]
        }
      },
      "unlockDetails": [
        {
          "count": 2,
          "dpCode": "unlock_finger",
          "dpId": 1,
          "type": "finger",
          "unlockList": [
            {
              "unlockId": "1",
              "unlockName": "指纹1",
              "isBound": true,
              "id": 123,
              "photoUnlock": false,
              "isSpecial": false
            },
            {
              "unlockId": "2",
              "unlockName": "指纹2",
              "isBound": true,
              "id": 124,
              "photoUnlock": false,
              "isSpecial": false
            }
          ]
        }
      ],
      "userContact": "1********",
      "userType": 10,
      "isAccountUser": true,
      "backHomeNotifyAttr": 0,
      "effectiveFlag": 1
    }
  ],
  "hasMore": false
}
```

##### 错误码

无错误码。
#### addUser

##### 功能描述

添加一个普通成员。注意，如果锁使用了小容量的方案，则不建议使用此 API。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 如果锁使用了小容量的方案，则不建议使用此 API
- 用户名称不能为空

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| name | string | - | 是 | 用户名称 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |

##### 代码示例

```javascript
import { addUser } from '@ray-js/lock-sdk';

const result = await addUser({
  name: '新成员'
});

console.log('新用户ID:', result.userId);
```

##### 返回示例

```json
{
  "userId": "xxx"
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1009 | 用户名称不能为空 |
| 1060 | 不支持此功能（小容量方案） |
#### removeUser

##### 功能描述

删除一个普通成员。注意，如果锁使用了小容量的方案，则不建议使用此 API。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 如果锁使用了小容量的方案，则不建议使用此 API
- 删除后无法恢复
- 删除成员时会同时删除其开锁方式

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 成员 id |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { removeUser } from '@ray-js/lock-sdk';

await removeUser('xxx');
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1060 | 不支持此功能（小容量方案） |
#### updateUserLimitTime

##### 功能描述

更新用户的时效性。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 管理员不允许修改时效性
- 如果 permanent 为 true，则 effective 参数无效

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 用户 id |
| lockUserId | number | - | 是 | 锁端用户 id |
| permanent | boolean | - | 是 | 是否永久有效 |
| effective | EffectiveConfig | - | 否 | 时效配置，当 permanent 为 false 时必填 |
| offlineUnlock | boolean | - | 否 | 是否支持离线开锁 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| effectiveDate | number | - | 是 | 生效日期，单位为秒 |
| expiredDate | number | - | 是 | 失效日期，单位为秒 |
| repeat | "none" \| "week" | "none" | 否 | 重复类型，目前支持 none 和 week |
| weeks | Week | - | 否 | 周重复配置，仅当 repeat 为 week 时生效 |
| effectiveTime | number | - | 否 | 生效时间，单位分钟，如生效时间为12:00，则值为 720 |
| expiredTime | number | - | 否 | 失效时间，单位分钟，如失效时间为23:00，则值为 1380 |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { updateUserLimitTime } from '@ray-js/lock-sdk';

// 设置为永久有效
await updateUserLimitTime({
  userId: 'xxx',
  lockUserId: 1,
  permanent: true
});

// 设置时效配置
await updateUserLimitTime({
  userId: 'xxx',
  lockUserId: 1,
  permanent: false,
  effective: {
    effectiveDate: Math.floor(Date.now() / 1000),
    expiredDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    repeat: 'week',
    weeks: [0, 1, 1, 1, 1, 1, 0],
    effectiveTime: 480,
    expiredTime: 1080
  }
});
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1011 | 更新时效配置失败 |
| 1012 | 更新云端数据失败 |
| 1049 | 管理员不允许修改时效性 |
#### openAddFamilyUser

##### 功能描述

添加家庭成员

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 需要确保 App 支持该功能，否则会抛出错误
- 此 API 会跳转到涂鸦智能 App 的添加家庭成员页面

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明   |
| ---- | ---- | ------ | ---- | ------ |
| -    | -    | -      | -    | 无参数 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型    | 说明                |
| ---- | ------- | ------------------- |
| -    | boolean | 跳转成功时返回 true |

##### 代码示例

```javascript
import { openAddFamilyUser } from '@ray-js/lock-sdk';

try {
  await openAddFamilyUser();
  console.log('跳转成功');
} catch (error) {
  console.error('跳转失败:', error);
}
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明            |
| ------ | --------------- |
| 1013   | App不支持该功能 |
#### openFamilyUserDetail

##### 功能描述

查看家庭成员信息，支持编辑。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 需要确保 App 支持该功能，否则会抛出错误
- 此 API 会跳转到涂鸦智能 App 的家庭成员详情页面
- 仅适用于账号用户（家庭成员），普通成员不支持此功能

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 成员 id |

##### 返回数据

返回 Promise，Promise 中无数据（void）。

##### 代码示例

```javascript
import { openFamilyUserDetail } from '@ray-js/lock-sdk';

try {
  await openFamilyUserDetail('xxx');
  console.log('跳转成功');
} catch (error) {
  console.error('跳转失败:', error);
}
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1013 | App不支持该功能 |

## 远程开关锁

#### checkRemoteEnabled

##### 功能描述

校验是否可以远程开/关锁。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 设备必须在线
- 设备必须支持远程开/关锁功能
- 远程开/关锁功能必须已开启
- 当前用户必须有权限开/关锁

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。如果校验失败，将抛出错误。

##### 代码示例

```javascript
import { checkRemoteEnabled } from '@ray-js/lock-sdk';

try {
  await checkRemoteEnabled();
  console.log('可以远程开关锁');
} catch (error) {
  console.error('无法远程开关锁:', error);
}
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 设备不在线 |
| 1045 | 不支持远程开锁 |
| 1046 | 远程开/关锁未开启 |
| 1047 | 无权限开/关锁 |
#### openDoor

##### 功能描述

开锁。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要先校验是否可以远程开/关锁
- 默认超时时间为 15000 毫秒
- 开锁过程可能需要一些时间，请耐心等待

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| option | object | - | 否 | 开锁选项 |

###### option 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| timeout | number | 15000 | 否 | 超时时间，单位为毫秒 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { openDoor } from '@ray-js/lock-sdk';

try {
  await openDoor({
    timeout: 15000
  });
  console.log('开锁成功');
} catch (error) {
  console.error('开锁失败:', error);
}
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 设备不在线 |
| 1002 | 开锁超时 |
| 1003 | 开锁失败 |
| 1004 | 开锁失败（状态码为 0x01） |
| 1005 | 密钥失效 |
| 1006 | 密钥次数使用完 |
| 1007 | 密钥不在有效期内 |
| 1008 | 密钥比对错误 |
| 1045 | 不支持远程开/关锁 |
| 1046 | 远程开/关锁未开启 |
| 1047 | 无权限开/关锁 |
#### closeDoor

##### 功能描述

关锁。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要先校验是否可以远程开/关锁
- 默认超时时间为 15000 毫秒
- 关锁过程可能需要一些时间，请耐心等待

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| option | object | - | 否 | 关锁选项 |

###### option 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| timeout | number | 15000 | 否 | 超时时间，单位为毫秒 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { closeDoor } from '@ray-js/lock-sdk';

try {
  await closeDoor({
    timeout: 15000
  });
  console.log('关锁成功');
} catch (error) {
  console.error('关锁失败:', error);
}
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 设备不在线 |
| 1002 | 关锁超时 |
| 1003 | 关锁失败 |
| 1004 | 关锁失败（状态码为 0x01） |
| 1005 | 密钥失效 |
| 1006 | 密钥次数使用完 |
| 1007 | 密钥不在有效期内 |
| 1008 | 密钥比对错误 |
| 1045 | 不支持远程开/关锁 |
| 1046 | 远程开/关锁未开启 |
| 1047 | 无权限开/关锁 |
#### getRemotePermission

##### 功能描述

获取远程开/关锁当前权限。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回当前设置的权限
- 权限可能的值：everyOne（所有人都可以）、adminsOnly（仅管理员可以）、noOne（所有人都不可以）

##### 参数

无参数。

##### 返回数据

返回 RemotePermission，当前权限。

##### 代码示例

```javascript
import { getRemotePermission } from '@ray-js/lock-sdk';

const permission = getRemotePermission();

console.log('当前权限:', permission);
```

##### 返回示例

```json
"everyOne"
```

##### 错误码

无错误码。
#### getRemotePermissionList

##### 功能描述

获取远程开/关锁权限列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回所有可用的权限选项
- 权限选项包括：everyOne（所有人都可以）、adminsOnly（仅管理员可以）、noOne（所有人都不可以）

##### 参数

无参数。

##### 返回数据

返回 `RemotePermission[]`，权限列表数组。

| 属性 | 类型 | 说明 |
|------|------|------|
| - | RemotePermission[] | 权限列表数组，数组元素为字符串类型 |

###### RemotePermission 类型说明

权限选项类型，可能的值：
- `everyOne`：所有人都可以
- `adminsOnly`：仅管理员可以
- `noOne`：所有人都不可以

##### 代码示例

```javascript
import { getRemotePermissionList } from '@ray-js/lock-sdk';

const permissions = getRemotePermissionList();

console.log('可用权限:', permissions);
```

##### 返回示例

```json
["everyOne", "adminsOnly", "noOne"]
```

##### 错误码

无错误码。
#### remoteEnabled

##### 功能描述

设置远程开/关锁功能开关

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 开启远程开/关锁功能后，会自动同步密钥
- 此操作会修改设备属性

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| state | boolean | - | 是 | 是否开启，true 表示开启，false 表示关闭 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { remoteEnabled } from '@ray-js/lock-sdk';

// 开启远程开/关锁功能
await remoteEnabled(true);

// 关闭远程开/关锁功能
await remoteEnabled(false);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### getRemoteEnabled

##### 功能描述

获取远程开/关锁功能开启状态

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回当前远程开/关锁功能的开启状态

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示已开启，false 表示已关闭。

##### 代码示例

```javascript
import { getRemoteEnabled } from '@ray-js/lock-sdk';

const enabled = getRemoteEnabled();

if (enabled) {
  console.log('远程开/关锁功能已开启');
} else {
  console.log('远程开/关锁功能已关闭');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### updateRemotePermission

##### 功能描述

更新远程开/关锁权限。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此操作会修改设备属性
- 权限可能的值：everyOne（所有人都可以）、adminsOnly（仅管理员可以）、noOne（所有人都不可以）

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| permission | RemotePermission | - | 是 | 远程开/关锁权限，可能的值：everyOne（所有人都可以）、adminsOnly（仅管理员可以）、noOne（所有人都不可以） |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { updateRemotePermission } from '@ray-js/lock-sdk';

// 设置为所有人都可以
await updateRemotePermission('everyOne');

// 设置为仅管理员可以
await updateRemotePermission('adminsOnly');

// 设置为所有人都不可以
await updateRemotePermission('noOne');
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### agreeOpenDoor

##### 功能描述

同意远程开锁请求，适用于 WiFi Pro 品类设备。当有访客通过门铃请求开锁时，调用此接口确认开锁。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi Pro 品类设备
- 需要在收到开锁请求后调用
- 设备必须在线
- 存在超时机制，默认 15 秒

##### 参数

| 属性    | 类型   | 默认值 | 必填 | 说明               |
| ------- | ------ | ------ | ---- | ------------------ |
| timeout | number | 15000  | 否   | 超时时间，单位毫秒 |

##### 返回数据

返回 `Promise<void>`

##### 代码示例

```javascript
import { agreeOpenDoor } from "@ray-js/lock-sdk";

// 同意开锁请求
const confirmUnlock = async () => {
  try {
    await agreeOpenDoor({ timeout: 15000 });
    console.log("开锁成功");
  } catch (error) {
    console.error("开锁失败:", error);
  }
};

// 收到门铃请求后调用
onDoorbellRing(() => {
  // 显示确认弹窗
  showConfirmDialog({
    title: "有人按门铃",
    content: "是否同意开门？",
    onConfirm: confirmUnlock,
  });
});
```

##### 返回示例

无返回数据

##### 错误码

| 错误码 | 说明                 |
| ------ | -------------------- |
| 1001   | 设备已离线           |
| 1002   | 操作超时             |
| 1003   | 远程开锁失败         |
| 1004   | 设备上报远程开锁失败 |
#### rejectOpenDoor

##### 功能描述

拒绝远程开锁请求，适用于 WiFi Pro 品类设备。当有访客通过门铃请求开锁时，调用此接口拒绝开锁。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi Pro 品类设备
- 需要在收到开锁请求后调用
- 设备必须在线
- 存在超时机制，默认 15 秒

##### 参数

| 属性    | 类型   | 默认值 | 必填 | 说明               |
| ------- | ------ | ------ | ---- | ------------------ |
| timeout | number | 15000  | 否   | 超时时间，单位毫秒 |

##### 返回数据

返回 `Promise<void>`

##### 代码示例

```javascript
import { agreeOpenDoor, rejectOpenDoor } from "@ray-js/lock-sdk";

// 拒绝开锁请求
const rejectUnlock = async () => {
  try {
    await rejectOpenDoor({ timeout: 15000 });
    console.log("已拒绝开锁");
  } catch (error) {
    console.error("操作失败:", error);
  }
};

// 收到门铃请求后调用
onDoorbellRing(() => {
  // 显示确认弹窗
  showConfirmDialog({
    title: "有人按门铃",
    content: "是否同意开门？",
    onConfirm: () => agreeOpenDoor(),
    onCancel: rejectUnlock,
  });
});
```

##### 返回示例

无返回数据

##### 错误码

| 错误码 | 说明                 |
| ------ | -------------------- |
| 1001   | 设备已离线           |
| 1002   | 操作超时             |
| 1003   | 远程开锁失败         |
| 1004   | 设备上报远程开锁失败 |

## 联动设置

#### getDoorbellService

##### 功能描述

获取门铃通知服务信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回门铃通知服务的配置信息
- 如果服务未配置，返回 undefined

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据为 LinkageRule 对象或 undefined。

###### LinkageRule 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| background | string | 背景 |
| code | string | 规则代码 |
| description | string | 描述 |
| displayColor | string | 显示颜色 |
| icon | string | 图标 |
| order | number | 排序 |
| title | string | 标题 |
| ruleId | string | 规则 id |
| ruleVO | RuleVO | 规则详情 |

###### RuleVO 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| actions | Action[] | 动作列表 |
| auditStatus | number | 审核状态 |
| boundForPanel | boolean | 是否绑定到面板 |
| boundForWiFiPanel | boolean | 是否绑定到 WiFi 面板 |
| code | string | 规则代码 |
| commonField | string | 通用字段 |
| conditions | Condition[] | 条件列表 |
| containDeviceDelete | boolean | 是否包含设备删除 |
| coverIcon | string | 封面图标 |
| description | string | 描述 |
| disableTime | number | 禁用时间 |
| displayColor | string | 显示颜色 |
| enabled | boolean | 是否启用 |
| forceCloudTrigger | boolean | 是否强制云端触发 |
| gmtCreate | number | 创建时间 |
| gmtModified | number | 修改时间 |
| id | string | 规则 id |
| iotAutoAlarm | boolean | 是否 IoT 自动告警 |
| isAlarmIssue | boolean | 是否告警问题 |
| isLogicRule | boolean | 是否逻辑规则 |
| linkageType | number | 联动类型 |
| localLinkage | boolean | 是否本地联动 |
| matchType | number | 匹配类型 |
| name | string | 规则名称 |
| needCleanGidSid | boolean | 是否需要清理 gid sid |
| needValidOutOfWork | boolean | 是否需要验证非工作时间 |
| newLocalScene | boolean | 是否新本地场景 |
| offGwSync | boolean | 是否关闭网关同步 |
| offGwSyncSuccess | boolean | 是否关闭网关同步成功 |
| orderWeight | number | 排序权重 |
| outOfWork | number | 非工作时间 |
| ownerId | string | 所有者 id |
| panelType | number | 面板类型 |
| permissionCode | string | 权限代码 |
| ruleGenre | number | 规则类型 |
| ruleSource | number | 规则来源 |
| ruleType | number | 规则类型 |
| scenarioRule | boolean | 是否场景规则 |
| status | boolean | 状态 |
| stickyOnTop | boolean | 是否置顶 |
| subMatchType | number | 子匹配类型 |

###### Action 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| actionExecutor | string | 动作执行器 |
| actionStrategy | string | 动作策略 |
| attribute | number | 属性 |
| devDelMark | boolean | 设备删除标记 |
| enabled | boolean | 是否启用 |
| entityId | string | 实体 id |
| executorProperty | ExecutorProperty | 执行器属性 |
| extraProperty | ExtraProperty | 额外属性 |
| gmtModified | number | 修改时间 |
| id | string | 动作 id |
| offGwSync | boolean | 是否关闭网关同步 |
| orderNum | number | 排序号 |
| ruleId | string | 规则 id |
| status | boolean | 状态 |

###### ExecutorProperty 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| topic | string | 主题 |
| customParameters | Record<string, any> | 自定义参数 |

###### ExtraProperty 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| entityName | string | 实体名称 |
| iconUrl | string | 图标 url |
| statusDescript | string | 状态描述 |
| type | string | 类型 |

###### Condition 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| attribute | number | 属性 |
| condType | number | 条件类型 |
| devDelMark | boolean | 设备删除标记 |
| enabled | boolean | 是否启用 |
| entityId | string | 实体 id |
| entityName | string | 实体名称 |
| entitySubIds | string | 实体子 id |
| entityType | number | 实体类型 |
| expr | any[] | 表达式 |
| exprDisplay | string | 表达式显示 |
| extraInfo | Record<string, any> | 额外信息 |
| handleStrategy | string | 处理策略 |
| iconUrl | string | 图标 url |
| id | string | 条件 id |
| orderNum | number | 排序号 |
| ruleId | string | 规则 id |
| serviceProvider | string | 服务提供商 |
| support | number | 支持 |

##### 代码示例

```javascript
import { getDoorbellService } from '@ray-js/lock-sdk';

const service = await getDoorbellService();

if (service) {
  console.log('门铃通知服务已配置');
  console.log('规则ID:', service.ruleId);
} else {
  console.log('门铃通知服务未配置');
}
```

##### 返回示例

```json
{
  "background": "",
  "code": "doorbell_ring",
  "description": "门铃通知",
  "displayColor": "0084FF",
  "icon": "",
  "order": 0,
  "title": "门铃通知",
  "ruleId": "xxx",
  "ruleVO": {
    "actions": [
      {
        "actionExecutor": "kafkaSend",
        "actionStrategy": "",
        "attribute": 0,
        "devDelMark": false,
        "enabled": true,
        "entityId": "xxx",
        "executorProperty": {
          "topic": "1",
          "customParameters": {
            "type": 1
          }
        },
        "extraProperty": {
          "entityName": "notify_phone",
          "iconUrl": "",
          "statusDescript": "",
          "type": ""
        },
        "gmtModified": 1234567890000,
        "id": "xxx",
        "offGwSync": false,
        "orderNum": 0,
        "ruleId": "xxx",
        "status": true
      }
    ],
    "auditStatus": 1,
    "boundForPanel": true,
    "boundForWiFiPanel": true,
    "code": "doorbell_ring",
    "commonField": "",
    "conditions": [
      {
        "attribute": 0,
        "condType": 0,
        "devDelMark": false,
        "enabled": true,
        "entityId": "xxx",
        "entityName": "",
        "entitySubIds": "",
        "entityType": 23,
        "expr": [],
        "exprDisplay": "远程开锁 : Unlock",
        "extraInfo": {
          "businessType": "doorbell_ring"
        },
        "handleStrategy": "",
        "iconUrl": "",
        "id": "xxx",
        "orderNum": 0,
        "ruleId": "xxx",
        "serviceProvider": "",
        "support": 1
      }
    ],
    "containDeviceDelete": false,
    "coverIcon": "",
    "description": "门铃通知",
    "disableTime": 0,
    "displayColor": "0084FF",
    "enabled": true,
    "forceCloudTrigger": false,
    "gmtCreate": 1234567890000,
    "gmtModified": 1234567890000,
    "id": "xxx",
    "iotAutoAlarm": false,
    "isAlarmIssue": false,
    "isLogicRule": false,
    "linkageType": 0,
    "localLinkage": false,
    "matchType": 2,
    "name": "doorbell",
    "needCleanGidSid": false,
    "needValidOutOfWork": false,
    "newLocalScene": false,
    "offGwSync": false,
    "offGwSyncSuccess": false,
    "orderWeight": 0,
    "outOfWork": 0,
    "ownerId": "xxx",
    "panelType": 0,
    "permissionCode": "",
    "ruleGenre": 0,
    "ruleSource": 0,
    "ruleType": 0,
    "scenarioRule": false,
    "status": true,
    "stickyOnTop": false,
    "subMatchType": 0
  }
}
```

##### 错误码

无错误码。
#### enableDoorbellService

##### 功能描述

启用门铃通知服务。注意：首次开通时，会先进入创建动作的页面，创建完成后，会自动启用门铃通知服务。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 首次开通时，会先进入创建动作的页面
- 创建完成后，会自动启用门铃通知服务
- 如果服务已存在，则直接启用

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { enableDoorbellService } from '@ray-js/lock-sdk';

await enableDoorbellService();
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### disableDoorbellService

##### 功能描述

禁用门铃通知服务。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能禁用已配置的门铃通知服务
- 如果服务未配置，将抛出错误

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { disableDoorbellService } from '@ray-js/lock-sdk';

await disableDoorbellService();
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1059 | 门铃通知服务未配置 |
#### getRemainingInfo

##### 功能描述

获取剩余通知次数。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回短信通知和语音通知的剩余次数
- 需要设备支持门铃通知服务

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| message | number | 剩余短信通知次数 |
| phone | number | 剩余语音通知次数 |

##### 代码示例

```javascript
import { getRemainingInfo } from '@ray-js/lock-sdk';

const info = await getRemainingInfo();

console.log('剩余短信通知次数:', info.message);
console.log('剩余语音通知次数:', info.phone);
```

##### 返回示例

```json
{
  "message": 100,
  "phone": 50
}
```

##### 错误码

无错误码。
#### toSetDoorbellService

##### 功能描述

去配置门铃通知服务。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 如果服务已配置，会进入编辑页面
- 如果服务未配置，会进入创建页面

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { toSetDoorbellService } from '@ray-js/lock-sdk';

await toSetDoorbellService();
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。

## 媒体

#### getMediaRotate

##### 功能描述

获取设备旋转角度。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回图片和视频的旋转角度
- 角度用于校正媒体显示方向

##### 参数

无参数。

##### 返回数据

返回对象，结构如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| imageAngle | number | 图片旋转角度 |
| videoAngle | number | 视频旋转角度 |

##### 代码示例

```javascript
import { getMediaRotate } from '@ray-js/lock-sdk';

const rotate = getMediaRotate();

console.log('图片旋转角度:', rotate.imageAngle);
console.log('视频旋转角度:', rotate.videoAngle);
```

##### 返回示例

```json
{
  "imageAngle": 0,
  "videoAngle": 0
}
```

##### 错误码

无错误码。
#### getMediaUrl

##### 功能描述

获取视频的实际播放地址。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要提供媒体路径和媒体桶
- 返回的地址可以直接用于播放视频

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| mediaPath | string | - | 是 | 媒体路径 |
| mediaBucket | string | - | 是 | 媒体桶 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| mediaUrl | string | 视频的实际播放地址 |

##### 代码示例

```javascript
import { getMediaUrl } from '@ray-js/lock-sdk';

const result = await getMediaUrl({
  mediaPath: 'xxx',
  mediaBucket: 'xxx'
});

console.log('视频地址:', result.mediaUrl);
```

##### 返回示例

```json
{
  "mediaUrl": "https://xxx"
}
```

##### 错误码

无错误码。

## 开锁方式管理

#### addPassword

##### 功能描述

添加开锁密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码值不能为空
- 当开启特殊开锁方式时，appSend 和 msgPhone 必须有一个
- 门卡与人脸不支持特殊开锁方式配置

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 用户 id |
| name | string | - | 是 | 开锁方式名称 |
| password | string | - | 是 | 密码值 |
| isSpecial | boolean | false | 否 | 是否特殊开锁方式，配置与劫持告警 dp 相关 |
| specialInfo | SpecialUnlockMethodInfo | - | 否 | 特殊开锁方式配置信息 |

###### SpecialUnlockMethodInfo 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| appSend | boolean | - | 否 | 是否支持 App 消息通知 |
| msgPhone | string | - | 否 | 短信通知手机号，有手机号时，表示开启短信通知 |
| verifyCode | string | - | 否 | 手机验证码，在未开启短信通知时开启短信通知，此字段必传 |
| countryCode | string | - | 否 | 短信通知国家码，当开启短信通知时，必传 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| opModeId | number | 开锁方式 id |
| unlockName | string | 开锁方式名称 |

##### 代码示例

```javascript
import { addPassword } from '@ray-js/lock-sdk';

const result = await addPassword({
  userId: 'xxx',
  name: '我的密码',
  password: '123456',
  isSpecial: true,
  specialInfo: {
    appSend: true,
    msgPhone: '1********',
    countryCode: '86'
  }
});

console.log('开锁方式ID:', result.opModeId);
```

##### 返回示例

```json
{
  "opModeId": 123,
  "unlockName": "我的密码"
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1015 | 进入开锁方式超时 |
| 1016 | 进入开锁方式失败 |
| 1017 | 进入开锁方式时重复录入 |
| 1018 | 进入开锁方式时硬件 ID 分配完成 |
| 1019 | 添加密码失败，字段非数字（备用） |
| 1020 | 添加密码失败，密码长度错误 |
| 1021 | 不支持的开锁方式类型 |
| 1022 | 当前正在录入指纹 |
| 1023 | 当前正在绑定门卡 |
| 1024 | 当前正在绑定人脸 |
| 1025 | 密码过于简单 |
| 1026 | 参数错误，如重复的消息序列号 |
| 1054 | 密码值不能为空 |
| 1055 | 手机号验证码必传（特殊开锁方式使用短信通知时，验证码不能为空） |
| 1056 | 国家码必传（特殊开锁方式使用短信通知时，国家码不能为空） |
| 1057 | 不支持短信通知（特殊开锁方式 app 消息通知必须开启） |
| 1058 | 必须开启 App 消息通知或短信通知（特殊开锁方式 app 消息或手机短信必须开启一个） |
#### startAddUnlockMethod

##### 功能描述

开始添加开锁方式。此方法用于开始添加指纹、人脸、卡片等需要录入的开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此方法用于开始添加需要录入的开锁方式（如指纹、人脸、卡片等）
- 添加过程需要通过 onAddUnlockMethod 监听器监听录入进度
- 每个步骤的超时时间默认为 15000 毫秒

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | UnlockMethodType | - | 是 | 开锁方式类型，可能的值：finger（指纹）、face（人脸）、card（卡片）、fingerVein（指静脉）、hand（掌静脉）、eye（眼纹） |
| userId | string | - | 是 | 用户 id |
| timeout | number | 15000 | 否 | 每个步骤的超时时间，单位为毫秒 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| total | number | 总步骤数 |

##### 代码示例

```javascript
import { startAddUnlockMethod, onAddUnlockMethod } from '@ray-js/lock-sdk';

// 监听录入进度
onAddUnlockMethod((event) => {
  if (event.stage === 'step') {
    console.log(`录入进度: ${event.step}/${event.total}`);
  } else if (event.stage === 'success') {
    console.log('录入成功，开锁方式ID:', event.id);
  } else if (event.stage === 'fail') {
    console.error('录入失败:', event.error);
  }
});

// 开始添加指纹
const result = await startAddUnlockMethod({
  type: 'finger',
  userId: 'xxx',
  timeout: 15000
});

console.log('总步骤数:', result.total);
```

##### 返回示例

```json
{
  "total": 3
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1002 | 操作超时 |
| 1014 | 设备不支持该功能（开锁方式类型不支持或设备不支持该开锁方式） |
| 1015 | 进入开锁方式超时 |
| 1016 | 进入开锁方式失败 |
| 1017 | 进入开锁方式时重复录入 |
| 1018 | 进入开锁方式时硬件 ID 分配完成 |
| 1019 | 添加密码失败，字段非数字（备用） |
| 1020 | 添加密码失败，密码长度错误 |
| 1021 | 不支持的开锁方式类型 |
| 1022 | 当前正在录入指纹 |
| 1023 | 当前正在绑定门卡 |
| 1024 | 当前正在绑定人脸 |
| 1025 | 密码过于简单 |
| 1026 | 参数错误，如重复的消息序列号 |
| 1027 | 开始添加开锁方式失败（其他状态） |
#### cancelAddUnlockMethod

##### 功能描述

取消添加开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能在添加开锁方式的过程中调用
- 取消后需要重新开始添加流程

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | UnlockMethodType | - | 是 | 开锁方式类型 |
| userId | string | - | 是 | 用户 id |
| timeout | number | 15000 | 否 | 每个步骤的超时时间，单位为毫秒 |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { cancelAddUnlockMethod } from '@ray-js/lock-sdk';

await cancelAddUnlockMethod({
  type: 'finger',
  userId: 'xxx'
});
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### onAddUnlockMethod

##### 功能描述

注册开锁方式步骤监听器。用于监听添加开锁方式时的录入进度。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要在调用 startAddUnlockMethod 之前注册监听器
- 监听器会收到三种类型的事件：step（录入步骤）、success（录入成功）、fail（录入失败）

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| listener | AddUnlockMethodListener | - | 是 | 监听器函数 |

###### AddUnlockMethodListener 函数参数

监听器函数接收一个事件参数，事件类型如下：

**StepEvent（录入步骤事件）**
| 属性 | 类型 | 说明 |
|------|------|------|
| type | UnlockMethodType | 开锁方式类型 |
| lockUserId | number | 锁端用户 id |
| stage | "step" | 事件阶段，值为 "step" |
| step | number | 当前步骤 |
| total | number | 总步骤 |

**SuccessEvent（录入成功事件）**
| 属性 | 类型 | 说明 |
|------|------|------|
| type | UnlockMethodType | 开锁方式类型 |
| id | number | 开锁方式云端 id |
| name | string | 开锁方式默认名称 |
| stage | "success" | 事件阶段，值为 "success" |

**ErrorEvent（录入失败事件）**
| 属性 | 类型 | 说明 |
|------|------|------|
| type | UnlockMethodType | 开锁方式类型 |
| lockUserId | number | 锁端用户 id |
| stage | "fail" | 事件阶段，值为 "fail" |
| error | ErrorData | 错误信息 |

###### ErrorData 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| errorCode | number | 错误码 |
| errorMsg | string | 错误信息描述 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onAddUnlockMethod, startAddUnlockMethod } from '@ray-js/lock-sdk';

// 注册监听器
onAddUnlockMethod((event) => {
  if (event.stage === 'step') {
    console.log(`录入进度: ${event.step}/${event.total}`);
  } else if (event.stage === 'success') {
    console.log('录入成功，开锁方式ID:', event.id);
  } else if (event.stage === 'fail') {
    console.error('录入失败:', event.error);
  }
});

// 开始添加开锁方式
await startAddUnlockMethod({
  type: 'finger',
  userId: 'xxx'
});
```

##### 返回示例

无返回数据。

##### 错误码

监听器在 `ErrorEvent` 中可能返回的错误码如下：

| 错误码 | 说明 |
|--------|------|
| 1002 | 操作超时 |
| 1015 | 进入开锁方式超时 |
| 1016 | 进入开锁方式失败 |
| 1017 | 进入开锁方式时重复录入 |
| 1018 | 进入开锁方式时硬件 ID 分配完成 |
| 1019 | 添加密码失败，字段非数字（备用） |
| 1020 | 添加密码失败，密码长度错误 |
| 1021 | 不支持的开锁方式类型 |
| 1022 | 当前正在录入指纹 |
| 1023 | 当前正在绑定门卡 |
| 1024 | 当前正在绑定人脸 |
| 1025 | 密码过于简单 |
| 1026 | 参数错误，如重复的消息序列号 |
| 1053 | 同步添加云端开锁方式失败 |
#### offAddUnlockMethod

##### 功能描述

注销开锁方式步骤监听器。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要传入与注册时相同的监听器函数
- 注销后不再接收添加开锁方式的事件

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| listener | AddUnlockMethodListener | - | 是 | 监听器函数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onAddUnlockMethod, offAddUnlockMethod } from '@ray-js/lock-sdk';

const listener = (event) => {
  console.log('事件:', event);
};

// 注册监听器
onAddUnlockMethod(listener);

// 注销监听器
offAddUnlockMethod(listener);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### checkSpecialSupportPhone

##### 功能描述

检查是否支持短信通知。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此方法用于检查设备是否支持短信通知功能
- 如果不支持短信通知，则只能使用 App 消息通知

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示支持短信通知，false 表示不支持。

##### 代码示例

```javascript
import { checkSpecialSupportPhone } from '@ray-js/lock-sdk';

const supportPhone = checkSpecialSupportPhone();

if (supportPhone) {
  console.log('设备支持短信通知');
} else {
  console.log('设备不支持短信通知');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### sendVerifyCode

##### 功能描述

发送手机验证码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 手机号必须是国际格式，如中国大陆手机号为 86-1********
- 验证码用于开启短信通知功能

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| account | string | - | 是 | 待收验证码的手机号，必须是国际格式的手机号，如中国大陆手机号为 86-1******** |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { sendVerifyCode } from '@ray-js/lock-sdk';

await sendVerifyCode({
  account: '86-1********'
});
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### updateUnlockMethod

##### 功能描述

更新开锁方式。仅支持更新开锁方式名称和特殊开锁方式的通知信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 仅支持更新开锁方式名称和特殊开锁方式的通知信息
- 当开启特殊开锁方式时，appSend 和 msgPhone 必须有一个

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| id | number | - | 是 | 开锁方式 id |
| name | string | - | 是 | 开锁方式名称 |
| isSpecial | boolean | false | 否 | 是否特殊开锁方式，配置与劫持告警 dp 相关 |
| specialInfo | SpecialUnlockMethodInfo | - | 否 | 特殊开锁方式配置信息 |

###### SpecialUnlockMethodInfo 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| appSend | boolean | - | 否 | 是否支持 App 消息通知 |
| msgPhone | string | - | 否 | 短信通知手机号，有手机号时，表示开启短信通知 |
| verifyCode | string | - | 否 | 手机验证码，在未开启短信通知时开启短信通知，此字段必传 |
| countryCode | string | - | 否 | 短信通知国家码，当开启短信通知时，必传 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { updateUnlockMethod } from '@ray-js/lock-sdk';

await updateUnlockMethod({
  id: 123,
  name: '新的密码名称',
  isSpecial: true,
  specialInfo: {
    appSend: true,
    msgPhone: '1********',
    countryCode: '86'
  }
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1055 | 手机号验证码必传 |
| 1056 | 国家码必传 |
| 1057 | 不支持短信通知 |
| 1058 | 必须开启 App 消息通知或短信通知 |
#### deleteUnlockMethod

##### 功能描述

删除开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 删除后无法恢复
- 需要提供有效的开锁方式 id

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| id | number | - | 是 | 开锁方式 id |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { deleteUnlockMethod } from '@ray-js/lock-sdk';

await deleteUnlockMethod(123);
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | 不支持删除开锁方式 |
| 1028 | 删除开锁方式失败 |
| 1029 | 删除开锁方式失败（状态码为 2） |
#### checkUnBindUnlockMethods

##### 功能描述

检测是否有未绑定的开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回 true 或 1 表示有未绑定的开锁方式
- 返回 false 或 0 表示没有未绑定的开锁方式

##### 参数

无参数。

##### 返回数据

返回 Promise<boolean>，true 表示有未绑定的开锁方式，false 表示没有。

##### 代码示例

```javascript
import { checkUnBindUnlockMethods } from '@ray-js/lock-sdk';

const hasUnbind = await checkUnBindUnlockMethods();

if (hasUnbind) {
  console.log('有未绑定的开锁方式');
} else {
  console.log('没有未绑定的开锁方式');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### getUnbindUnlockMethods

##### 功能描述

获取未关联开锁方式列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回的列表按开锁方式类型分组
- 每个分组包含该类型下所有未关联的开锁方式

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据为数组，数组项如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | UnlockMethodType | 开锁方式类型 |
| list | UnBindUnlockMethod[] | 未关联的开锁方式列表 |

###### UnBindUnlockMethod 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| unlockId | number | 开锁方式的硬件id |
| unlockName | string | 开锁方式名称 |
| id | number | 开锁方式 id |
| unlockSn | number | 开锁方式序列号 |
| type | UnlockMethodType | 开锁方式类型 |
| dpId | number | 开锁方式对应的 dp id |
| dpCode | string | 开锁方式对应的 dp code |

##### 代码示例

```javascript
import { getUnbindUnlockMethods } from '@ray-js/lock-sdk';

const list = await getUnbindUnlockMethods();

list.forEach(group => {
  console.log('开锁方式类型:', group.type);
  console.log('未关联数量:', group.list.length);
  group.list.forEach(item => {
    console.log('开锁方式名称:', item.unlockName);
  });
});
```

##### 返回示例

```json
[
  {
    "type": "finger",
    "list": [
      {
        "unlockId": 1,
        "unlockName": "指纹1",
        "id": 123,
        "unlockSn": 1,
        "type": "finger",
        "dpId": 1,
        "dpCode": "unlock_fingerprint"
      }
    ]
  }
]
```

##### 错误码

无错误码。
#### getUnlockMethodDetail

##### 功能描述

获取开锁方式详细信息。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要提供有效的开锁方式 id
- 返回的信息包含开锁方式的所有详细信息

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| id | number | - | 是 | 开锁方式 id |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| isBound | boolean | 是否为云端关联的开锁方式 |
| phase | number | 开锁方式状态 |
| dpId | number | 开锁方式对应的 dp id |
| isSpecial | boolean | 是否为特殊开锁方式 |
| unlockName | string | 开锁方式名称 |
| userId | string | 所属用户 id |
| unlockId | number | 开锁方式硬件id |
| lockUserId | number | 锁端用户 id |
| id | string | 开锁方式 id |
| userType | number | 用户类型 |
| notifyInfo | NotifyInfo | 开锁消息通知配置，当 isSpecial 为 true 时，值才有效 |

###### NotifyInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| appSend | boolean | 是否开启 App 消息通知 |
| msgPhone | string | 短信通知手机号，有手机号时，表示开启短信通知 |
| countryCode | string | 短信通知国家码 |

##### 代码示例

```javascript
import { getUnlockMethodDetail } from '@ray-js/lock-sdk';

const detail = await getUnlockMethodDetail(123);

console.log('开锁方式名称:', detail.unlockName);
console.log('是否特殊开锁方式:', detail.isSpecial);
```

##### 返回示例

```json
{
  "isBound": true,
  "phase": 1,
  "dpId": 1,
  "isSpecial": true,
  "unlockName": "我的密码",
  "userId": "xxx",
  "unlockId": 1,
  "lockUserId": 1,
  "id": "123",
  "userType": 10,
  "notifyInfo": {
    "appSend": true,
    "msgPhone": "1********",
    "countryCode": "86"
  }
}
```

##### 错误码

无错误码。
#### syncUnlockMethod

##### 功能描述

同步开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 用于同步设备端的开锁方式到云端
- 同步过程可能需要一些时间

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { syncUnlockMethod } from '@ray-js/lock-sdk';

await syncUnlockMethod();
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### bindUnlockMethod

##### 功能描述

绑定未关联开锁方式到用户。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能绑定未关联的开锁方式
- unlockList 中的开锁方式类型和硬件 id 需要正确配置

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 用户 id |
| unlockList | UnlockMethodItem[] | - | 是 | 待关联的开锁方式列表 |

###### UnlockMethodItem 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | UnlockMethodType | - | 是 | 开锁方式类型 |
| unlockId | number | - | 是 | 开锁方式的硬件id |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { bindUnlockMethod } from '@ray-js/lock-sdk';

await bindUnlockMethod({
  userId: 'xxx',
  unlockList: [
    {
      type: 'finger',
      unlockId: 1
    },
    {
      type: 'password',
      unlockId: 2
    }
  ]
});
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### bindUnlockMethodFromLog

##### 功能描述

绑定开锁记录中未关联开锁方式到用户。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能绑定开锁记录中未关联的开锁方式
- unlockList 中的开锁方式类型和硬件 id 需要正确配置

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| userId | string | - | 是 | 用户 id |
| unlockList | UnlockMethodItem[] | - | 是 | 待关联的开锁方式列表 |

###### UnlockMethodItem 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | UnlockMethodType | - | 是 | 开锁方式类型 |
| unlockId | number | - | 是 | 开锁方式的硬件id |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { bindUnlockMethodFromLog } from '@ray-js/lock-sdk';

await bindUnlockMethodFromLog({
  userId: 'xxx',
  unlockList: [
    {
      type: 'finger',
      unlockId: 1
    },
    {
      type: 'password',
      unlockId: 2
    }
  ]
});
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### unbindUnlockMethod

##### 功能描述

解绑用户的开锁方式。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能解绑云端关联的开锁方式
- 解绑后开锁方式将变为未关联状态

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| id | number | - | 是 | 开锁方式 id |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { unbindUnlockMethod } from '@ray-js/lock-sdk';

await unbindUnlockMethod(123);
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1050 | 开锁方式未关联，无法解绑 |

## 临时密码管理

#### createTempClear

##### 功能描述

生成清除密码。可支持清除所有或某个限时密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码名称长度不能超过20个字符
- 当 clearAll 为 false 时，unlockBindingId 必填

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| name | string | - | 否 | 密码名称，长度不能超过20个字符 |
| unlockBindingId | string | - | 否 | 解锁绑定 ID，当 clearAll 为 false 时必填 |
| clearAll | boolean | - | 是 | 是否清除所有密码，true 表示清除所有，false 表示清除单个 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 临时密码类型，值为 "clear" 或 "clearOne" |
| name | string | 密码名称 |
| password | string | 密码 |
| unlockBindingId | string | 解锁绑定 ID |
| effectiveConfig | EffectiveConfig | 时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |

##### 代码示例

```javascript
import { createTempClear } from '@ray-js/lock-sdk';

// 清除所有限时密码
const result1 = await createTempClear({
  name: '清除所有密码',
  clearAll: true
});

// 清除单个限时密码
const result2 = await createTempClear({
  name: '清除单个密码',
  unlockBindingId: 'xxx',
  clearAll: false
});
```

##### 返回示例

```json
{
  "type": "clear",
  "name": "清除所有密码",
  "password": "123456",
  "unlockBindingId": "xxx",
  "effectiveConfig": {
    "effectiveDate": 0,
    "expiredDate": 0
  }
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1031 | 密码名称长度超过20个字符 |
| 1044 | 当 clearAll 为 false 时，unlockBindingId 必填 |
#### createTempCustom

##### 功能描述

创建自定义临时密码，支持设置密码内容、名称和时效配置。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码内容必须是数字
- 密码名称长度不能超过20个字符
- 时效配置需要正确设置生效和失效时间

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| password | string | - | 是 | 密码内容，必须是数字 |
| name | string | - | 否 | 密码名称，长度不能超过20个字符 |
| effective | EffectiveConfig | - | 是 | 密码时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| effectiveDate | number | - | 是 | 生效日期，单位为秒 |
| expiredDate | number | - | 是 | 失效日期，单位为秒 |
| repeat | "none" \| "week" | "none" | 否 | 重复类型，目前支持 none 和 week |
| weeks | Week | - | 否 | 周重复配置，仅当 repeat 为 week 时生效 |
| effectiveTime | number | - | 否 | 生效时间，单位分钟，如生效时间为12:00，则值为 720 |
| expiredTime | number | - | 否 | 失效时间，单位分钟，如失效时间为23:00，则值为 1380 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 临时密码类型，值为 "custom" |
| name | string | 密码名称 |
| password | string | 密码 |
| unlockBindingId | string | 解锁绑定 ID |
| effectiveConfig | EffectiveConfig | 时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |
| repeat | "none" \| "week" | 重复类型 |
| weeks | Week | 周重复配置 |
| effectiveTime | number | 生效时间，单位分钟 |
| expiredTime | number | 失效时间，单位分钟 |

##### 代码示例

```javascript
import { createTempCustom } from '@ray-js/lock-sdk';

// 创建永久有效的自定义密码
const result = await createTempCustom({
  password: '123456',
  name: '访客密码',
  effective: {
    effectiveDate: Math.floor(Date.now() / 1000),
    expiredDate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    repeat: 'none'
  }
});

console.log('密码:', result.password);
console.log('解锁绑定ID:', result.unlockBindingId);
```

##### 返回示例

```json
{
  "type": "custom",
  "name": "访客密码",
  "password": "123456",
  "unlockBindingId": "xxx",
  "effectiveConfig": {
    "effectiveDate": 1234567890,
    "expiredDate": 1235173890,
    "repeat": "none"
  }
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1030 | 密码格式不正确，必须是数字 |
| 1031 | 密码名称长度超过20个字符 |
| 1037 | 用户密码已存在 |
| 1038 | 锁端密码名称重复 |
| 1039 | 开始和结束日期不正确 |
| 1040 | 记录不存在 |
| 1041 | 密码同步失败（状态码为2） |
| 1042 | 密码同步失败（其他状态码） |
| 1043 | 密码创建失败，未返回密码编号 |
#### createTempDynamic

##### 功能描述

创建动态密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 动态密码有效期为5分钟
- 动态密码无名称和解锁绑定 ID

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 临时密码类型，值为 "dynamic" |
| name | string | 密码名称，动态密码为空字符串 |
| password | string | 密码 |
| unlockBindingId | string | 解锁绑定 ID，动态密码为空字符串 |
| effectiveConfig | EffectiveConfig | 时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒，动态密码生效时间为当前时间 |
| expiredDate | number | 失效日期，单位为秒，动态密码有效期为5分钟 |

##### 代码示例

```javascript
import { createTempDynamic } from '@ray-js/lock-sdk';

const result = await createTempDynamic();

console.log('动态密码:', result.password);
console.log('有效期:', result.effectiveConfig.expiredDate - result.effectiveConfig.effectiveDate, '秒');
```

##### 返回示例

```json
{
  "type": "dynamic",
  "name": "",
  "password": "123456",
  "unlockBindingId": "",
  "effectiveConfig": {
    "effectiveDate": 1234567890,
    "expiredDate": 1234568190
  }
}
```

##### 错误码

无错误码。
#### createTempLimit

##### 功能描述

创建临时限时密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码名称长度不能超过20个字符
- 生效时间必须小于失效时间

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| name | string | - | 是 | 密码名称，长度不能超过20个字符 |
| effectiveTime | number | - | 是 | 密码生效开始时间，单位为秒 |
| invalidTime | number | - | 是 | 密码生效结束时间，单位为秒 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 临时密码类型，值为 "limit" |
| name | string | 密码名称 |
| password | string | 密码 |
| unlockBindingId | string | 解锁绑定 ID |
| effectiveConfig | EffectiveConfig | 时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |

##### 代码示例

```javascript
import { createTempLimit } from '@ray-js/lock-sdk';

const result = await createTempLimit({
  name: '限时密码',
  effectiveTime: Math.floor(Date.now() / 1000),
  invalidTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
});

console.log('密码:', result.password);
```

##### 返回示例

```json
{
  "type": "limit",
  "name": "限时密码",
  "password": "123456",
  "unlockBindingId": "xxx",
  "effectiveConfig": {
    "effectiveDate": 1234567890,
    "expiredDate": 1235173890
  }
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1010 | 生效时间必须小于失效时间 |
| 1031 | 密码名称长度超过20个字符 |
#### createTempOnce

##### 功能描述

创建一次性密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码名称长度不能超过20个字符
- 一次性密码使用后即失效

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| name | string | - | 否 | 密码名称，长度不能超过20个字符 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| type | string | 临时密码类型，值为 "once" |
| name | string | 密码名称 |
| password | string | 密码 |
| unlockBindingId | string | 解锁绑定 ID |
| effectiveConfig | EffectiveConfig | 时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |

##### 代码示例

```javascript
import { createTempOnce } from '@ray-js/lock-sdk';

const result = await createTempOnce({
  name: '一次性密码'
});

console.log('密码:', result.password);
```

##### 返回示例

```json
{
  "type": "once",
  "name": "一次性密码",
  "password": "123456",
  "unlockBindingId": "xxx",
  "effectiveConfig": {
    "effectiveDate": 0,
    "expiredDate": 0
  }
}
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1031 | 密码名称长度超过20个字符 |
#### createTempOffline

##### 功能描述

创建离线密码，适用于 WiFi 拍照锁设备。支持创建一次性密码和不限次数密码两种类型。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 一次性密码（isOnce=true）无需配置时效
- 不限次数密码（isOnce=false）需要配置有效的时效参数
- 名称长度不能超过 20 个字符

##### 参数

| 属性      | 类型            | 默认值 | 必填 | 说明                                          |
| --------- | --------------- | ------ | ---- | --------------------------------------------- |
| name      | string          | -      | 是   | 密码名称                                      |
| effective | EffectiveConfig | -      | 是   | 时效配置（一次性密码时可忽略）                |
| isOnce    | boolean         | -      | 是   | 是否为一次性密码，true-一次性，false-不限次数 |

**EffectiveConfig 结构**

| 属性          | 类型   | 默认值 | 必填 | 说明               |
| ------------- | ------ | ------ | ---- | ------------------ |
| effectiveDate | number | -      | 是   | 生效日期，单位为秒 |
| expiredDate   | number | -      | 是   | 失效日期，单位为秒 |

##### 返回数据

返回 `Promise<OfflineTempResult>`

**OfflineTempResult 结构**

| 属性            | 类型            | 说明                                         |
| --------------- | --------------- | -------------------------------------------- |
| type            | string          | 密码类型：'once' 一次性，'multiple' 不限次数 |
| name            | string          | 密码名称                                     |
| password        | string          | 密码内容                                     |
| unlockBindingId | string          | 解锁绑定 ID                                  |
| pwdId           | string          | 密码 ID                                      |
| effectiveConfig | EffectiveConfig | 时效配置                                     |

##### 代码示例

```javascript
import { createTempOffline } from "@ray-js/lock-sdk";

// 创建一次性离线密码
const createOncePassword = async () => {
  try {
    const result = await createTempOffline({
      name: "一次性密码",
      isOnce: true,
      effective: {
        effectiveDate: 0,
        expiredDate: 0,
      },
    });
    console.log("一次性密码:", result.password);
  } catch (error) {
    console.error("创建失败:", error);
  }
};

// 创建不限次数离线密码
const createMultiplePassword = async () => {
  try {
    const result = await createTempOffline({
      name: "不限次数密码",
      isOnce: false,
      effective: {
        effectiveDate: Math.floor(Date.now() / 1000),
        expiredDate: Math.floor(Date.now() / 1000) + 86400 * 7,
      },
    });
    console.log("不限次数密码:", result.password);
  } catch (error) {
    console.error("创建失败:", error);
  }
};
```

##### 返回示例

```json
{
  "type": "once",
  "name": "一次性密码",
  "password": "12345678",
  "unlockBindingId": "abc123",
  "pwdId": "pwd123",
  "effectiveConfig": {
    "effectiveDate": 0,
    "expiredDate": 0
  }
}
```

##### 错误码

| 错误码 | 说明                             |
| ------ | -------------------------------- |
| 1010   | 生效起始时间不能大于生效结束时间 |
| 1031   | 密码名称长度不能大于20个字符     |
#### getTempEffectiveList

##### 功能描述

获取有效的临时密码列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回的密码列表包含所有有效状态的密码
- 密码状态包括：生效中、待生效、已冻结、冻结中、同步中、待删除

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据为数组，数组项如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| unlockBindingId | string | 解锁绑定 ID |
| name | string | 密码名称 |
| status | string | 密码状态，可能的值：effective（生效中）、toBeEffective（待生效）、frozen（已冻结）、freezing（冻结中）、synchronizing（同步中）、toBeDeleted（待删除） |
| type | string | 密码类型，可能的值：custom（自定义密码）、once（一次性密码）、limit（限时密码）、clear（清除密码）、clearOne（清除单个密码） |
| sn | number | 密码 sn |
| hasClearPwd | boolean | 当前密码是否被标记被清除 |
| effectiveConfig | EffectiveConfig | 时效配置 |
| clearInfo | ClearInfo | 清除单个密码的信息，密码类型为 "clearOne" 时有效 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |
| repeat | "none" \| "week" | 重复类型 |
| weeks | Week | 周重复配置 |
| effectiveTime | number | 生效时间，单位分钟 |
| expiredTime | number | 失效时间，单位分钟 |

###### ClearInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| name | string | 单个密码名称 |
| effectiveConfig | EffectiveConfig | 单个密码生效配置 |

##### 代码示例

```javascript
import { getTempEffectiveList } from '@ray-js/lock-sdk';

const list = await getTempEffectiveList();

list.forEach(item => {
  console.log('密码名称:', item.name);
  console.log('密码状态:', item.status);
  console.log('密码类型:', item.type);
});
```

##### 返回示例

```json
[
  {
    "unlockBindingId": "xxx",
    "name": "访客密码",
    "status": "effective",
    "type": "custom",
    "sn": 1,
    "hasClearPwd": false,
    "effectiveConfig": {
      "effectiveDate": 1234567890,
      "expiredDate": 1235173890,
      "repeat": "none"
    }
  }
]
```

##### 错误码

无错误码。
#### getTempInvalidList

##### 功能描述

获取无效的临时密码列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 支持分页查询
- 默认每页记录数为 200

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| page | number | 1 | 否 | 分页页码 |
| pageSize | number | 200 | 否 | 每页记录数 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| list | InvalidPasswordItem[] | 无效密码列表 |
| hasMore | boolean | 是否还有更多数据 |
| total | number | 总记录数 |

###### InvalidPasswordItem 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| unlockBindingId | string | 解锁绑定 ID |
| name | string | 密码名称 |
| status | string | 密码状态，值为 "expired"（已失效） |
| invalidReason | string | 失败原因，可能的值：synchronizationFailed（同步失败）、passwordFull（密码已满）、deleted（已删除） |
| type | string | 密码类型，可能的值：custom（自定义密码）、once（一次性密码）、limit（限时密码）、clear（清除密码）、clearOne（清除单个密码） |
| sn | number | 密码 sn |
| hasClearPwd | boolean | 当前密码是否被标记被清除 |
| effectiveConfig | EffectiveConfig | 时效配置 |
| clearInfo | ClearInfo | 清除单个密码的信息，密码类型为 "clearOne" 时有效 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| effectiveDate | number | 生效日期，单位为秒 |
| expiredDate | number | 失效日期，单位为秒 |
| repeat | "none" \| "week" | 重复类型 |
| weeks | Week | 周重复配置 |
| effectiveTime | number | 生效时间，单位分钟 |
| expiredTime | number | 失效时间，单位分钟 |

###### ClearInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| name | string | 单个密码名称 |
| effectiveConfig | EffectiveConfig | 单个密码生效配置 |

##### 代码示例

```javascript
import { getTempInvalidList } from '@ray-js/lock-sdk';

const result = await getTempInvalidList({
  page: 1,
  pageSize: 50
});

console.log('无效密码数量:', result.total);
result.list.forEach(item => {
  console.log('密码名称:', item.name);
  console.log('失败原因:', item.invalidReason);
});
```

##### 返回示例

```json
{
  "list": [
    {
      "unlockBindingId": "xxx",
      "name": "过期密码",
      "status": "expired",
      "invalidReason": "deleted",
      "type": "limit",
      "sn": 1,
      "hasClearPwd": false,
      "effectiveConfig": {
        "effectiveDate": 1234567890,
        "expiredDate": 1235173890
      }
    }
  ],
  "hasMore": false,
  "total": 1
}
```

##### 错误码

无错误码。
#### getTempOfflineEffectiveList

##### 功能描述

获取离线有效密码列表，适用于 WiFi 拍照锁设备。根据密码类型返回对应的有效密码列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 需要指定密码类型参数

##### 参数

| 属性        | 类型                | 默认值 | 必填 | 说明                                                                                             |
| ----------- | ------------------- | ------ | ---- | ------------------------------------------------------------------------------------------------ |
| pwdTypeCode | OfflinePasswordType | -      | 是   | 密码类型：once-一次性密码，multiple-不限次数密码，clear_one-清除单个密码，clear_all-清除所有密码 |

##### 返回数据

返回 `Promise<OfflinePasswordItem[]>`

**OfflinePasswordItem 结构**

| 属性           | 类型                                               | 说明                                                                                             |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| email          | string                                             | 邮箱                                                                                             |
| gmtCreate      | number                                             | 创建时间                                                                                         |
| gmtExpired     | number                                             | 失效时间                                                                                         |
| gmtStart       | number                                             | 生效时间                                                                                         |
| hasClearPwd    | boolean                                            | 是否有清除码                                                                                     |
| mobile         | string                                             | 手机号                                                                                           |
| pwd            | string                                             | 密码                                                                                             |
| pwdId          | string                                             | 密码 ID                                                                                          |
| pwdName        | string                                             | 密码名称                                                                                         |
| pwdTypeCode    | "once" \| "multiple" \| "clear_one" \| "clear_all" | 密码类型：once-一次性密码，multiple-不限次数密码，clear_one-清除单个密码，clear_all-清除所有密码 |
| revokedPwdName | string                                             | 清空密码名称                                                                                     |
| status         | number                                             | 状态                                                                                             |
| timeZoneId     | string                                             | 时区 ID                                                                                          |

##### 代码示例

```javascript
import { getTempOfflineEffectiveList } from "@ray-js/lock-sdk";

const fetchOfflineEffectiveList = async () => {
  try {
    // 获取离线不限次数密码的有效列表
    const list = await getTempOfflineEffectiveList("multiple");

    console.log("有效离线密码数量:", list.length);

    list.forEach((item) => {
      console.log(`密码名称: ${item.pwdName}, 类型: ${item.pwdTypeCode}`);
    });
  } catch (error) {
    console.error("获取失败:", error);
  }
};
```

##### 返回示例

```json
[
  {
    "email": "",
    "gmtCreate": 1704326400,
    "gmtExpired": 1704931200,
    "gmtStart": 1704326400,
    "hasClearPwd": false,
    "mobile": "",
    "pwd": "123456",
    "pwdId": "offline123",
    "pwdName": "离线访客密码",
    "pwdTypeCode": "multiple",
    "revokedPwdName": "",
    "status": 1,
    "timeZoneId": "Asia/Shanghai"
  }
]
```

##### 错误码

| 错误码 | 说明       |
| ------ | ---------- |
| 1001   | 设备已离线 |
#### getTempOfflineInvalidList

##### 功能描述

获取离线失效密码列表，适用于 WiFi 拍照锁设备。根据密码类型返回对应的失效密码列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 需要指定密码类型参数

##### 参数

| 属性        | 类型                | 默认值 | 必填 | 说明                                                                                                |
| ----------- | ------------------- | ------ | ---- | --------------------------------------------------------------------------------------------------- |
| pwdTypeCode | OfflinePasswordType | -      | 是   | 密码类型：once-一次性密码，multiple-不限次数密码，clear_one-清除单个密码，clear_all-清除所有密码 |

##### 返回数据

返回 `Promise<OfflinePasswordItem[]>`

**OfflinePasswordItem 结构**

| 属性           | 类型                                               | 说明                                                                                                |
| -------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| email          | string                                             | 邮箱                                                                                                |
| gmtExpired     | number                                             | 失效时间                                                                                            |
| gmtStart       | number                                             | 生效时间                                                                                            |
| hasClearPwd    | boolean                                            | 是否有清除码                                                                                        |
| mobile         | string                                             | 手机号                                                                                              |
| pwd            | string                                             | 密码                                                                                                |
| pwdId          | string                                             | 密码 ID                                                                                             |
| pwdName        | string                                             | 密码名称                                                                                            |
| pwdTypeCode    | "once" \| "multiple" \| "clear_one" \| "clear_all" | 密码类型：once-一次性密码，multiple-不限次数密码，clear_one-清除单个密码，clear_all-清除所有密码 |
| revokedPwdName | string                                             | 清空密码名称                                                                                        |
| status         | number                                             | 状态                                                                                                |
| timeZoneId     | string                                             | 时区 ID                                                                                             |

##### 代码示例

```javascript
import { getTempOfflineInvalidList } from "@ray-js/lock-sdk";

const fetchOfflineInvalidList = async () => {
  try {
    // 获取离线不限次数密码的失效列表
    const list = await getTempOfflineInvalidList("multiple");

    console.log("失效离线密码数量:", list.length);

    list.forEach((item) => {
      console.log(`密码名称: ${item.pwdName}, 类型: ${item.pwdTypeCode}`);
    });
  } catch (error) {
    console.error("获取失败:", error);
  }
};
```

##### 返回示例

```json
[
  {
    "email": "",
    "gmtCreate": 1704326400,
    "gmtExpired": 1704931200,
    "gmtStart": 1704326400,
    "hasClearPwd": false,
    "mobile": "",
    "pwd": "654321",
    "pwdId": "offline456",
    "pwdName": "已过期密码",
    "pwdTypeCode": "multiple",
    "revokedPwdName": "",
    "status": 0,
    "timeZoneId": "Asia/Shanghai"
  }
]
```

##### 错误码

| 错误码 | 说明       |
| ------ | ---------- |
| 1001   | 设备已离线 |
#### getTempOnlineUnlimitedList

##### 功能描述

获取在线不限次数密码列表，适用于 WiFi 拍照锁设备。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 返回数据中包含 `effectiveConfig` 字段用于时效配置

##### 参数

无参数

##### 返回数据

返回 `Promise<OnlinePasswordItem[]>`

**OnlinePasswordItem 结构**

| 属性            | 类型            | 说明                                                                                                    |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| effective       | number          | 生效状态码                                                                                              |
| unlockBindingId | string          | 解锁绑定 ID                                                                                             |
| effectiveTime   | number          | 生效时间戳                                                                                              |
| invalidTime     | number          | 失效时间戳                                                                                              |
| name            | string          | 密码名称                                                                                                |
| phase           | number          | 阶段                                                                                                    |
| scheduleDetails | EffectiveConfig | 时间安排详情（原始数据）                                                                                |
| effectiveConfig | EffectiveConfig | 时效配置（解析后）                                                                                      |
| status          | string          | 状态：'effective' 生效中，'synchronizing' 同步中，'expired' 已过期，'disabled' 已禁用，'invalid' 已失效 |

**EffectiveConfig 结构**

| 属性          | 类型             | 说明                                   |
| ------------- | ---------------- | -------------------------------------- |
| effectiveDate | number           | 生效日期（Unix 时间戳，单位秒）        |
| expiredDate   | number           | 失效日期（Unix 时间戳，单位秒）        |
| repeat        | "none" \| "week" | 重复类型，默认 none                    |
| weeks         | Week             | 周重复配置，仅当 repeat 为 week 时生效 |
| effectiveTime | number           | 生效时间（分钟），如 12:00 则为 720    |
| expiredTime   | number           | 失效时间（分钟），如 23:00 则为 1380   |

##### 代码示例

```javascript
import { getTempOnlineUnlimitedList } from "@ray-js/lock-sdk";

const fetchPasswordList = async () => {
  try {
    const list = await getTempOnlineUnlimitedList();

    console.log("密码数量:", list.length);

    // 遍历密码列表
    list.forEach((item) => {
      console.log(`密码名称: ${item.name}, 状态: ${item.status}`);
    });
  } catch (error) {
    console.error("获取失败:", error);
  }
};
```

##### 返回示例

```json
[
  {
    "effective": 1,
    "unlockBindingId": "abc123",
    "effectiveTime": 1704326400,
    "invalidTime": 1704931200,
    "name": "访客密码",
    "phase": 1,
    "status": "effective",
    "effectiveConfig": {
      "effectiveDate": 1704326400,
      "expiredDate": 1704931200,
      "repeat": "none"
    },
    "scheduleDetails": {
      "effectiveDate": 1704326400,
      "expiredDate": 1704931200,
      "repeat": "none"
    }
  }
]
```

##### 错误码

| 错误码 | 说明       |
| ------ | ---------- |
| 1001   | 设备已离线 |
#### removeTempCustom

##### 功能描述

删除自定义密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能删除自定义密码
- 删除后密码将无法恢复

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| unlockBindingId | string | - | 是 | 解锁绑定 ID |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { removeTempCustom } from '@ray-js/lock-sdk';

await removeTempCustom({
  unlockBindingId: 'xxx'
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1040 | 记录不存在 |
#### removeTempOnlineUnlimited

##### 功能描述

删除在线不限次数密码，适用于 WiFi 拍照锁设备。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 删除后密码将立即失效

##### 参数

| 属性 | 类型   | 默认值 | 必填 | 说明     |
| ---- | ------ | ------ | ---- | -------- |
| id   | string | -      | 是   | 密码 ID  |

##### 返回数据

返回 `Promise<void>`

##### 代码示例

```javascript
import { removeTempOnlineUnlimited } from '@ray-js/lock-sdk';

const deletePassword = async (pwdId) => {
  try {
    await removeTempOnlineUnlimited(pwdId);
    console.log('删除成功');
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 调用示例
deletePassword('pwd123456');
```

##### 返回示例

无返回数据

##### 错误码

| 错误码 | 说明               |
| ------ | ------------------ |
| 1040   | 临时密码 ID 不存在 |
#### renameTemp

##### 功能描述

重命名密码名称。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码名称长度不能超过20个字符
- 只能重命名有效的临时密码

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| unlockBindingId | string | - | 是 | 解锁绑定 ID |
| name | string | - | 是 | 新的密码名称，长度不能超过20个字符 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { renameTemp } from '@ray-js/lock-sdk';

await renameTemp({
  unlockBindingId: 'xxx',
  name: '新的密码名称'
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1051 | 密码不存在 |
#### saveTempOnlineUnlimited

##### 功能描述

保存在线不限次数密码，适用于 WiFi 拍照锁设备。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.4`

##### 注意事项

- 仅适用于 WiFi 拍照锁设备
- 密码仅支持数字格式
- 名称长度不能超过 20 个字符
- 需要配置有效的时效参数

##### 参数

| 属性        | 类型            | 默认值 | 必填 | 说明               |
| ----------- | --------------- | ------ | ---- | ------------------ |
| password    | string          | -      | 是   | 密码内容，仅支持数字 |
| name        | string          | -      | 是   | 密码名称           |
| effective   | EffectiveConfig | -      | 是   | 时效配置           |
| phone       | string          | -      | 否   | 手机号码           |
| countryCode | string          | -      | 否   | 国家码             |

**EffectiveConfig 结构**

| 属性          | 类型                | 默认值 | 必填 | 说明                               |
| ------------- | ------------------- | ------ | ---- | ---------------------------------- |
| effectiveDate | number              | -      | 是   | 生效日期，单位为秒                 |
| expiredDate   | number              | -      | 是   | 失效日期，单位为秒                 |
| repeat        | 'none' \| 'week'    | 'none' | 否   | 重复类型                           |
| weeks         | Week                | -      | 否   | 周重复配置，仅当 repeat 为 week 时生效 |
| effectiveTime | number              | 0      | 否   | 生效时间，单位分钟                 |
| expiredTime   | number              | 1439   | 否   | 失效时间，单位分钟                 |

##### 返回数据

返回 `Promise<CreateOnlineUnlimitedResult>`

**CreateOnlineUnlimitedResult 结构**

| 属性            | 类型            | 说明           |
| --------------- | --------------- | -------------- |
| type            | string          | 密码类型，固定为 'custom' |
| name            | string          | 密码名称       |
| pwdId           | string          | 密码 ID        |
| effectiveConfig | EffectiveConfig | 时效配置       |

##### 代码示例

```javascript
import { saveTempOnlineUnlimited } from '@ray-js/lock-sdk';

const createPassword = async () => {
  try {
    const result = await saveTempOnlineUnlimited({
      password: '123456',
      name: '访客密码',
      effective: {
        effectiveDate: Math.floor(Date.now() / 1000),
        expiredDate: Math.floor(Date.now() / 1000) + 86400 * 7, // 7天后过期
        repeat: 'none',
      },
    });
    console.log('创建成功:', result);
  } catch (error) {
    console.error('创建失败:', error);
  }
};
```

##### 返回示例

```json
{
  "type": "custom",
  "name": "访客密码",
  "pwdId": "123456789",
  "effectiveConfig": {
    "effectiveDate": 1704326400,
    "expiredDate": 1704931200
  }
}
```

##### 错误码

| 错误码 | 说明                       |
| ------ | -------------------------- |
| 1010   | 生效起始时间不能大于生效结束时间 |
| 1030   | 仅支持数字密码             |
| 1031   | 密码名称长度不能大于20个字符 |
| 1032   | 未配置时效                 |
| 1033   | 未配置时效生效日期         |
| 1034   | 未配置时效失效日期         |
#### freezeTemp

##### 功能描述

冻结临时密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 冻结后的密码将无法使用
- 只能冻结有效的临时密码

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| unlockBindingId | string | - | 是 | 解锁绑定 ID |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { freezeTemp } from '@ray-js/lock-sdk';

await freezeTemp({
  unlockBindingId: 'xxx'
});
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1051 | 密码不存在 |
#### unfreezeTemp

##### 功能描述

解冻临时密码。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 只能解冻已冻结的临时密码
- 解冻后的密码将恢复使用

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| unlockBindingId | string | - | 是 | 解锁绑定 ID |

##### 返回数据

返回 Promise<boolean>，成功返回 true。

##### 代码示例

```javascript
import { unfreezeTemp } from '@ray-js/lock-sdk';

await unfreezeTemp({
  unlockBindingId: 'xxx'
});
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1051 | 密码不存在 |
#### updateTempCustom

##### 功能描述

更新自定义临时密码的名称和时效配置。注意，当前只支持更新名称和时效配置，且只支持走云端更新。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 密码名称长度不能超过20个字符
- 只支持更新名称和时效配置
- 只支持走云端更新

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| unlockBindingId | string | - | 是 | 密码 id |
| name | string | - | 是 | 密码名称，长度不能超过20个字符 |
| effective | EffectiveConfig | - | 是 | 密码时效配置 |

###### EffectiveConfig 对象结构

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| effectiveDate | number | - | 是 | 生效日期，单位为秒 |
| expiredDate | number | - | 是 | 失效日期，单位为秒 |
| repeat | "none" \| "week" | "none" | 否 | 重复类型，目前支持 none 和 week |
| weeks | Week | - | 否 | 周重复配置，仅当 repeat 为 week 时生效 |
| effectiveTime | number | - | 否 | 生效时间，单位分钟，如生效时间为12:00，则值为 720 |
| expiredTime | number | - | 否 | 失效时间，单位分钟，如失效时间为23:00，则值为 1380 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { updateTempCustom } from '@ray-js/lock-sdk';

await updateTempCustom({
  unlockBindingId: 'xxx',
  name: '新的密码名称',
  effective: {
    effectiveDate: Math.floor(Date.now() / 1000),
    expiredDate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    repeat: 'none'
  }
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1031 | 密码名称长度超过20个字符 |
| 1039 | 开始和结束日期不正确 |
| 1040 | 记录不存在 |
#### clearTempInvalidList

##### 功能描述

清空无效的临时密码列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 清空后无法恢复
- 只清空无效的密码列表，不影响有效的密码

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { clearTempInvalidList } from '@ray-js/lock-sdk';

await clearTempInvalidList();
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。

## 日志管理

#### getLogs

##### 功能描述

获取日志记录列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 支持分页查询
- 默认每页数量为 50
- 返回开锁和关锁记录

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| page | number | 1 | 否 | 页码 |
| pageSize | number | 50 | 否 | 每页数量 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| list | LogData[] | 日志列表 |
| hasMore | boolean | 是否还有更多数据 |
| total | number | 总记录数 |

###### LogData 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| logId | string | 日志 id |
| time | number | 日志生成时间戳，单位毫秒 |
| currentUser | boolean | 是否当前用户 |
| type | LogType | 日志类型，可能的值：alarm_record（告警日志）、close_record（关锁日志）、unlock_record（开锁日志）、operation（操作类日志）、local_operation（设备本地操作日志）、dev_bind（设备绑定日志） |
| userId | string | 与记录相关的用户 id |
| dpId | number | 相关dp id |
| dpCode | string | 相关 dp code |
| data | any | 记录对应的数据 |
| userName | string | 与记录相关的用户昵称 |
| bindable | boolean | 是否未绑定，当 type 为 unlock_record 时值有意义 |
| unlockName | string | 开锁方式的名称，当 type 为 unlock_record 时，值有意义 |
| mediaInfo | MediaInfo[] | 日志对应的消息图片或视频 |
| unionUnlockInfo | UnionUnlockInfo[] | 组合开锁记录，当 type 为 unlock_record 时，可能有值 |
| closeValue | CloseValue | 关锁记录值，当 type 为 close_record 时有值 |
| localRecord | LocalOperateData | 设备本地日志，当 type 为 local_operation 时，有值 |
| isHijack | boolean | 是否为劫持告警 |
| unlockMethod | UnlockMethodType | 开锁方式类型，当 type 为 unlock_record 时，值有意义 |

###### MediaInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| mediaPath | string | 媒体路径 |
| fileKey | string | 图片 key |
| fileUrl | string | 图片 url |
| mediaBucket | string | 媒体桶 |
| mediaKey | string | 媒体 key |

###### UnionUnlockInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |
| userName | string | 用户名称 |
| unlockName | string | 开锁方式名称 |
| sn | number | 序列号 |
| type | UnlockMethodType | 开锁方式类型，可能的值：finger（指纹）、face（人脸）、password（密码）、card（卡片）、fingerVein（指静脉）、hand（掌静脉）、eye（虹膜） |

###### CloseValue 类型说明

关锁记录值，可能的值：
- UNDEFINED: 未定义方式 关锁
- VOICE_REMOTE: 远程语音 关锁
- APP_REMOTE: 远程 关锁
- AUTO: 自动 关锁
- LOCAL_MANUAL: 本地手动 关锁
- FITTINGS: 门锁配件 关锁
- APP: 使用 手机蓝牙 关锁
- GEO_FENCE: 使用 地理围栏 关锁

###### LocalOperateData 对象结构

设备本地操作记录，根据 category 字段的不同，可能为以下类型之一：

**LocalUnlockMethodData（开锁方式管理记录）**

| 属性 | 类型 | 说明 |
|------|------|------|
| category | number | 操作分类，0 表示添加开锁方式，1 表示删除开锁方式，2 表示修改开锁方式 |
| userType | number | 操作人类型 |
| userId | number | 操作人 id |
| toUserType | number | 被操作人类型 |
| toUserId | number | 被操作人 id |
| unlockMethod | UnlockMethodType \| "remoteControl" | 开锁方式类型 |
| unlockId | number | 开锁方式 id |
| isRemoveAll | boolean | 是否为删除所有开锁方式 |

**LocalAddUserData（用户管理记录）**

| 属性 | 类型 | 说明 |
|------|------|------|
| category | number | 操作分类，16 表示添加用户，17 表示删除用户 |
| userType | number | 操作人类型 |
| userId | number | 操作人 id |
| toUserType | number | 被操作人类型 |
| toUserId | number | 被操作人 id |

**LocalSettingData（本地设置记录）**

| 属性 | 类型 | 说明 |
|------|------|------|
| category | number | 操作分类，32 表示本地设备设置 |
| userType | number | 操作人类型 |
| userId | number | 操作人 id |
| toUserType | number | 被操作人类型 |
| toUserId | number | 被操作人 id |
| type | number | 设置类型 |
| data | number \| Uint8Array | 设置数据 |
| originData | Uint8Array | 原始数据 |

**LocalOperateOtherData（其他操作记录）**

| 属性 | 类型 | 说明 |
|------|------|------|
| category | number | 操作分类 |
| userType | number | 操作人类型 |
| userId | number | 操作人 id |
| toUserType | number | 被操作人类型 |
| toUserId | number | 被操作人 id |
| type | number | 操作类型 |
| data | Uint8Array | 操作数据 |

##### 代码示例

```javascript
import { getLogs } from '@ray-js/lock-sdk';

const result = await getLogs({
  page: 1,
  pageSize: 50
});

console.log('日志数量:', result.list.length);
console.log('是否还有更多:', result.hasMore);
console.log('总记录数:', result.total);
```

##### 返回示例

```json
{
  "list": [
    {
      "logId": "xxx",
      "time": 1234567890000,
      "currentUser": true,
      "type": "unlock_record",
      "userId": "xxx",
      "dpId": 1,
      "dpCode": "unlock_password",
      "data": "xxx",
      "userName": "张三",
      "bindable": false,
      "unlockName": "我的密码",
      "mediaInfo": [
        {
          "mediaPath": "/path/to/media",
          "fileKey": "file_key_xxx",
          "fileUrl": "https://example.com/image.jpg",
          "mediaBucket": "media_bucket",
          "mediaKey": "media_key_xxx"
        }
      ],
      "unionUnlockInfo": [
        {
          "userId": "xxx",
          "userName": "张三",
          "unlockName": "我的密码",
          "sn": 1,
          "type": "password"
        }
      ],
      "unlockMethod": "password"
    },
    {
      "logId": "yyy",
      "time": 1234567890001,
      "currentUser": false,
      "type": "close_record",
      "userId": "yyy",
      "dpId": 2,
      "dpCode": "close",
      "data": "xxx",
      "userName": "李四",
      "bindable": false,
      "unlockName": "",
      "closeValue": "AUTO"
    },
    {
      "logId": "zzz",
      "time": 1234567890002,
      "currentUser": true,
      "type": "local_operation",
      "userId": "xxx",
      "dpId": 0,
      "dpCode": "",
      "data": "xxx",
      "userName": "张三",
      "bindable": false,
      "unlockName": "",
      "localRecord": {
        "category": 0,
        "userType": 1,
        "userId": 100,
        "toUserType": 1,
        "toUserId": 100,
        "unlockMethod": "password",
        "unlockId": 1,
        "isRemoveAll": false
      }
    },
    {
      "logId": "aaa",
      "time": 1234567890003,
      "currentUser": false,
      "type": "alarm_record",
      "userId": "yyy",
      "dpId": 98,
      "dpCode": "hijack",
      "data": "xxx",
      "userName": "李四",
      "bindable": false,
      "unlockName": "",
      "isHijack": true
    }
  ],
  "hasMore": false,
  "total": 4
}
```

##### 错误码

无错误码。
#### getLatestLogs

##### 功能描述

获取最近2条记录。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回最近2条操作记录
- 包含未读数量信息

##### 参数

无参数。

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| data | LogData[] | 日志列表 |
| unreadCount | number | 未读数量 |

###### LogData 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| logId | string | 日志 id |
| time | number | 日志生成时间戳，单位毫秒 |
| currentUser | boolean | 是否当前用户 |
| type | LogType | 日志类型，可能的值：alarm_record（告警日志）、close_record（关锁日志）、unlock_record（开锁日志）、operation（操作类日志）、local_operation（设备本地操作日志）、dev_bind（设备绑定日志） |
| userId | string | 与记录相关的用户 id |
| dpId | number | 相关dp id |
| dpCode | string | 相关 dp code |
| data | any | 记录对应的数据 |
| userName | string | 与记录相关的用户昵称 |
| bindable | boolean | 是否未绑定，当 type 为 unlock_record 时值有意义 |
| unlockName | string | 开锁方式的名称，当 type 为 unlock_record 时，值有意义 |
| mediaInfo | MediaInfo[] | 日志对应的消息图片或视频 |
| unionUnlockInfo | UnionUnlockInfo[] | 组合开锁记录，当 type 为 unlock_record 时，可能有值 |
| closeValue | CloseValue | 关锁记录值，当 type 为 close_record 时有值 |
| localRecord | LocalOperateData | 设备本地日志，当 type 为 local_operation 时，有值 |
| isHijack | boolean | 是否为劫持告警 |
| unlockMethod | UnlockMethodType | 开锁方式类型，当 type 为 unlock_record 时，值有意义 |

###### MediaInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| mediaPath | string | 媒体路径 |
| fileKey | string | 图片 key |
| fileUrl | string | 图片 url |
| mediaBucket | string | 媒体桶 |
| mediaKey | string | 媒体 key |

###### UnionUnlockInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 id |
| userName | string | 用户名称 |
| unlockName | string | 开锁方式名称 |
| sn | number | 序列号 |
| type | UnlockMethodType | 开锁方式类型 |

##### 代码示例

```javascript
import { getLatestLogs } from '@ray-js/lock-sdk';

const result = await getLatestLogs();

console.log('未读数量:', result.unreadCount);
result.data.forEach(log => {
  console.log('日志类型:', log.type);
  console.log('用户名称:', log.userName);
});
```

##### 返回示例

```json
{
  "data": [
    {
      "logId": "xxx",
      "time": 1234567890000,
      "currentUser": true,
      "type": "unlock_record",
      "userId": "xxx",
      "dpId": 1,
      "dpCode": "unlock_password",
      "data": "xxx",
      "userName": "张三",
      "bindable": false,
      "unlockName": "我的密码",
      "mediaInfo": [
        {
          "mediaPath": "/path/to/media",
          "fileKey": "file_key_xxx",
          "fileUrl": "https://example.com/image.jpg",
          "mediaBucket": "media_bucket",
          "mediaKey": "media_key_xxx"
        }
      ],
      "unionUnlockInfo": [
        {
          "userId": "xxx",
          "userName": "张三",
          "unlockName": "我的密码",
          "sn": 1,
          "type": "password"
        }
      ],
      "unlockMethod": "password"
    },
    {
      "logId": "yyy",
      "time": 1234567890001,
      "currentUser": false,
      "type": "close_record",
      "userId": "yyy",
      "dpId": 2,
      "dpCode": "close",
      "data": "xxx",
      "userName": "李四",
      "bindable": false,
      "unlockName": "",
      "closeValue": "AUTO"
    }
  ],
  "unreadCount": 2
}
```

##### 错误码

无错误码。
#### getAlarms

##### 功能描述

获取告警列表。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 支持分页查询
- 默认每页数量为 50
- 返回告警类型的日志记录

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| page | number | 1 | 否 | 页码 |
| pageSize | number | 50 | 否 | 每页数量 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| list | LogData[] | 告警列表 |
| hasMore | boolean | 是否还有更多数据 |
| total | number | 总记录数 |

###### LogData 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| logId | string | 日志 id |
| time | number | 日志生成时间戳，单位毫秒 |
| currentUser | boolean | 是否当前用户 |
| type | string | 日志类型，值为 "alarm_record" |
| userId | string | 与记录相关的用户 id |
| dpId | number | 相关dp id |
| dpCode | string | 相关 dp code |
| data | any | 记录对应的数据 |
| userName | string | 与记录相关的用户昵称 |
| bindable | boolean | 是否未绑定，告警记录为 false |
| unlockName | string | 开锁方式的名称 |
| mediaInfo | MediaInfo[] | 日志对应的消息图片或视频 |
| isHijack | boolean | 是否为劫持告警 |

###### MediaInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| mediaPath | string | 媒体路径 |
| fileKey | string | 图片 key |
| fileUrl | string | 图片 url |
| mediaBucket | string | 媒体桶 |
| mediaKey | string | 媒体 key |

##### 代码示例

```javascript
import { getAlarms } from '@ray-js/lock-sdk';

const result = await getAlarms({
  page: 1,
  pageSize: 50
});

console.log('告警数量:', result.list.length);
result.list.forEach(alarm => {
  console.log('是否为劫持告警:', alarm.isHijack);
});
```

##### 返回示例

```json
{
  "list": [
    {
      "logId": "xxx",
      "time": 1234567890000,
      "currentUser": true,
      "type": "alarm_record",
      "userId": "xxx",
      "dpId": 98,
      "dpCode": "hijack",
      "data": "xxx",
      "userName": "张三",
      "bindable": false,
      "unlockName": "",
      "mediaInfo": [
        {
          "mediaPath": "/path/to/media",
          "fileKey": "file_key_xxx",
          "fileUrl": "https://example.com/image.jpg",
          "mediaBucket": "media_bucket",
          "mediaKey": "media_key_xxx"
        }
      ],
      "isHijack": true
    }
  ],
  "hasMore": false,
  "total": 1
}
```

##### 错误码

无错误码。
#### getAlbums

##### 功能描述

获取相册日志。仅支持视对讲设备。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 仅支持视对讲设备
- 支持分页查询
- 默认每页数量为 20
- 默认查询范围为一年前到现在

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| page | number | 1 | 否 | 页码 |
| pageSize | number | 20 | 否 | 每页数量 |
| startTime | number | 一年前 | 否 | 开始时间，单位为毫秒 |
| endTime | number | 当前时间 | 否 | 结束时间，单位为毫秒 |

##### 返回数据

返回 Promise，Promise 中的数据如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| hasMore | boolean | 是否还有更多数据 |
| list | AlbumMessage[] | 相册消息列表 |
| allAitypes | number[] | 所有 AI 类型 |
| types | number[] | 事件类型列表 |
| langMap | string[] | 语言映射列表 |

###### AlbumMessage 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | id |
| mediaPath | string | 媒体路径 |
| fileKey | string | 图片 key |
| fileUrl | string | 图片 url |
| mediaBucket | string | 媒体桶 |
| mediaKey | string | 媒体 key |
| aiTypes | number[] | AI 检测结果类型 |
| describe | string | 消息描述 |
| aiInfos | AIInfo[] | AI 检测结果 |
| type | number | 消息类型 |
| createTime | number | 创建时间，单位毫秒 |

###### AIInfo 对象结构

| 属性 | 类型 | 说明 |
|------|------|------|
| id | number | id |
| type | number | 事件类型 |
| name | string | 事件名称 |
| desc | string | 事件描述 |
| happenTime | number | 发生时间，单位毫秒 |
| isCorrected | boolean | 是否已修正 |

##### 代码示例

```javascript
import { getAlbums } from '@ray-js/lock-sdk';

const result = await getAlbums({
  page: 1,
  pageSize: 20,
  startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
  endTime: Date.now()
});

console.log('相册消息数量:', result.list.length);
result.list.forEach(item => {
  console.log('消息描述:', item.describe);
  console.log('AI检测结果数量:', item.aiInfos.length);
});
```

##### 返回示例

```json
{
  "hasMore": false,
  "list": [
    {
      "id": "xxx",
      "mediaPath": "xxx",
      "fileKey": "xxx",
      "fileUrl": "https://xxx",
      "mediaBucket": "xxx",
      "mediaKey": "xxx",
      "aiTypes": [1, 2],
      "describe": "有人来访",
      "aiInfos": [
        {
          "id": 1,
          "type": 1,
          "name": "访客",
          "desc": "检测到访客",
          "happenTime": 1234567890000,
          "isCorrected": false
        }
      ],
      "type": 1,
      "createTime": 1234567890000
    }
  ],
  "allAitypes": [1, 2],
  "types": [1, 2],
  "langMap": ["访客", "快递"]
}
```

##### 错误码

无错误码。
#### onLogsRefresh

##### 功能描述

注册通知可刷新日志事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 当有新日志时，会触发回调函数
- 需要在组件卸载时注销监听器

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| cb | function | - | 是 | 回调函数，无参数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onLogsRefresh, offLogsRefresh } from '@ray-js/lock-sdk';

const handleRefresh = () => {
  console.log('有新日志，需要刷新');
  // 刷新日志列表
};

// 注册监听器
onLogsRefresh(handleRefresh);

// 注销监听器
offLogsRefresh(handleRefresh);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### offLogsRefresh

##### 功能描述

注销通知可刷新日志事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要传入与注册时相同的回调函数
- 注销后不再接收日志刷新事件

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| cb | function | - | 是 | 回调函数，无参数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onLogsRefresh, offLogsRefresh } from '@ray-js/lock-sdk';

const handleRefresh = () => {
  console.log('有新日志，需要刷新');
};

// 注册监听器
onLogsRefresh(handleRefresh);

// 注销监听器
offLogsRefresh(handleRefresh);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。

## 休眠设置

#### isEnabledSleep

##### 功能描述

判断休眠功能是否已启用。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回 true 表示休眠功能已启用
- 返回 false 表示休眠功能已禁用
- 如果设备不支持休眠功能，将抛出错误

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示休眠功能已启用，false 表示休眠功能已禁用。

##### 代码示例

```javascript
import { isEnabledSleep } from '@ray-js/lock-sdk';

const enabled = isEnabledSleep();

if (enabled) {
  console.log('休眠功能已启用');
} else {
  console.log('休眠功能已禁用');
}
```

##### 返回示例

```json
true
```

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | 不支持休眠功能 |
#### disableSleep

##### 功能描述

禁用休眠。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 禁用休眠后，设备将不再进入休眠状态
- 如果设备不支持休眠功能，将抛出错误

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { disableSleep } from '@ray-js/lock-sdk';

await disableSleep();
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | 不支持休眠功能 |
#### enableSleep

##### 功能描述

启用休眠。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 启用休眠后，设备将在设定的时间段内进入休眠状态
- 如果设备不支持休眠功能，将抛出错误

##### 参数

无参数。

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { enableSleep } from '@ray-js/lock-sdk';

await enableSleep();
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | 不支持休眠功能 |
#### getSleepPeriod

##### 功能描述

获取休眠时间段。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回的休眠时间段以分钟为单位
- start 表示开始时间（分钟），end 表示结束时间（分钟）

##### 参数

无参数。

##### 返回数据

返回对象，结构如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| start | number | 开始时间（分钟） |
| end | number | 结束时间（分钟） |

##### 代码示例

```javascript
import { getSleepPeriod } from '@ray-js/lock-sdk';

const period = getSleepPeriod();

const startHour = Math.floor(period.start / 60);
const startMinute = period.start % 60;
const endHour = Math.floor(period.end / 60);
const endMinute = period.end % 60;

console.log(`休眠时间段: ${startHour}:${startMinute} - ${endHour}:${endMinute}`);
```

##### 返回示例

```json
{
  "start": 1320,
  "end": 480
}
```

##### 错误码

无错误码。
#### updateSleepPeriod

##### 功能描述

设置休眠时间段。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 时间段以分钟为单位
- start 表示开始时间（分钟），end 表示结束时间（分钟）
- 例如：start 为 1320 表示 22:00，end 为 480 表示 8:00

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| start | number | - | 是 | 开始时间（分钟） |
| end | number | - | 是 | 结束时间（分钟） |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { updateSleepPeriod } from '@ray-js/lock-sdk';

// 设置休眠时间段为 22:00 - 8:00
await updateSleepPeriod({
  start: 22 * 60, // 22:00
  end: 8 * 60    // 8:00
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | 不支持休眠功能 |
#### hasSleepAbility

##### 功能描述

判断锁是否支持休眠功能。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回 true 表示支持休眠功能
- 需要设备支持休眠相关的 dp

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示支持休眠功能，false 表示不支持。

##### 代码示例

```javascript
import { hasSleepAbility } from '@ray-js/lock-sdk';

const hasAbility = hasSleepAbility();

if (hasAbility) {
  console.log('设备支持休眠功能');
} else {
  console.log('设备不支持休眠功能');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### isSleep

##### 功能描述

判断锁是否处于休眠状态。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 返回 true 表示为休眠中
- 如果设备不支持休眠功能，返回 false

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示处于休眠状态，false 表示未休眠。

##### 代码示例

```javascript
import { isSleep } from '@ray-js/lock-sdk';

const sleep = isSleep();

if (sleep) {
  console.log('设备处于休眠状态');
} else {
  console.log('设备未休眠');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### offSleepStatusChange

##### 功能描述

注销休眠状态变更事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要传入与注册时相同的回调函数
- 注销后不再接收休眠状态变更事件

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| callback | function | - | 是 | 休眠状态变更回调函数 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onSleepStatusChange, offSleepStatusChange } from '@ray-js/lock-sdk';

const handleStatusChange = (args) => {
  console.log('休眠状态:', args.sleep);
};

// 注册监听器
onSleepStatusChange(handleStatusChange);

// 注销监听器
offSleepStatusChange(handleStatusChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### onSleepStatusChange

##### 功能描述

注册休眠状态变更事件。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 当休眠状态发生变化时，会触发回调函数
- 需要在组件卸载时注销监听器

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| callback | function | - | 是 | 休眠状态变更回调函数 |

###### callback 函数参数

| 属性 | 类型 | 说明 |
|------|------|------|
| sleep | boolean | 是否休眠，true 表示休眠，false 表示未休眠 |

##### 返回数据

无返回数据。

##### 代码示例

```javascript
import { onSleepStatusChange, offSleepStatusChange } from '@ray-js/lock-sdk';

const handleStatusChange = (args) => {
  if (args.sleep) {
    console.log('设备进入休眠状态');
  } else {
    console.log('设备退出休眠状态');
  }
};

// 注册监听器
onSleepStatusChange(handleStatusChange);

// 注销监听器
offSleepStatusChange(handleStatusChange);
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。

## 其他

#### getDpPeriodTime

##### 功能描述

获取休眠时间段。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此方法用于获取指定 dp 的时间段配置
- 时间段以分钟为单位

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| dpCode | string | - | 是 | 待获取时段的 dp code |

##### 返回数据

返回对象，结构如下：

| 属性 | 类型 | 说明 |
|------|------|------|
| start | number | 开始时间（分钟） |
| end | number | 结束时间（分钟） |

##### 代码示例

```javascript
import { getDpPeriodTime } from '@ray-js/lock-sdk';

const period = getDpPeriodTime('dormant_time_set');

console.log('开始时间:', period.start, '分钟');
console.log('结束时间:', period.end, '分钟');
```

##### 返回示例

```json
{
  "start": 1320,
  "end": 480
}
```

##### 错误码

无错误码。
#### isSupportBleControl

##### 功能描述

判断是否支持蓝牙控制。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 需要设备支持蓝牙功能
- Matter 设备需要激活蓝牙
- 双模设备需要判断 WiFi 激活状态

##### 参数

无参数。

##### 返回数据

返回 boolean，true 表示支持蓝牙控制，false 表示不支持。

##### 代码示例

```javascript
import { isSupportBleControl } from '@ray-js/lock-sdk';

const support = isSupportBleControl();

if (support) {
  console.log('设备支持蓝牙控制');
} else {
  console.log('设备不支持蓝牙控制');
}
```

##### 返回示例

```json
true
```

##### 错误码

无错误码。
#### openScene

##### 功能描述

打开智能场景配置页面，用于创建和管理与门锁相关的智能场景，实现自动化控制。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 此方法会跳转到原生场景页面
- 可以设置主题颜色、动作范围和场景能力
- 场景配置在系统提供的场景配置页面中进行

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| themeColor | string | "#ff592a" | 否 | 主题颜色，用于自定义场景配置页面的主题颜色 |
| executorRange | ExecutorRange[] | ["unlock", "lock"] | 否 | 设置动作的范围，用于限制场景中可以执行的动作类型 |
| abilities | Ability[] | [] | 否 | 支持的场景能力，用于启用特定的场景功能 |

###### ExecutorRange 类型说明

| 值 | 说明 |
|------|------|
| unlock | 开锁动作 |
| lock | 关锁动作 |

###### Ability 类型说明

| 值 | 说明 |
|------|------|
| backHome | 家人到家提醒 |
| alarm | 告警提醒 |
| geographyArrive | 地理围栏到家提醒 |
| geographyLeave | 地理围栏离家提醒 |
| bleGeofence | 蓝牙靠近解锁 |
| siriUnlock | Siri 解锁 |
| siriLock | Siri 锁门 |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { openScene } from '@ray-js/lock-sdk';

// 基本使用
await openScene();

// 指定主题颜色
await openScene({
  themeColor: '#0084FF'
});

// 完整配置
await openScene({
  themeColor: '#0084FF',
  executorRange: ['unlock', 'lock'],
  abilities: ['backHome', 'alarm', 'geographyArrive']
});
```

##### 返回示例

无返回数据。

##### 错误码

无错误码。
#### updateDpPeriodTime

##### 功能描述

设置时间段。

> 依赖@ray-js/lock-sdk 版本 `>= 1.0.0`

##### 注意事项

- 时间段以分钟为单位
- 如果 dp 不存在，将抛出错误

##### 参数

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| dpCode | string | - | 是 | 待设置时段的 dp code |
| start | number | - | 是 | 开始时间（分钟） |
| end | number | - | 是 | 结束时间（分钟） |

##### 返回数据

返回 Promise<void>，无返回数据。

##### 代码示例

```javascript
import { updateDpPeriodTime } from '@ray-js/lock-sdk';

await updateDpPeriodTime('dormant_time_set', {
  start: 22 * 60, // 22:00
  end: 8 * 60     // 8:00
});
```

##### 返回示例

无返回数据。

##### 错误码

| 错误码 | 说明 |
|--------|------|
| 1014 | dp 不存在 |
