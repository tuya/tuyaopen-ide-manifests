# 界面 (ui)


## 交互

#### showModal

##### 功能描述

显示模态对话框

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showModal } from '@ray-js/ray'
showModal({ ... })
```

**原生小程序中使用**

```javascript
ty.showModal({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值      | 必填 | 说明                                                        |
| ------------ | -------- | ----------- | ---- | ----------------------------------------------------------- |
| title        | string   |             | 是   | 提示的标题                                                  |
| content      | string   |             | 否   | 提示的内容                                                  |
| showCancel   | boolean  | `true`      | 否   | 是否显示取消按钮                                            |
| cancelText   | string   | `"cancel"`  | 否   | 取消按钮的文字，最多 4 个字符                               |
| cancelColor  | string   |             | 是   | 取消按钮的文字颜色，必须是 16 进制格式的颜色字符串          |
| confirmText  | string   | `"confirm"` | 否   | 确认按钮的文字，最多 4 个字符                               |
| confirmColor | string   |             | 是   | 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串          |
| isShowGlobal | boolean  | `false`     | 否   | 是否全局弹窗，若为全局弹窗，弹在最顶上
`最低版本3.12.6` |
| success      | function |             | 否   | 接口调用成功的回调函数                                      |
| fail         | function |             | 否   | 接口调用失败的回调函数                                      |
| complete     | function |             | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）            |

##### 返回结果

**success**

| 属性    | 类型    | 说明                                                                                    |
| ------- | ------- | --------------------------------------------------------------------------------------- |
| confirm | boolean | 为 true 时，表示用户点击了确定按钮                                                      |
| cancel  | boolean | 为 true 时，表示用户点击了取消（用于 Android 系统区分点击蒙层关闭还是点击取消按钮关闭） |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9001   | Activity is invalid |
#### showActionSheet

##### 功能描述

显示操作菜单

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showActionSheet } from '@ray-js/ray'
showActionSheet({ ... })
```

**原生小程序中使用**

```javascript
ty.showActionSheet({ ... })
```

##### 请求参数

**Object object**

| 属性       | 类型     | 默认值      | 必填 | 说明                                             |
| ---------- | -------- | ----------- | ---- | ------------------------------------------------ |
| alertText  | string   |             | 否   | 警示文案                                         |
| itemList   | string[] |             | 是   | 按钮的文字数组，数组长度最大为 6                 |
| itemColor  | string   | `"#000000"` | 否   | 按钮的文字颜色                                   |
| itemColors | string[] |             | 否   | 按钮的文字颜色
`最低版本3.6.8`               |
| success    | function |             | 否   | 接口调用成功的回调函数                           |
| fail       | function |             | 否   | 接口调用失败的回调函数                           |
| complete   | function |             | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性     | 类型   | 说明                                          |
| -------- | ------ | --------------------------------------------- |
| tapIndex | number | 用户点击的按钮序号，从上到下的顺序，从 0 开始 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9001   | Activity is invalid               |
#### showLoading

##### 功能描述

显示 loading 提示框。需主动调用 thing.hideLoading 才能关闭提示框

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showLoading } from '@ray-js/ray'
showLoading({ ... })
```

**原生小程序中使用**

```javascript
ty.showLoading({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值  | 必填 | 说明                                             |
| -------- | -------- | ------- | ---- | ------------------------------------------------ |
| title    | string   |         | 是   | 提示的内容                                       |
| mask     | boolean  | `false` | 否   | 是否显示透明蒙层，防止触摸穿透                   |
| success  | function |         | 否   | 接口调用成功的回调函数                           |
| fail     | function |         | 否   | 接口调用失败的回调函数                           |
| complete | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### hideLoading

##### 功能描述

隐藏 loading 提示框

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideLoading } from '@ray-js/ray'
hideLoading({ ... })
```

**原生小程序中使用**

```javascript
ty.hideLoading({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### showToast

##### 功能描述

显示消息提示框

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showToast } from '@ray-js/ray'
showToast({ ... })
```

**原生小程序中使用**

```javascript
ty.showToast({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值      | 必填 | 说明                                             |
| -------- | -------- | ----------- | ---- | ------------------------------------------------ |
| title    | string   |             | 是   | 提示的内容                                       |
| icon     | string   | `"success"` | 否   | 图标 'success' / 'error' / 'loading' / 'none'    |
| image    | string   |             | 否   | 自定义图标的本地路径，image 的优先级高于 icon    |
| duration | number   | `1500`      | 否   | 提示的延迟时间（仅 iOS 生效）                    |
| mask     | boolean  | `false`     | 否   | 是否显示透明蒙层，防止触摸穿透                   |
| success  | function |             | 否   | 接口调用成功的回调函数                           |
| fail     | function |             | 否   | 接口调用失败的回调函数                           |
| complete | function |             | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9001   | Activity is invalid |
#### hideToast

##### 功能描述

隐藏消息提示框

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideToast } from '@ray-js/ray'
hideToast({ ... })
```

**原生小程序中使用**

```javascript
ty.hideToast({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

## 导航栏

#### setNavigationBarColor

##### 功能描述

设置页面导航条颜色

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setNavigationBarColor } from '@ray-js/ray'
setNavigationBarColor({ ... })
```

**原生小程序中使用**

```javascript
ty.setNavigationBarColor({ ... })
```

##### 请求参数

**Object object**

| 属性            | 类型                            | 默认值 | 必填 | 说明                                                                |
| --------------- | ------------------------------- | ------ | ---- | ------------------------------------------------------------------- |
| frontColor      | string                          |        | 是   | 前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000 |
| backgroundColor | string                          |        | 是   | 背景颜色值，有效值为十六进制颜色                                    |
| animation       | NavigationBarColorAnimationInfo |        | 是   | 动画效果                                                            |
| success         | function                        |        | 否   | 接口调用成功的回调函数                                              |
| fail            | function                        |        | 否   | 接口调用失败的回调函数                                              |
| complete        | function                        |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                    |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**NavigationBarColorAnimationInfo**

| 属性       | 类型   | 默认值     | 必填 | 说明                                                                                                                                               |
| ---------- | ------ | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| duration   | number | `0`        | 否   | 动画变化时间，单位 ms                                                                                                                              |
| timingFunc | string | `"linear"` | 否   | 动画变化方式
'linear' 动画从头到尾的速度是相同的
'easeIn' 动画以低速开始
'easeOut' 动画以低速结束
'easeInOut' 动画以低速开始和结束 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setNavigationBarColor } from '@ray-js/ray';
// 原生调用方式
const { setNavigationBarColor } = ty;

