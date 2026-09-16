# 表单组件 (form-component)

[AI-generated summary: Ray平台表单组件的完整参考文档，提供多种交互式输入和选择控件的API定义和使用示例。覆盖内容：Button、Checkbox、CheckboxGroup、Form、Input、Label、Picker、PickerView、PickerViewColumn、Radio、RadioGroup、Slider、Switch、Textarea、属性配置、事件处理、常见问题解决]

### Button

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

多端按钮基础组件，可用于进行强交互的操作。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `size` | `"default" \| "mini"` | 否 | `"default"` | 按钮的大小 |
| `type` | `"default" \| "primary" \| "warn"` | 否 | `"default"` | 按钮的样式类型 |
| `plain` | `boolean` | 否 | `false` | 按钮是否镂空，背景色透明 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `loading` | `boolean` | 否 | `false` | 名称前是否带 loading 图标 |
| `formType` | `"submit" \| "reset"` | 否 | - | 用于 form 组件，点击分别会触发 form 组件的 submit/reset 事件 |
| `hoverStartTime` | `number` | 否 | `20` | 按住后多久出现点击态，单位毫秒 |
| `hoverStayTime` | `number` | 否 | `70` | 手指松开后点击态保留时间，单位毫秒 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Button, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Button>默认按钮</Button>
      <Button style={{ marginTop: '10px' }}>普通按钮</Button>
    </View>
  );
}
```

##### 按钮类型

```tsx
import React from 'react';
import { Button, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Button type="primary">主要按钮</Button>
      <Button type="default" style={{ marginTop: '10px' }}>
        默认按钮
      </Button>
      <Button type="warn" style={{ marginTop: '10px' }}>
        警告按钮
      </Button>
      <Button disabled> Disabled </Button>
    </View>
  );
}
```

##### 按钮尺寸

```tsx
import React from 'react';
import { Button, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Button size="default">默认尺寸</Button>
      <Button size="mini" style={{ marginTop: '10px' }}>
        迷你尺寸
      </Button>
    </View>
  );
}
```

##### 按钮状态

```tsx
import React from 'react';
import { Button, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Button loading>加载中</Button>
      <Button disabled style={{ marginTop: '10px' }}>
        禁用状态
      </Button>
      <Button plain type="primary" style={{ marginTop: '10px' }}>
        镂空按钮
      </Button>
    </View>
  );
}
```

##### Hover 点击态与表单

```tsx
import React from 'react';
import { Button, Form, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Button
        hoverStartTime={50}
        hoverStayTime={200}
      >
        自定义 Hover 效果
      </Button>
      <Form
        onSubmit={(e) => console.log('提交:', e.detail.value)}
        onReset={() => console.log('重置')}
      >
        <Button formType="submit" type="primary" style={{ marginTop: '10px' }}>
          提交表单
        </Button>
        <Button formType="reset" style={{ marginTop: '10px' }}>
          重置表单
        </Button>
      </Form>
    </View>
  );
}
```
### Checkbox

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

多选框，用于在选项列表中开启或关闭单项选择。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `value` | `string` | 否 | - | 选中时触发所属 checkbox-group 的 change 事件，并携带该 value |
| `checked` | `boolean` | 否 | `false` | 当前是否选中，可作默认选中 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `color` | `string` | 否 | `"#007AFF"` | 多选框颜色，同 CSS color |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Checkbox, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Checkbox checked />
    </View>
  );
}
```

##### 不同状态

```tsx
import React from 'react';
import { Checkbox, View, Text } from '@ray-js/ray';

export default function () {
  const [checked, setChecked] = React.useState(false);

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '10px' }}>
        <Text>默认状态：</Text>
        <Checkbox />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>选中状态：</Text>
        <Checkbox checked />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>禁用状态：</Text>
        <Checkbox disabled />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>自定义颜色：</Text>
        <Checkbox color="#ff0000" checked />
      </View>
    </View>
  );
}
```
### CheckboxGroup

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

多项选择器组，由多个 Checkbox 组成。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 否 | - | 表单名称 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `options` | `CheckboxGroupOption[]` | 否 | - | 选项列表 |
| `onChange` | `(event: CheckboxGroupChangeEvent) => void` | 否 | - | 选中项发生改变时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { CheckboxGroup, Label, Checkbox } from '@ray-js/ray';

