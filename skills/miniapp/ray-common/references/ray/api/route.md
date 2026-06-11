# 路由 (route)

### router

> 若您有跨端需求，您可以使用 router 对象实现您的路由跳转。

#### router.push(url: string) 

跳转到指定页面，参数可以是 hash 形式，也可以是 query 形式

#### router.replace(url: string) 

跳转到指定页面，并且替换当前页面，参数可以是 hash 形式，也可以是 query 形式

#### router.back() 

返回上一页

#### router.go(delta: number) 

跳转到指定的历史页面，delta 为返回的页面数，如果 delta 大于现有页面数，则返回到首页

#### router.reload() 

关闭所有页面，重新加载页面

#### 引入

```js
import { router } from '@ray-js/ray';
```

#### 使用

```ts
/// routers.config.ts
import { Routes } from '@ray-js/types';

export const routes: Routes = [
  {
    route: '/',
    path: '/pages/home/index',
  },
  {
    route: '/detail/:uid',
    path: '/pages/detail/index',
  },
  {
    route: '/my',
    path: '/pages/my/index',
  },
];
```

##### push

```tsx
router.push(url: string)
```

**hash 参数**

```
router.push('/detail/1234')
```

detail 页面的路由配置为 `/detail/:uid`，您可以在 `detail` 页面的 `props.location.query.uid` 获取 `uid`。

**query 参数**

```
router.push('/detail/1234?name=tuya')
```

您可以在 `detail` 页面的 `props.location.query.name` 获取 `query` 参数 `name`。
### navigateBack

#### 功能描述

关闭当前页面，返回上一页面或多级页面

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { navigateBack } from '@ray-js/ray'
navigateBack({ ... })
```

**原生小程序中使用**

```javascript
ty.navigateBack({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                  |
| -------- | -------- | ------ | ---- | ----------------------------------------------------- |
| delta    | number   | `1`    | 否   | 返回的页面数，如果 delta 大于现有页面数，则返回到首页 |
| success  | function |        | 否   | 接口调用成功的回调函数                                |
| fail     | function |        | 否   | 接口调用失败的回调函数                                |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）      |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                                   |
| ------ | ------------------------------------------ |
| 40001  | the last page cannot be navigator back     |
| 40003  | miniapp not exist                          |
| 40017  | navigate back event already been intercept |
### navigateTo

#### 功能描述

路由到新页面

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { navigateTo } from '@ray-js/ray'
navigateTo({ ... })
```

**原生小程序中使用**

```javascript
ty.navigateTo({ ... })
```

#### 请求参数

**Object object**

| 属性             | 类型     | 默认值   | 必填 | 说明                                                                                                                                                                                                                         |
| ---------------- | -------- | -------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url              | string   |          | 是   | 页面路径, 参数需要做 url encode 处理                                                                                                                                                                                         |
| type             | string   | `"full"` | 否   | 打开方式，支持全屏 full，半屏 half；默认全屏 full
`最低版本2.6.0`                                                                                                                                                        |
| topMargin        | number   | `100`    | 否   | 非全屏页面距离屏幕顶部的距离，type 为 half 时有效
取值范围：【1-屏幕的高度】单位：px
注意：Android 显示区域不包括状态栏，iOS 显示区域包括状态栏。
因此 Android 的 topMargin 的最大值是屏幕高度减去状态栏的高度。 |
| topMarginPercent | number   |          | 否   | 非全屏页面距离屏幕顶部的百分比，type 为 half 时有效，优先级高于 topMargin
取值范围【1-99】单位：百分比
注意：Android 显示区域不包括状态栏，iOS 显示区域包括状态栏。                                                  |
| success          | function |          | 否   | 接口调用成功的回调函数                                                                                                                                                                                                       |
| fail             | function |          | 否   | 接口调用失败的回调函数                                                                                                                                                                                                       |
| complete         | function |          | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                             |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 40002  | the page not be found                |
| 40003  | miniapp not exist                    |
| 40004  | navigatorTo cannot open tab url      |
| 40006  | A maximum of ten pages can be opened |
### redirectTo

#### 功能描述

关闭当前页面，跳转到应用内的某个页面

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { redirectTo } from '@ray-js/ray'
redirectTo({ ... })
```

**原生小程序中使用**

```javascript
ty.redirectTo({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| url      | string   |        | 是   | 页面路径, 参数需要做 url encode 处理             |
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

| 错误码 | 错误描述                        |
| ------ | ------------------------------- |
| 40002  | the page not be found           |
| 40003  | miniapp not exist               |
| 40004  | navigatorTo cannot open tab url |
### reLaunch

#### 功能描述

关闭所有页面，打开到应用内的某个页面

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { reLaunch } from '@ray-js/ray'
reLaunch({ ... })
```

**原生小程序中使用**

```javascript
ty.reLaunch({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| url      | string   |        | 是   | 页面路径, 参数需要做 url encode 处理             |
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

| 错误码 | 错误描述              |
| ------ | --------------------- |
| 40002  | the page not be found |
| 40003  | miniapp not exist     |
### switchTab

#### 功能描述

跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { switchTab } from '@ray-js/ray'
switchTab({ ... })
```

**原生小程序中使用**

```javascript
ty.switchTab({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| url      | string   |        | 是   | 页面路径, 不支持参数                             |
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

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 40002  | the page not be found                |
| 40003  | miniapp not exist                    |
| 40007  | cannot find page url from tab config |
| 40008  | no tab config                        |
| 40011  | miniapp can not support on tab       |
