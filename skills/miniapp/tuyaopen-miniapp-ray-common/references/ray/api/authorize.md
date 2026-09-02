# 授权 (authorize)

### authorize

#### 功能描述

权限请求方法

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { authorize } from '@ray-js/ray'
authorize({ ... })
```

**原生小程序中使用**

```javascript
ty.authorize({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型             | 默认值                       | 必填 | 说明                                             |
| -------- | ---------------- | ---------------------------- | ---- | ------------------------------------------------ |
| scope    | `enum` ScopeBean | `ScopeBean.WRITEPHOTOSALBUM` | 否   | scope 权限名称                                   |
| success  | function         |                              | 否   | 接口调用成功的回调函数                           |
| fail     | function         |                              | 否   | 接口调用失败的回调函数                           |
| complete | function         |                              | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 引用对象

**`enum` ScopeBean**

| 枚举值                       | 描述                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| scope.bluetooth              | 蓝牙权限                                                                                            |
| scope.record                 | 麦克风权限                                                                                          |
| scope.writePhotosAlbum       | 写入权限                                                                                            |
| scope.camera                 | 摄像头权限                                                                                          |
| scope.userLocation           | 低精度定位权限                                                                                      |
| scope.userPreciseLocation    | 高精度定位权限                                                                                      |
| scope.userLocationBackground | 后台定位权限
注意: iOS 需要将 TARGETS-\>Capabilities-\>Background Modes-\>Location updates 打开 |
| scope.userInfo               | 用户信息                                                                                            |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { authorize } from '@ray-js/ray';
// 原生调用方式
const { authorize } = ty;

authorize({
  scope: 'scope.record',
  success: () => {
    console.log('authorizeStatus success');
  },
  fail: (err) => {
    console.log('authorizeStatus fail', err);
  }
});
```

#### 错误码

| 错误码 | 错误描述                    |
| ------ | --------------------------- |
| 9001   | Activity is invalid         |
| 9003   | can‘t find scope permission |
| 9004   | app no permission           |

#### 常见问题

##### Q：authorize 和 authorizeStatus 的区别是什么？

A：authorize 是请求授权，如果没有权限，调用 authorize 会弹出授权弹窗，用户授权后会执行 success 回调。authorizeStatus 是检查授权状态，不会弹出授权弹窗。

##### Q：已知问题及修复记录

A：以下问题已在 BaseKit 3.17.7 修复：

Android 端：

1. scope.useInfo 调用 authorize 和 authorizeStatus 会报错 9003 (can't find scope permission)
2. scope.userPreciseLocation 报错 9004 (app no permission)

iOS 端：

1. scope.useInfo 调用 authorize 和 authorizeStatus 会报错 9003 (can't find scope permission)
2. authorizeStatus userPreciseLocation 报错 9004 (app no permission)
3. authorizeStatus userLocationBackground 报错 9004 (app no permission) 增加了额外说明需要在苹果开发者平台配置。
### authorizeStatus

#### 功能描述

查询权限状态

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { authorizeStatus } from '@ray-js/ray'
authorizeStatus({ ... })
```

**原生小程序中使用**

```javascript
ty.authorizeStatus({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型             | 默认值                       | 必填 | 说明                                             |
| -------- | ---------------- | ---------------------------- | ---- | ------------------------------------------------ |
| scope    | `enum` ScopeBean | `ScopeBean.WRITEPHOTOSALBUM` | 否   | scope 权限名称                                   |
| success  | function         |                              | 否   | 接口调用成功的回调函数                           |
| fail     | function         |                              | 否   | 接口调用失败的回调函数                           |
| complete | function         |                              | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 引用对象

**`enum` ScopeBean**

| 枚举值                       | 描述                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| scope.bluetooth              | 蓝牙权限                                                                                            |
| scope.record                 | 麦克风权限                                                                                          |
| scope.writePhotosAlbum       | 写入权限                                                                                            |
| scope.camera                 | 摄像头权限                                                                                          |
| scope.userLocation           | 低精度定位权限                                                                                      |
| scope.userPreciseLocation    | 高精度定位权限                                                                                      |
| scope.userLocationBackground | 后台定位权限
注意: iOS 需要将 TARGETS-\>Capabilities-\>Background Modes-\>Location updates 打开 |
| scope.userInfo               | 用户信息                                                                                            |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { authorizeStatus } from '@ray-js/ray';

// 原生调用方式
const { authorizeStatus } = ty;

authorizeStatus({
  scope: 'scope.record',
  success: () => {
    console.log('authorizeStatus success');
  },
  fail: (err) => {
    console.log('authorizeStatus fail', err);
  }
});
```

#### 错误码

| 错误码 | 错误描述                    |
| ------ | --------------------------- |
| 9001   | Activity is invalid         |
| 9003   | can‘t find scope permission |
| 9004   | app no permission           |
| 9005   | can‘t find service          |

#### 常见问题

##### Q：如果没有权限，调用 authorizeStatus 会返回什么？

A：如果没有权限，调用 authorizeStatus 会执行 fail 回调，具体原因可查看错误码与错误信息。
### getSetting

#### 功能描述

获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限

> 需引入`BaseKit`，且在`>=3.12.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getSetting } from '@ray-js/ray'
getSetting({ ... })
```

**原生小程序中使用**

```javascript
ty.getSetting({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性        | 类型 | 说明         |
| ----------- | ---- | ------------ |
| authSetting | any  | 用户授权结果 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
import { getSetting } from '@ray-js/ray';

getSetting({
  success: (res) => {
    console.log('getSetting success', res);
  },
  fail: (err) => {
    console.log('getSetting fail', err);
  }
});
```

##### 成功示例

```json
{
  "authSetting": {
    "scope.userInfo": true,
    "scope.userLocation": true,
    "scope.writePhotosAlbum": true
  }
}
```