setNavigationBarColor({
  backgroundColor: '#ff0000',
  frontColor: '#ffffff',
  animation: {
    duration: 3000,
    timingFunc: 'easeIn'
  },
  success: () => {
    console.log('setNavigationBarColor success');
  }
});
```
#### setNavigationBarTitle

##### 功能描述

动态设置当前页面的标题

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setNavigationBarTitle } from '@ray-js/ray'
setNavigationBarTitle({ ... })
```

**原生小程序中使用**

```javascript
ty.setNavigationBarTitle({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| title    | string   |        | 是   | 页面标题                                         |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### hideHomeButton

##### 功能描述

隐藏返回首页按钮

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideHomeButton } from '@ray-js/ray'
hideHomeButton({ ... })
```

**原生小程序中使用**

```javascript
ty.hideHomeButton({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### showNavigationBarLoading

##### 功能描述

在当前页面显示导航条加载动画

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showNavigationBarLoading } from '@ray-js/ray'
showNavigationBarLoading({ ... })
```

**原生小程序中使用**

```javascript
ty.showNavigationBarLoading({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### hideNavigationBarLoading

##### 功能描述

在当前页面隐藏导航条加载动画

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideNavigationBarLoading } from '@ray-js/ray'
hideNavigationBarLoading({ ... })
```

**原生小程序中使用**

```javascript
ty.hideNavigationBarLoading({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

## 容器

#### startPullDownRefresh

##### 功能描述

开始下拉刷新。调用后触发当前页面下拉刷新动画，效果与用户手动下拉刷新一致。

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { startPullDownRefresh } from '@ray-js/ray'
startPullDownRefresh({ ... })
```

**原生小程序中使用**

```javascript
ty.startPullDownRefresh({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### stopPullDownRefresh

##### 功能描述

停止当前页面下拉刷新。

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { stopPullDownRefresh } from '@ray-js/ray'
stopPullDownRefresh({ ... })
```

**原生小程序中使用**

```javascript
ty.stopPullDownRefresh({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |

## Tab Bar

#### showTabBar

##### 功能描述

显示 tabBar

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showTabBar } from '@ray-js/ray'
showTabBar({ ... })
```

**原生小程序中使用**

```javascript
ty.showTabBar({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| animation | boolean  |        | 是   | 是否需要动画效果                                 |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { showTabBar } from '@ray-js/ray';
// 原生调用方式
const { showTabBar } = ty;

showTabBar({
  animation: true
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### hideTabBar

##### 功能描述

隐藏 tabBar

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideTabBar } from '@ray-js/ray'
hideTabBar({ ... })
```

**原生小程序中使用**