export default function () {
  const options = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Pear', value: 'Pear' },
  ];

  return (
    <CheckboxGroup onChange={(e) => console.log('选中值:', e.detail.value)}>
      {options.map((item) => (
        <Label key={item.value}>
          <Checkbox value={item.value} />
          {item.label}
        </Label>
      ))}
    </CheckboxGroup>
  );
}
```

##### options 数据驱动

```tsx
import React from 'react';
import { CheckboxGroup, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>使用 options 渲染:</Text>
      <CheckboxGroup
        name="fruits"
        disabled={false}
        options={[
          { label: '苹果', value: 'apple', checked: true },
          { label: '香蕉', value: 'banana' },
          { label: '葡萄', value: 'grape', disabled: true },
        ]}
        onChange={(e) => console.log('选中:', e.detail.value)}
      />
    </View>
  );
}
```
### Form

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

表单容器，用于收集并提交其内部控件的输入值。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `onSubmit` | `(event: FormSubmitEvent) => void` | 否 | - | 携带 form 中的数据，提交时触发 |
| `onReset` | `(event: FormResetEvent) => void` | 否 | - | 表单重置时触发 |

#### 示例代码

##### 基础用法

```tsx
import React, { useState } from 'react';
import { Button, Input, Switch, View, Form, Text } from '@ray-js/ray';

export default function () {
  const [resultData, setResultData] = useState({});

  return (
    <View style={{ padding: '20px' }}>
      <Form
        onSubmit={(e) => {
          console.log('提交表单:', e.detail.value);
          setResultData(e.detail.value);
        }}
        onReset={() => {
          console.log('重置表单');
          setResultData({});
        }}
      >
        <View style={{ marginBottom: '16px' }}>
          <Text>开关:</Text>
          <Switch name="switch" />
        </View>
        <View style={{ marginBottom: '16px' }}>
          <Text>输入框:</Text>
          <Input name="input" placeholder="请输入" />
        </View>
        <Button formType="submit" type="primary">
          提交
        </Button>
        <Button formType="reset" style={{ marginTop: '10px' }}>
          重置
        </Button>
      </Form>
    </View>
  );
}
```
### Input

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

输入框组件，支持多种输入类型和键盘配置。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `value` | `string` | 否 | - | 输入框的内容 |
| `type` | `"text" \| "number" \| "digit"` | 否 | `"text"` | 输入类型 |
| `password` | `boolean` | 否 | - | 是否为密码输入框 |
| `placeholder` | `string` | 否 | - | 输入框为空时占位符 |
| `placeholderStyle` | `any \| string` | 否 | - | 占位符的样式 |
| `disabled` | `boolean` | 否 | - | 是否禁用 |
| `maxLength` | `number` | 否 | `140` | 最大输入长度，设置为 -1 的时候不限制最大长度 |
| `confirmType` | `"send" \| "search" \| "next" \| "go" \| "done"` | 否 | `"done"` | 设置键盘右下角按钮的文字，仅在 type='text' 时生效 |
| `onInput` | `(event: InputInputEvent) => void` | 否 | - | 键盘输入时触发 |
| `onConfirm` | `(event: InputConfirmEvent) => void` | 否 | - | 点击完成按钮时触发 |
| `onFocus` | `(event: InputFocusEvent) => void` | 否 | - | 输入框聚焦时触发 |
| `onBlur` | `(event: InputBlurEvent) => void` | 否 | - | 输入框失去焦点时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Input, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Input
        placeholder="请输入内容"
        onInput={(e) => console.log('输入:', e.detail.value)}
      />
    </View>
  );
}
```

##### 不同类型

```tsx
import React, { useState } from 'react';
import { Input, View, Text } from '@ray-js/ray';

export default function () {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Text>文本输入:</Text>
        <Input
          type="text"
          placeholder="请输入文本"
          value={textValue}
          onInput={(e) => setTextValue(e.detail.value)}
          style={{ marginTop: '8px' }}
        />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>数字输入:</Text>
        <Input
          type="number"
          placeholder="请输入数字"
          value={numberValue}
          onInput={(e) => setNumberValue(e.detail.value)}
          style={{ marginTop: '8px' }}
        />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>密码输入:</Text>
        <Input
          password
          placeholder="请输入密码"
          value={passwordValue}
          onInput={(e) => setPasswordValue(e.detail.value)}
          style={{ marginTop: '8px' }}
        />
      </View>
    </View>
  );
}
```

