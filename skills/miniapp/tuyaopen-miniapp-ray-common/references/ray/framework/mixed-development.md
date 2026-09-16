# 使用原生小程序自定义组件进行混合开发

您可以在 Ray 组件中直接使用小程序的自定义组件。包括支持原生 UI 组件库，如：[miniapp-components-plus](https://www.npmjs.com/package/@tuya-miniapp/miniapp-components-plus), [weui](https://github.com/wechat-miniprogram/weui-miniprogram)等等。

## 示例代码

以智能小程序的扩展组件库 `miniapp-components-plus` 为例:

```js
import * as React from 'react';
import { View } from '@ray-js/ray';
import Cells from '@tuya-miniapp/miniapp-components-plus/cells';
import Cell from '@tuya-miniapp/miniapp-components-plus/cell';

export default () => (
  <View>
    <Cells title="带说明的列表项">
      <Cell value="标题文字" footer="说明文字"></Cell>
      <Cell>
        <View>标题文字（使用slot）</View>
        <View slot="footer">说明文字</View>
      </Cell>
    </Cells>
  </View>
);
```

## 注意事项

### 对于小程序自定义组件的事件，请使用`bind`开头的事件。

#### 示例

```js
import React from 'react';
import { Button, View } from '@ray-js/ray';
import ActionSheet from '@tuya-miniapp/miniapp-components-plus/actionSheet';
export default function Demo() {
  const [isShowAtionSheet, setIsShowAtionSheet] = React.useState(false);
  const groups = [
    { text: '示例菜单', value: 1 },
    { text: '示例菜单', value: 2 },
    { text: '负向菜单', type: 'warn', value: 3 },
  ];
  return (
    <View>
      <Button
        onClick={() => {
          setIsShowAtionSheet(true);
        }}
      >
        点击弹出actionsheet
      </Button>
      <ActionSheet
        bindactiontap={(e) => {
          console.log('点击 ActionSheet 的按钮项', e);
        }}
        bindclose={(e) => {
          console.log('点击关闭');
          setIsShowAtionSheet(false);
        }}
        show={isShowAtionSheet}
        actions={groups}
        title="这是一个标题，可以为一行或者两行。"
      ></ActionSheet>
    </View>
  );
}
```

### 对于带有具名 `slot` 的组件，具名 `slot` 部分的最外层只能用 `View` 组件。

#### 错误

```js
import React from 'react';
import { Text, View } from '@ray-js/ray';
import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
export default () => (
  <View>
    <Badge>
      <Text slot="inner">Ray</Text>
    </Badge>
  </View>
);
```

#### 正确

```js
import React from 'react';
import { View } from '@ray-js/ray';
import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
export default () => (
  <View>
    <Badge>
      <View slot="inner">Ray</View>
    </Badge>
  </View>
);
```

### 不能在小程序自定义组件上使用 “Spread Attributes”。

#### 错误

```js
import React from 'react';
import { View } from '@ray-js/ray';
import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
export default () => {
  const badgeProps = {
    text: 1,
  };
  return (
    <View>
      <Badge {...badgeProps}>
        <View slot="inner">ray</View>
      </Badge>
    </View>
  );
};
```

#### 正确

```js
import React from 'react';
import { View } from '@ray-js/ray';
import Badge from '@tuya-miniapp/miniapp-components-plus/badge';
export default () => {
  return (
    <View>
      <Badge text={1}>
        <View slot="inner">ray</View>
      </Badge>
    </View>
  );
};
```
