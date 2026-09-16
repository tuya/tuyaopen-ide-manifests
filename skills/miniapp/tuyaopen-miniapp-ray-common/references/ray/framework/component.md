# 组件

## 组件名

所有组件名称都是首字母大写的驼峰形式，如：

```js
import { View, Text, Image, ... } from '@ray-js/ray'
```

## 组件属性

Ray 按照 React 的风格来命名小程序属性，如：

Ray:

```xml
<View className="view" style={{ display: 'flex' }} onTap={handleClick} />
```

对应微信小程序：

```xml
<view class="view" style="display: flex;" bindtap="handleClick"></view>
```