##### 输入限制与禁用

```tsx
import React from 'react';
import { Input, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Text>最大长度 10:</Text>
        <Input
          maxLength={10}
          placeholder="最多输入 10 个字符"
          placeholderStyle={{ color: '#ccc', fontSize: '14px' }}
          style={{ marginTop: '8px' }}
        />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>禁用状态:</Text>
        <Input
          disabled
          value="不可编辑"
          style={{ marginTop: '8px' }}
        />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>确认按钮为搜索:</Text>
        <Input
          confirmType="search"
          placeholder="输入后点键盘搜索"
          onConfirm={(e) => console.log('确认:', e.detail.value)}
          onFocus={(e) => console.log('聚焦:', e.detail.value)}
          onBlur={(e) => console.log('失焦:', e.detail.value)}
          style={{ marginTop: '8px' }}
        />
      </View>
    </View>
  );
}
```

### 常见问题（FAQ）

#### 输入框是否支持点击事件，比如 tap、touch？

支持，所有的组件都支持 `tap`、`touch` 事件

#### input 如何用 js 代码清空数据？

通过`setData` 给属性 `value` 设置为空，需要保证`setData`数值有变化。

#### input 内容跳动、延迟如何处理？

可以使用防抖函数。避免 `onInput` 的时候频繁更新。

#### iOS 在输入中文的时候出现丢焦情况，怎么办？

`iOS`的`input`在`onInput`中执行`setData`会导致在输入中文的时候丢焦。① 可对`setData`执行防抖操作 ②`onInput`的时候将数据存储在
`this`下，避免一直 触发`setData`操作。

#### input 支持自动聚焦吗？（autofocus）

- 不支持自动聚焦（autofocus），必须用户行为唤起
### Label

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

标签，用于提升表单可用性：可通过 htmlFor 关联控件，或包裹控件扩大点击区域。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `htmlFor` | `string` | 否 | - | 绑定控件的 id |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View, Checkbox, Text, Label } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Label>
        <Checkbox />
        <Text style={{ marginLeft: '8px' }}>点击文本也可以选中</Text>
      </Label>
    </View>
  );
}
```

##### htmlFor 绑定

```tsx
import React from 'react';
import { View, Checkbox, Radio, Switch, Text, Label } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Checkbox id="checkbox1" />
        <Label htmlFor="checkbox1">
          <Text style={{ marginLeft: '8px' }}>通过 htmlFor 控制 Checkbox</Text>
        </Label>
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Radio id="radio1" />
        <Label htmlFor="radio1">
          <Text style={{ marginLeft: '8px' }}>通过 htmlFor 控制 Radio</Text>
        </Label>
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Switch id="switch1" />
        <Label htmlFor="switch1">
          <Text style={{ marginLeft: '8px' }}>通过 htmlFor 控制 Switch</Text>
        </Label>
      </View>
    </View>
  );
}
```
### Picker

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

从底部弹起的滚动选择器，支持普通、多列、时间与日期四种模式。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `name` | `string` | 否 | - | - | 表单控件名称，提交表单时作为键名 |
| `mode` | `"selector" \| "multiSelector" \| "time" \| "date"` | 否 | `"selector"` | - | 选择器类型selector：普通选择器；multiSelector：多列选择器；time：时间；date：日期 |
| `disabled` | `boolean` | 否 | `false` | - | 是否禁用 |
| `range` | `string \| number \| Record<string, unknown>[] \| string \| number \| Record<string, unknown>[][]` | 否 | `[]` | - | mode 为 selector 或 multiSelector 时有效，为单列或多列数据源 |
| `rangeKey` | `string` | 否 | `""` | - | 当 range 为对象数组时，指定用于展示文本的对象字段名 |
| `value` | `number \| number[] \| string` | 否 | `""` | - | 选中值：selector 为下标；multiSelector 为下标数组；time/date 为字符串，格式为"hh:mm"/"YYYY-MM-DD"； |
| `start` | `string` | 否 | `""` | - | mode 为 time 时表示有效时间范围开始，格式 hh:mm；mode 为 date 时为 YYYY-MM-DD |
| `end` | `string` | 否 | `""` | - | mode 为 time 时表示有效时间范围结束，格式 hh:mm；mode 为 date 时为 YYYY-MM-DD |
| `fields` | `"year" \| "month" \| "day"` | 否 | `"day"` | - | mode 为 date 时，粒度：年 / 月 / 日 |
| `cancelText` | `string` | 否 | `"取消"` | - | 取消按钮文案 |
| `confirmText` | `string` | 否 | `"确定"` | - | 确定按钮文案 |
| `onCancel` | `(event: PickerCancelEvent) => void` | 否 | - | `1.9.90` | 取消选择时触发 |
| `onChange` | `(event: PickerChangeEvent) => void` | 否 | - | - | 滚动选择器变更时触发（确定选择后） |
| `onColumnChange` | `(event: PickerColumnChangeEvent) => void` | 否 | - | - | 多列选择器某一列变更时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Picker, View, Text } from '@ray-js/ray';

export default function () {
  const [current, setCurrent] = React.useState(0);
  const range = ['美国', '中国', '巴西', '日本'];

  return (
    <View style={{ padding: '20px' }}>
      <Picker
        mode="selector"
        onChange={(e) => {
          console.log('选择器改变:', e.detail.value);
          setCurrent(e.detail.value);
        }}
        range={range}
        value={current}
      >
        <View style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Text>当前选择: {range[current]}</Text>
        </View>
      </Picker>
    </View>
  );
}
```

