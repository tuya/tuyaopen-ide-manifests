# 跳转 (navigate)

### navigateToMiniProgram

#### 功能描述

打开另一个小程序

> 需引入`BaseKit`，且在`>=2.2.4`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { navigateToMiniProgram } from '@ray-js/ray'
navigateToMiniProgram({ ... })
```

**原生小程序中使用**

```javascript
ty.navigateToMiniProgram({ ... })
```

#### 请求参数

**Object object**

| 属性        | 类型     | 默认值      | 必填 | 说明                                                                                                                                                     |
| ----------- | -------- | ----------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appId       | string   |             | 否   | 要打开的小程序 appId                                                                                                                                     |
| aiPtChannel | string   |             | 否   | 要打开的智能体小程序的智能体 Id
`最低版本3.13.0`                                                                                                     |
| aiPtType    | string   | `"release"` | 否   | 要打开的小程序智能体的版本。
preview：体验版
release：正式版
`最低版本3.13.0`                                                                |
| path        | string   |             | 否   | 打开的页面路径,如果为空则打开首页,path 中 ? 后面的部分会成为 query，在小程序的 `App.onLaunch`、`App.onShow` 和 `Page.onLoad` 的回调函数                  |
| position    | string   | `"right"`   | 否   | 打开小程序的转场方式,分为 right\|bottom,指代水平和竖直方向
`最低版本2.5.1`                                                                           |
| extraData   | any      |             | 否   | 传递给目标小程序的数据,目标小程序可在 `App.onLaunch`，`App.onShow` 中获取到这份数据                                                                      |
| envVersion  | string   | `"release"` | 否   | 要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版
trial：体验版
release：正式版 |
| shortLink   | string   |             | 否   | 小程序链接，当传递该参数后，可以不传 appId 和 path                                                                                                       |
| success     | function |             | 否   | 接口调用成功的回调函数                                                                                                                                   |
| fail        | function |             | 否   | 接口调用失败的回调函数                                                                                                                                   |
| complete    | function |             | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                         |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
import { navigateToMiniProgram } from '@ray-js/ray';

navigateToMiniProgram({
  appId: 'tyklw3zmnykazhzdjf',
  success: () => {
    console.log('navigateToMiniProgram success');
  },
  fail: (err) => {
    console.log('navigateToMiniProgram fail', err);
  }
});
```

#### 错误码

| 错误码 | 错误描述                                        |
| ------ | ----------------------------------------------- |
| 9005   | can‘t find service                              |
| 40009  | miniapp already been open, cannot be open again |
### navigateBackMiniProgram

#### 功能描述

返回到上一个小程序。只有在当前小程序是被其他小程序打开时可以调用成功

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { navigateBackMiniProgram } from '@ray-js/ray'
navigateBackMiniProgram({ ... })
```

**原生小程序中使用**

```javascript
ty.navigateBackMiniProgram({ ... })
```

#### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                                                       |
| --------- | -------- | ------ | ---- | -------------------------------------------------------------------------- |
| extraData | any      |        | 否   | 需要返回给上一个小程序的数据，上一个小程序可在 App.onShow 中获取到这份数据 |
| success   | function |        | 否   | 接口调用成功的回调函数                                                     |
| fail      | function |        | 否   | 接口调用失败的回调函数                                                     |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                           |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
| 40003  | miniapp not exist              |
### exitMiniProgram

#### 功能描述

退出当前小程序

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { exitMiniProgram } from '@ray-js/ray'
exitMiniProgram({ ... })
```

**原生小程序中使用**

```javascript
ty.exitMiniProgram({ ... })
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

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 40003  | miniapp not exist       |
| 40010  | miniapp can not be exit |
