# 键盘 (keyboard)

### onKeyboardHeightChange

#### 功能描述

onKeyboardHeightChange 发送键盘事件给 js

> 需引入`BaseKit`，且在`>=3.6.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { onKeyboardHeightChange } from '@ray-js/ray'
onKeyboardHeightChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onKeyboardHeightChange({ ... })
```

#### 参数

**function listener**
onKeyboardHeightChange 发送键盘事件给 js
**参数**

| 属性   | 类型   | 默认值 | 必填 | 说明     |
| ------ | ------ | ------ | ---- | -------- |
| height | number |        | 是   | 键盘高度 |
### offKeyboardHeightChange

#### 功能描述

移除监听：onKeyboardHeightChange 发送键盘事件给 js

> 需引入`BaseKit`，且在`>=3.6.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { offKeyboardHeightChange } from '@ray-js/ray'
offKeyboardHeightChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offKeyboardHeightChange({ ... })
```

#### 参数

**function listener**

onKeyboardHeightChange 传入的监听函数。不传此参数则移除所有监听函数。
### onKeyboardWillShow

#### 功能描述

键盘弹出

> 需引入`BaseKit`，且在`>=3.6.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { onKeyboardWillShow } from '@ray-js/ray'
onKeyboardWillShow({ ... })
```

**原生小程序中使用**

```javascript
ty.onKeyboardWillShow({ ... })
```

#### 参数

**function listener**
键盘弹出
**参数**

| 属性   | 类型   | 默认值 | 必填 | 说明     |
| ------ | ------ | ------ | ---- | -------- |
| height | number |        | 是   | 键盘高度 |
### offKeyboardWillShow

#### 功能描述

移除监听：键盘弹出

> 需引入`BaseKit`，且在`>=3.6.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { offKeyboardWillShow } from '@ray-js/ray'
offKeyboardWillShow({ ... })
```

**原生小程序中使用**

```javascript
ty.offKeyboardWillShow({ ... })
```

#### 参数

**function listener**

onKeyboardWillShow 传入的监听函数。不传此参数则移除所有监听函数。
### onKeyboardWillHide

#### 功能描述

键盘消息

> 需引入`BaseKit`，且在`>=3.6.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { onKeyboardWillHide } from '@ray-js/ray'
onKeyboardWillHide({ ... })
```

**原生小程序中使用**

```javascript
ty.onKeyboardWillHide({ ... })
```

#### 参数

**function listener**
键盘消息
**参数**

| 属性   | 类型   | 默认值 | 必填 | 说明     |
| ------ | ------ | ------ | ---- | -------- |
| height | number |        | 是   | 键盘高度 |
### offKeyboardWillHide

#### 功能描述

移除监听：键盘消息

> 需引入`BaseKit`，且在`>=3.6.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { offKeyboardWillHide } from '@ray-js/ray'
offKeyboardWillHide({ ... })
```

**原生小程序中使用**

```javascript
ty.offKeyboardWillHide({ ... })
```

#### 参数

**function listener**

onKeyboardWillHide 传入的监听函数。不传此参数则移除所有监听函数。