##### 时间选择器

```tsx
import React from 'react';
import { Picker, View, Text } from '@ray-js/ray';

export default function () {
  const [time, setTime] = React.useState('12:00');

  return (
    <View style={{ padding: '20px' }}>
      <Picker
        mode="time"
        value={time}
        start="09:00"
        end="18:00"
        onChange={(e) => {
          console.log('时间改变:', e.detail.value);
          setTime(e.detail.value);
        }}
      >
        <View style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Text>当前时间: {time}</Text>
        </View>
      </Picker>
    </View>
  );
}
```

##### 日期选择器

```tsx
import React from 'react';
import { Picker, View, Text } from '@ray-js/ray';

export default function () {
  const [date, setDate] = React.useState('2026-01-01');

  return (
    <View style={{ padding: '20px' }}>
      <Picker
        mode="date"
        value={date}
        start="2020-01-01"
        end="2030-12-31"
        fields="day"
        onChange={(e) => {
          console.log('日期改变:', e.detail.value);
          setDate(e.detail.value);
        }}
        onCancel={() => console.log('取消选择')}
      >
        <View style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Text>当前日期: {date}</Text>
        </View>
      </Picker>
    </View>
  );
}
```

##### 多列选择器

```tsx
import React from 'react';
import { Picker, View, Text } from '@ray-js/ray';

export default function () {
  const [value, setValue] = React.useState([0, 0]);
  const range = [
    ['广东', '浙江', '江苏'],
    ['广州', '杭州', '南京'],
  ];

  return (
    <View style={{ padding: '20px' }}>
      <Picker
        mode="multiSelector"
        range={range}
        value={value}
        disabled={false}
        confirmText="确定"
        cancelText="取消"
        onChange={(e) => {
          console.log('多列选择:', e.detail.value);
          setValue(e.detail.value);
        }}
        onColumnChange={(e) => console.log('列变更:', e.detail.column, e.detail.value)}
        onCancel={() => console.log('取消选择')}
      >
        <View style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Text>当前选择: {range[0][value[0]]} - {range[1][value[1]]}</Text>
        </View>
      </Picker>
    </View>
  );
}
```
### PickerView

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

嵌入页面的滚动选择器。其中只可放置 PickerViewColumn 组件，其它节点不会显示。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `value` | `number[]` | 否 | - | 数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项（下标从 0 开始），数字大于 picker-view-column 可选项长度时，选择最后一项 |
| `indicatorStyle` | `string \| any` | 否 | - | 设置选择器中间选中框的样式（对象或 CSS 声明字符串） |
| `maskStyle` | `string \| any` | 否 | - | 设置蒙层的样式（对象或 CSS 声明字符串） |
| `onChange` | `(event: PickerViewChangeEvent) => void` | 否 | - | 滚动选择时触发 |
| `onPickstart` | `(event: PickerViewPickstartEvent) => void` | 否 | - | 当滚动选择开始时触发 |
| `onPickend` | `(event: PickerViewPickendEvent) => void` | 否 | - | 当滚动选择结束时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { PickerView, PickerViewColumn, View, Text } from '@ray-js/ray';

