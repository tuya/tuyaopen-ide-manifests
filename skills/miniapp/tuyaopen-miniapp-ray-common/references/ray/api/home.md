# 家庭 (home)

### home.getCurrentHomeInfo

 获取当前家庭信息

> 需引入`HomeKit`，且在`>=3.0.1`版本才可使用

#### 引入

```js
// @ray-js/ray >=1.2.0
import { home } from '@ray-js/ray';
const { getCurrentHomeInfo } = home;
```

#### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 返回结果

- **success**

| 属性      | 类型      | 说明                                       |
| --------- | --------- | ------------------------------------------ |
| homeName  | `string`  | 家庭名称                                   |
| homeId    | `string`  | 家庭 id                                    |
| longitude | `string`  | 经度                                       |
| latitude  | `string`  | 维度                                       |
| address   | `string`  | 详细地址                                   |
| admin     | `boolean` | 是否是管理员, true 是管理员; false 非管理员 |

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

#### 请求示例

```js
getCurrentHomeInfo()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

#### 返回示例

```js
{
  "homeId": "26725023",
  "admin": true,
  "latitude": "30.30039978027344",
  "longitude": "120.0689010620117",
  "homeName": "我的家庭",
  "address": "华策中心A座"
}
```
### home.getDeviceIdList

 获取当前维度下的设备 id 列表

> 需引入`HomeKit`，且在`>=3.1.0`版本才可使用

#### 引入

```js
// @ray-js/ray >=1.2.0
import { home } from '@ray-js/ray';
const { getDeviceIdList } = home;
```

#### 请求参数

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| ownerId  | `number`   |        | 是   | 维度 id（比如家庭id）                                       |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 返回结果

- **success**

| 属性   | 类型    | 说明         |
| ------ | ------- | ------------ |
| devIds | `Array<String>` | 设备 id 列表 |

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

#### 请求示例

```js
getDeviceIdList({
  ownerId: '26725023'
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

#### 返回示例

```js
{
  "devIds": [
    "vdevo168845027498793", 
    "64710761ecfabcaaf553", 
    "6c87332fc414a65029ovfr"
  ]
}
```
### home.getRoomList

 从 sdk 本地缓存中获取当前家庭维度下房间的设备 id 列表

> 需引入`HomeKit`，且在`>=3.1.0`版本才可使用

#### 引入

```js
// @ray-js/ray >=1.2.0
import { home } from '@ray-js/ray';
const { getRoomList } = home;
```

#### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| ownerId  | `number`   |        | 是   | 维度 id（比如家庭 id）                           |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 返回结果

- **success**

| 属性      | 类型    | 说明     |
| --------- | ------- | -------- |
| roomDatas | `Array<RoomInfo>` | 房间列表 |

**RoomInfo**

| 属性      | 类型    | 说明     |
| --------- | ------- | -------- |
| name | `String` | 房间名称 |
| roomId | `number` | 房间 id |
| deviceIds | `Array<String>` | 设备 id 列表 |

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

#### 请求示例

```js
getRoomList({
  ownerId: '26725023'
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

#### 返回示例

```js
{
  "roomDatas": [{
    "name": "Living room",
    "deviceIds": ["vdevo160395678273817"],
    "roomId": 18585095
  }, {
    "name": "Master bedroom",
    "deviceIds": ["64710761ecfabcaaf553"],
    "roomId": 18585096
  }, {
    "name": "Second bedroom",
    "deviceIds": [],
    "roomId": 18585097
  }]
}
```
### home.getDeviceRoomInfo

 获取设备房间信息

> 需引入`HomeKit`，且在`>=3.0.1`版本才可使用

#### Use in Ray

```js
// @ray-js/ray >=1.2.0
import { home } from '@ray-js/ray';
const { getDeviceRoomInfo } = home;
```

#### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                 |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

#### 返回结果

- **success**

| 属性   | 类型     | 说明           |
| ------ | -------- | -------------- |
| roomId | `number` | 房间 id   |
| name   | `string` | 房间名称 |

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

#### 请求示例

```js
getDeviceRoomInfo({
  deviceId: '64710761ecfabcaaf553',
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

#### 返回示例

```js
{
  "name": "Living room",
  "roomId": 18585096
}
```