```javascript
ty.hideTabBar({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| animation | boolean  |        | 是   | 是否需要动画效果                                 |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { hideTabBar } from '@ray-js/ray';
// 原生调用方式
const { hideTabBar } = ty;

ty.hideTabBar({
  animation: true
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### setTabBarBadge

##### 功能描述

为 tabBar 某一项的右上角添加文本

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setTabBarBadge } from '@ray-js/ray'
setTabBarBadge({ ... })
```

**原生小程序中使用**

```javascript
ty.setTabBarBadge({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| index    | number   |        | 是   | tabBar 的哪一项，从左边算起                      |
| text     | string   |        | 是   | 显示的文本，超过 4 个字符则显示成 ...            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setTabBarBadge } from '@ray-js/ray';
// 原生调用方式
const { setTabBarBadge } = ty;

setTabBarBadge({
  index: 0,
  text: '99+'
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### setTabBarItem

##### 功能描述

动态设置 tabBar 某一项的内容

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setTabBarItem } from '@ray-js/ray'
setTabBarItem({ ... })
```

**原生小程序中使用**

```javascript
ty.setTabBarItem({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                             |
| ---------------- | -------- | ------ | ---- | ------------------------------------------------ |
| index            | number   |        | 是   | tabBar 的哪一项，从左边算起                      |
| text             | string   |        | 是   | tab 上的按钮文字                                 |
| iconPath         | string   |        | 是   | 图片路径                                         |
| selectedIconPath | string   |        | 是   | 选中时的图片路径                                 |
| success          | function |        | 否   | 接口调用成功的回调函数                           |
| fail             | function |        | 否   | 接口调用失败的回调函数                           |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setTabBarItem } from '@ray-js/ray';
// 原生调用方式
const { setTabBarItem } = ty;

setTabBarItem({
  index: 0,
  text: 'new title',
  iconPath: '/tabBar/component_selected.png', // public下资源
  selectedIconPath: '/tabBar/home.png' // public下资源
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### setTabBarStyle

##### 功能描述

动态设置 tabBar 的整体样式

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setTabBarStyle } from '@ray-js/ray'
setTabBarStyle({ ... })
```

**原生小程序中使用**

```javascript
ty.setTabBarStyle({ ... })
```

##### 请求参数

**Object object**

| 属性            | 类型     | 默认值 | 必填 | 说明                                             |
| --------------- | -------- | ------ | ---- | ------------------------------------------------ |
| color           | string   |        | 是   | tab 上的文字默认颜色                             |
| selectedColor   | string   |        | 是   | tab 上的文字选中时的颜色                         |
| backgroundColor | string   |        | 是   | tab 的背景色                                     |
| borderStyle     | string   |        | 是   | tabBar 上边框的颜色， 仅支持 black/white         |
| success         | function |        | 否   | 接口调用成功的回调函数                           |
| fail            | function |        | 否   | 接口调用失败的回调函数                           |
| complete        | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setTabBarStyle } from '@ray-js/ray';
// 原生调用方式
const { setTabBarStyle } = ty;

setTabBarStyle({
  color: '#00FFFF',
  selectedColor: '#FF00FF',
  backgroundColor: '#FFFF00',
  borderStyle: 'black'
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### showTabBarRedDot

##### 功能描述

显示 tabBar 某一项的右上角的红点

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showTabBarRedDot } from '@ray-js/ray'
showTabBarRedDot({ ... })
```

**原生小程序中使用**

```javascript
ty.showTabBarRedDot({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| index    | number   |        | 是   | tabBar 的哪一项，从左边算起                      |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { showTabBarRedDot } from '@ray-js/ray';
// 原生调用方式
const { showTabBarRedDot } = ty;

showTabBarRedDot({
  index: 0
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### hideTabBarRedDot

##### 功能描述

隐藏 tabBar 某一项的右上角的红点

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideTabBarRedDot } from '@ray-js/ray'
hideTabBarRedDot({ ... })
```

**原生小程序中使用**

```javascript
ty.hideTabBarRedDot({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| index    | number   |        | 是   | tabBar 的哪一项，从左边算起                      |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { hideTabBarRedDot } from '@ray-js/ray';
// 原生调用方式
const { hideTabBarRedDot } = ty;

hideTabBarRedDot({
  index: 0
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
#### removeTabBarBadge

##### 功能描述

移除 tabBar 某一项右上角的文本

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { removeTabBarBadge } from '@ray-js/ray'
removeTabBarBadge({ ... })
```

**原生小程序中使用**

```javascript
ty.removeTabBarBadge({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| index    | number   |        | 是   | tabBar 的哪一项，从左边算起                      |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { removeTabBarBadge } from '@ray-js/ray';
// 原生调用方式
const { removeTabBarBadge } = ty;

removeTabBarBadge({
  index: 0
});
```

##### 错误码

| 错误码 | 错误描述      |
| ------ | ------------- |
| 40008  | no tab config |