export default function () {
  const [current, setCurrent] = React.useState([0]);
  const range = ['巴西', '中国', '日本', '美国'];

  return (
    <View style={{ padding: '20px' }}>
      <Text>当前选择: {range[current[0]]}</Text>
      <PickerView
        onChange={(e) => {
          console.log('选择改变:', e.detail.value);
          setCurrent(e.value);
        }}
        value={current}
        style={{ height: '200px', marginTop: '10px' }}
      >
        <PickerViewColumn>
          {range.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>
              {item}
            </View>
          ))}
        </PickerViewColumn>
      </PickerView>
    </View>
  );
}
```

##### 多列选择

```tsx
import React from 'react';
import { PickerView, PickerViewColumn, View, Text } from '@ray-js/ray';

export default function () {
  const [current, setCurrent] = React.useState([0, 0, 0]);

  const years = ['2020', '2021', '2022', '2023', '2024'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <View style={{ padding: '20px' }}>
      <Text>
        当前日期: {years[current[0]]}-{months[current[1]]}-{days[current[2]]}
      </Text>
      <PickerView
        onChange={(e) => {
          console.log('日期改变:', e.detail.value);
          setCurrent(e.detail.value);
        }}
        value={current}
        style={{ height: '200px', marginTop: '10px' }}
        onPickstart={() => console.log('开始滚动')}
        onPickend={() => console.log('结束滚动')}
      >
        <PickerViewColumn>
          {years.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>{item}</View>
          ))}
        </PickerViewColumn>
        <PickerViewColumn>
          {months.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>{item}</View>
          ))}
        </PickerViewColumn>
        <PickerViewColumn>
          {days.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>{item}</View>
          ))}
        </PickerViewColumn>
      </PickerView>
    </View>
  );
}
```
### PickerViewColumn

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

滚动选择器子项，仅可放置于 PickerView 中，高度自动与选中框一致。

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { PickerView, PickerViewColumn, View, Text } from '@ray-js/ray';

export default function () {
  const [current, setCurrent] = React.useState([0]);
  const range = ['巴西', '中国', '日本', '美国'];

  return (
    <View style={{ padding: '20px' }}>
      <Text>当前选择: {range[current[0]]}</Text>
      <PickerView
        onChange={(e) => setCurrent(e.value)}
        value={current}
        style={{ height: '200px', marginTop: '10px' }}
      >
        <PickerViewColumn>
          {range.map((item, index) => (
            <View
              key={index}
              style={{
                textAlign: 'center',
                lineHeight: '36px',
              }}
            >
              {item}
            </View>
          ))}
        </PickerViewColumn>
      </PickerView>
    </View>
  );
}
```

##### 多列使用

```tsx
import React from 'react';
import { PickerView, PickerViewColumn, View, Text } from '@ray-js/ray';

export default function () {
  const [current, setCurrent] = React.useState([0, 0]);
  const provinces = ['广东', '浙江', '江苏', '北京'];
  const cities = ['深圳', '广州', '东莞', '佛山'];

  return (
    <View style={{ padding: '20px' }}>
      <Text>
        当前选择: {provinces[current[0]]} - {cities[current[1]]}
      </Text>
      <PickerView
        onChange={(e) => setCurrent(e.value)}
        value={current}
        style={{ height: '200px', marginTop: '10px' }}
      >
        <PickerViewColumn>
          {provinces.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>
              {item}
            </View>
          ))}
        </PickerViewColumn>
        <PickerViewColumn>
          {cities.map((item, index) => (
            <View key={index} style={{ textAlign: 'center', lineHeight: '36px' }}>
              {item}
            </View>
          ))}
        </PickerViewColumn>
      </PickerView>
    </View>
  );
}
```
### Radio

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

单选框，用于在一组互斥选项中选中其中一项。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `value` | `string` | 否 | - | radio 标识；该 radio 选中时，radio-group 的 change 事件会携带其 value |
| `checked` | `boolean` | 否 | `false` | 当前是否选中，可作默认选中 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `color` | `string` | 否 | `"#007AFF"` | radio 的颜色，同 CSS 的 color |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Radio, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Radio checked />
    </View>
  );
}
```

##### 不���状态

```tsx
import React from 'react';
import { Radio, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '10px' }}>
        <Text>默认状态：</Text>
        <Radio />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>选中状态：</Text>
        <Radio checked />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>禁用状态：</Text>
        <Radio disabled />
      </View>
      <View style={{ marginBottom: '10px' }}>
        <Text>自定义颜色：</Text>
        <Radio color="#ff0000" checked />
      </View>
    </View>
  );
}
```
### RadioGroup

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

单选选择器组，由多个 Radio 组成。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 否 | - | 表单名称 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `options` | `RadioGroupOption[]` | 否 | - | 选项列表 |
| `onChange` | `(event: RadioGroupChangeEvent) => void` | 否 | - | 选中项发生改变时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { RadioGroup, Radio, Label } from '@ray-js/ray';

export default function () {
  const options = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Pear', value: 'Pear' },
  ];

  return (
    <RadioGroup onChange={(e) => console.log('选中值:', e.detail.value)}>
      {options.map((item) => (
        <Label key={item.value}>
          <Radio value={item.value} />
          {item.label}
        </Label>
      ))}
    </RadioGroup>
  );
}
```

##### options 数据驱动

```tsx
import React from 'react';
import { RadioGroup, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px' }}>使用 options 渲染:</Text>
      <RadioGroup
        name="fruit"
        disabled={false}
        options={[
          { label: '苹果', value: 'apple', checked: true },
          { label: '香蕉', value: 'banana' },
          { label: '葡萄', value: 'grape', disabled: true },
        ]}
        onChange={(e) => console.log('选中:', e.detail.value)}
      />
    </View>
  );
}
```
### Slider

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

滑动选择器，通过拖动滑块在数值区间内选取结果。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `min` | `number` | 否 | `0` | 最小值 |
| `max` | `number` | 否 | `100` | 最大值 |
| `step` | `number` | 否 | `1` | 步长，取值必须大于 0，并且可被 (max - min) 整除 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `value` | `number` | 否 | `0` | 当前取值 |
| `activeColor` | `string` | 否 | `"#007AFF"` | 已选择的颜色 |
| `backgroundColor` | `string` | 否 | `"rgba(0, 0, 0, 0.2)"` | 背景条的颜色 |
| `blockSize` | `number` | 否 | `28` | 滑块的大小，取值范围为 12～28 |
| `blockColor` | `string` | 否 | `"#FFF"` | 滑块的颜色 |
| `showValue` | `boolean` | 否 | `false` | 是否显示当前 value |
| `onChange` | `(event: SliderChangeEvent) => void` | 否 | - | 完成一次拖动后触发 |
| `onChanging` | `(event: SliderChangingEvent) => void` | 否 | - | 拖动过程中触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Slider, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Slider
        onChange={(e) => {
          console.log('Slider 改变:', e.detail.value);
        }}
      />
    </View>
  );
}
```

##### 自定义样式

```tsx
import React, { useState } from 'react';
import { Slider, View, Text } from '@ray-js/ray';

export default function () {
  const [value, setValue] = useState(100);

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '20px' }}>
        <Text>显示数值:</Text>
        <Slider
          value={value}
          showValue
          onChange={(e) => setValue(e.detail.value)}
          style={{ marginTop: '10px' }}
        />
      </View>
      <View style={{ marginBottom: '20px' }}>
        <Text>自定义范围和步长:</Text>
        <Slider
          min={50}
          max={200}
          step={5}
          value={value}
          showValue
          onChange={(e) => setValue(e.detail.value)}
          style={{ marginTop: '10px' }}
        />
      </View>
      <View style={{ marginBottom: '20px' }}>
        <Text>自定义颜色:</Text>
        <Slider
          value={value}
          activeColor="orange"
          blockColor="pink"
          backgroundColor="#e0e0e0"
          onChange={(e) => setValue(e.detail.value)}
          style={{ marginTop: '10px' }}
        />
      </View>
    </View>
  );
}
```

##### 禁用与拖动事件

```tsx
import React from 'react';
import { Slider, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '20px' }}>
        <Text>禁用状态:</Text>
        <Slider disabled value={40} style={{ marginTop: '10px' }} />
      </View>
      <View style={{ marginBottom: '20px' }}>
        <Text>自定义滑块大小 + 拖动中事件:</Text>
        <Slider
          blockSize={18}
          showValue
          onChanging={(e) => console.log('拖动中:', e.detail.value)}
          onChange={(e) => console.log('拖动结束:', e.detail.value)}
          style={{ marginTop: '10px' }}
        />
      </View>
    </View>
  );
}
```
### Switch

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

开关选择器，用于在两种互斥状态间切换。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | 否 | - | 当前是否选中 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `color` | `string` | 否 | `"#007AFF"` | 开关颜色，同 CSS 的 color |
| `type` | `"switch" \| "checkbox"` | 否 | `"switch"` | 样式类型，可选 switch、checkbox |
| `onChange` | `(event: SwitchChangeEvent) => void` | 否 | - | 选中状态改变时触发，detail 含 value |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Switch, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Switch
        onChange={(e) => {
          console.log('Switch 改变:', e.detail.value);
        }}
      />
    </View>
  );
}
```

##### 不同状态

```tsx
import React, { useState } from 'react';
import { Switch, View, Text } from '@ray-js/ray';

export default function () {
  const [checked, setChecked] = useState(false);

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Text>受控开关:</Text>
        <Switch
          checked={checked}
          onChange={(e) => {
            console.log('Switch 改变:', e.detail.value);
            setChecked(e.detail.value);
          }}
          style={{ marginTop: '8px' }}
        />
        <Text style={{ marginTop: '8px' }}>当前状态: {checked ? '开' : '关'}</Text>
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>自定义颜色:</Text>
        <Switch color="#ff0000" checked style={{ marginTop: '8px' }} />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>禁用状态:</Text>
        <Switch disabled style={{ marginTop: '8px' }} />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>Checkbox 类型:</Text>
        <Switch type="checkbox" checked style={{ marginTop: '8px' }} />
      </View>
    </View>
  );
}
```
### Textarea

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

文本域，用于多行文本输入与编辑。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 否 | - | 表单名称 |
| `value` | `string` | 否 | - | 输入框的内容 |
| `placeholder` | `string` | 否 | - | 输入框为空时占位符 |
| `placeholderStyle` | `string \| any` | 否 | - | 指定 placeholder 的样式，目前仅支持 color、fontSize 和 fontWeight（对象或 CSS 声明字符串） |
| `disabled` | `boolean` | 否 | `false` | 是否禁用 |
| `maxLength` | `number` | 否 | `140` | 最大输入长度，设置为 -1 的时候不限制最大长度 |
| `autoHeight` | `boolean` | 否 | `false` | 是否自动增高，设置 autoHeight 时，style.height 不生效 |
| `onInput` | `(event: TextareaInputEvent) => void` | 否 | - | 当键盘输入时触发 |
| `onFocus` | `(event: TextareaFocusEvent) => void` | 否 | - | 输入框聚焦时触发 |
| `onBlur` | `(event: TextareaBlurEvent) => void` | 否 | - | 输入框失去焦点时触发 |
| `onLinechange` | `(event: TextareaLineChangeEvent) => void` | 否 | - | 输入框行数变化时触发，detail 含 height、lineCount 等 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Textarea, View } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Textarea placeholder="请输入内容..." />
    </View>
  );
}
```

##### 多行输入

```tsx
import React, { useState } from 'react';
import { Textarea, Button, View, Text } from '@ray-js/ray';

export default function () {
  const [value, setValue] = useState('');

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Textarea
          value={value}
          placeholder="请输入..."
          maxLength={200}
          onInput={(e) => setValue(e.value)}
          style={{ marginTop: '8px', minHeight: '80px' }}
        />
        <Text style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
          已输入 {value.length} / 200 字符
        </Text>
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>自动增高:</Text>
        <Textarea
          autoHeight
          placeholder="输入内容会自动增高..."
          style={{ marginTop: '8px', minHeight: '40px' }}
        />
      </View>
    </View>
  );
}
```

##### 禁用与事件

```tsx
import React from 'react';
import { Textarea, View, Text } from '@ray-js/ray';

export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '16px' }}>
        <Text>禁用状态:</Text>
        <Textarea
          disabled
          value="不可编辑的内容"
          placeholderStyle={{ color: '#ccc' }}
          style={{ marginTop: '8px' }}
        />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text>事件监听:</Text>
        <Textarea
          name="feedback"
          placeholder="输入反馈内容..."
          onFocus={(e) => console.log('聚焦:', e.detail.value)}
          onBlur={(e) => console.log('失焦:', e.detail.value)}
          onLinechange={(e) => console.log('行数变化:', e.detail.lineCount)}
          style={{ marginTop: '8px', minHeight: '80px' }}
        />
      </View>
    </View>
  );
}
```
