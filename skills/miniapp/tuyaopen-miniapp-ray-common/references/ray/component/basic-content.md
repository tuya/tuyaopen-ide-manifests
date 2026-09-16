# 基础内容 (basic-content)

[AI-generated summary: 本文档介绍Ray框架中的基础内容组件库，包含文本、图标、进度条、富文本等常用组件的完整使用指南和API文档。提供了丰富的代码示例和样式定制方案，帮助开发者快速集成这些基础组件到Tuya Miniapp应用中。覆盖内容：Text、Icon、Progress、RichText、userSelect、type、size、color、percent、showInfo、borderRadius、fontSize、strokeWidth、activeColor、backgroundColor、active、activeMode、nodes、onSelect、HTML节点、属性表]

### Text

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

文本内容组件，用于显示文本信息。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `userSelect` | `boolean` | 否 | `false` | 文本是否可选 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, color: '#333' }}>这是一段普通文本</Text>
    </View>
  );
}
```

##### 可选择文本

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <Text userSelect style={{ fontSize: 16, color: '#007aff', lineHeight: '24px' }}>
        这段文字设置了 userSelect，长按可以选中并复制。
      </Text>
      <Text style={{ fontSize: 16, marginTop: 12, color: '#999' }}>
        这段文字未设置 userSelect，无法选中。
      </Text>
    </View>
  );
}
```
### Icon

> [VERSION] @ray-js/ray >= 0.5.10 | @ray-js/icons >= 1.6.0

#### 描述

图标组件，提供丰富的图标库，支持自定义大小和颜色。@ray-js/ray@1.6.0 版本之后不再内置 Icon 组件，需要单独安装 @ray-js/icons。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `type` | `"icon-warning" \| "icon-right" \| "icon-up" \| "icon-down" \| "icon-right-copy" \| "icon-right-copy1" \| "icon-a-cloudsunboltfill" \| "icon-a-cloudhailfill" \| "icon-a-cloudrainfill" \| "icon-deskclock" \| "icon-a-cloudsleetfill" \| "icon-a-arrowtrianglecapsulepath" \| "icon-a-cloudfogfill" \| "icon-a-clouddrizzlefill" \| "icon-a-cloudsunrainfill" \| "icon-a-crownfill" \| "icon-a-deskclockfill" \| "icon-a-envelopeopenfill" \| "icon-a-desktopcomputerandarrowdown" \| "icon-a-ferryfill" \| "icon-a-dropfill" \| "icon-a-cloudmoonfill" \| "icon-a-icloudandarrowdownfill" \| "icon-a-heartfill" \| "icon-a-icloudcirclefill" \| "icon-a-giftfill" \| "icon-a-handpointupleftfill" \| "icon-icon" \| "icon-a-exclamationmarkicloudfill" \| "icon-a-facesmilingfill" \| "icon-a-cloudsunfill" \| "icon-a-figurewalk" \| "icon-a-envelopebadge" \| "icon-a-locationnorthfill" \| "icon-a-minussquarefill" \| "icon-a-icloudslashfill" \| "icon-a-lockicloudfill" \| "icon-a-flamefill" \| "icon-left" \| "icon-a-linkicloudfill" \| "icon-a-micfill" \| "icon-icon-2" \| "icon-a-latch2casefill" \| "icon-a-exclamationmarkbubblefill" \| "icon-a-pausefill" \| "icon-a-paintbrushfill" \| "icon-a-moonfill" \| "icon-a-keyicloudfill" \| "icon-a-messagefill" \| "icon-a-envelopefill" \| "icon-a-moonstarsfill" \| "icon-a-icloudandarrowupfill" \| "icon-checkmark-3" \| "icon-a-locationcirclefill" \| "icon-a-forwardendaltfill" \| "icon-a-clockfill" \| "icon-bonjour" \| "icon-a-icloudcircle" \| "icon-a-leaffill" \| "icon-a-paintbrushpointedfill" \| "icon-a-cloudsnowfill" \| "icon-a-playfill" \| "icon-a-plussquarefill" \| "icon-a-minuscirclefill" \| "icon-a-personicloudfill" \| "icon-a-phonefill" \| "icon-a-pawprintfill" \| "icon-plus" \| "icon-a-scribblevariable" \| "icon-a-phoneandwaveformfill" \| "icon-a-phonedownfill" \| "icon-a-pluscirclefill" \| "icon-a-repeat1" \| "icon-a-printerfillandpaperfill" \| "icon-a-scrollfill" \| "icon-snow" \| "icon-a-speakerwave1fill" \| "icon-scissors" \| "icon-a-playrectanglefill" \| "icon-a-globeamericasfill" \| "icon-a-dotradiowavesleftandright" \| "icon-minus" \| "icon-a-stopfill" \| "icon-a-suitcasefill" \| "icon-a-sunrisefill" \| "icon-a-thermometersunfill" \| "icon-a-trainsidefrontcar" \| "icon-a-speakerwave3fill" \| "icon-a-cloudheavyrainfill" \| "icon-a-eyedropperhalffull" \| "icon-a-sunminfill" \| "icon-a-sunsetfill" \| "icon-a-timersquare" \| "icon-stopwatch" \| "icon-thermometer" \| "icon-repeat" \| "icon-a-stopwatchfill" \| "icon-a-sunmaxfill" \| "icon-a-icloudfill" \| "icon-a-tramfill" \| "icon-tornado" \| "icon-a-videoslashfill" \| "icon-personalhotspot" \| "icon-a-thermometersnowflake" \| "icon-a-sunhazefill" \| "icon-a-videofill" \| "icon-sparkles" \| "icon-a-facemaskfill" \| "icon-a-wave3backwardcirclefill" \| "icon-a-wave3leftcirclefill" \| "icon-a-wandandstarsinverse" \| "icon-a-wave3rightcirclefill" \| "icon-xmark" \| "icon-a-wave3right" \| "icon-a-waveformandmic" \| "icon-a-wifiexclamationmark" \| "icon-wifi" \| "icon-a-xmarkicloudfill" \| "icon-wind" \| "icon-timer" \| "icon-a-wrenchandscrewdriverfill" \| "icon-a-wave3forwardcirclefill" \| "icon-a-lockfill" \| "icon-a-wifislash" \| "icon-a-windsnow" \| "icon-a-wave3forward" \| "icon-cancel" \| "icon-a-arrowbackward" \| "icon-a-arrowdown" \| "icon-alarm" \| "icon-a-alarmfill" \| "icon-a-airplanedeparture" \| "icon-a-arrowlefttolinealt" \| "icon-a-arrowforward" \| "icon-airplane" \| "icon-a-arrow2squarepath" \| "icon-a-antennaradiowavesleftandright" \| "icon-a-arrowshapeturnuprightfill" \| "icon-a-arrowcounterclockwise" \| "icon-a-arrowturndownleft" \| "icon-a-arrowturnupleft" \| "icon-a-airplanearrival" \| "icon-a-boltfill" \| "icon-a-arrowturnrightup" \| "icon-a-arrowcounterclockwiseicloudfill" \| "icon-a-bellfill" \| "icon-a-arrowupanddownandarrowleftandright" \| "icon-a-beddoublefill" \| "icon-a-arrowshapeturnupleft2fill" \| "icon-a-arrowtrianglerightfillandlineverticalandarr" \| "icon-a-bolthorizontalicloudfill" \| "icon-a-boltheartfill" \| "icon-a-arrowupleftanddownrightandarrowuprightan" \| "icon-a-arrowclockwiseicloudfill" \| "icon-a-arrowupbackwardandarrowdownforward" \| "icon-a-arrowturndownright" \| "icon-bold" \| "icon-a-arrowleftarrowright" \| "icon-a-bolthorizontalfill" \| "icon-checkmark" \| "icon-a-arrowrighttolinealt" \| "icon-a-bubblerightfill" \| "icon-checkmark-2" \| "icon-clock" \| "icon-a-carfill" \| "icon-a-backwardendaltfill" \| "icon-checkmark-4" \| "icon-a-chevronright2" \| "icon-a-cloudboltrainfill" \| "icon-a-bolthorizontalcirclefill" \| "icon-a-chevronleft2" \| "icon-a-chevroncompactdown" \| "icon-a-briefcasefill" \| "icon-a-arrowturnupright" \| "icon-a-cloudboltfill" \| "icon-a-cloudfill" \| "icon-a-bubbleleftandbubblerightfill" \| "icon-a-bellbadgefill" \| "icon-checkmark-1" \| "icon-a-cloudmoonrainfill" \| "icon-a-chevroncompactright" \| "icon-a-crossfill" \| "icon-a-busfill" \| "icon-a-arrowturnleftup" \| "icon-a-cloudmoonboltfill" \| "icon-a-arrowtriangleleftfillandlineverticalandarro" \| "icon-a-checkmarkicloudfill"` | 是 | `"icon-warning"` | 图标类型（内置图标名） |
| `size` | `number` | 否 | `16` | 图标大小，单位 px |
| `color` | `string` | 否 | `"#333333"` | 图标颜色 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { Icon } from '@ray-js/icons';

export default function Demo() {
  return (
    <View style={{ padding: 20, flexDirection: 'row', gap: 15 }}>
      <Icon type="icon-right" size={24} />
      <Icon type="icon-warning" size={24} />
      <Icon type="icon-success" size={24} />
      <Icon type="icon-close" size={24} />
    </View>
  );
}
```

##### 自定义大小

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { Icon } from '@ray-js/icons';

export default function Demo() {
  return (
    <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Icon type="icon-right" size={16} color="#007aff" />
      <Icon type="icon-right" size={24} color="#007aff" />
      <Icon type="icon-right" size={32} color="#007aff" />
      <Icon type="icon-right" size={48} color="#007aff" />
    </View>
  );
}
```

##### 自定义颜色

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { Icon } from '@ray-js/icons';

export default function Demo() {
  return (
    <View style={{ padding: 20, flexDirection: 'row', gap: 15 }}>
      <Icon type="icon-warning" size={30} color="#ff4d4f" />
      <Icon type="icon-success" size={30} color="#52c41a" />
      <Icon type="icon-a-cloudrainfill" size={30} color="#1890ff" />
      <Icon type="icon-a-cloudsleetfill" size={30} color="#722ed1" />
    </View>
  );
}
```

##### 图标列表

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import { Icon } from '@ray-js/icons';

export default function Demo() {
  const icons = [
    'icon-right',
    'icon-warning',
    'icon-success',
    'icon-close',
    'icon-a-cloudrainfill',
    'icon-a-cloudsleetfill',
  ];

  return (
    <View style={{ padding: 20 }}>
      {icons.map((iconType) => (
        <View
          key={iconType}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
            padding: 10,
            backgroundColor: '#f5f5f5',
            borderRadius: 8
          }}
        >
          <Icon type={iconType} size={24} color="#007aff" />
          <Text style={{ marginLeft: 10, fontSize: 14, color: '#333' }}>
            {iconType}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

#### 效果

<iframe src="https://static1.tuyacn.com/static/tuya-miniapp-doc/_next/static/images/iconDemo/demo_index.html?s=3" style={{width: '100%', height: '500px'}} frameborder="0"></iframe>
### Progress

> [VERSION] @ray-js/ray >= 0.6.15

#### 描述

进度条组件，用于展示操作或任务的当前进度。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `percent` | `number` | 否 | `0` | 当前进度，取值范围 0~100 |
| `showInfo` | `boolean` | 否 | `false` | 是否在进度条右侧显示百分比 |
| `borderRadius` | `number \| string` | 否 | `0` | 圆角大小，默认单位 rpx |
| `fontSize` | `number \| string` | 否 | `16` | 右侧百分比字体大小，默认单位 px |
| `strokeWidth` | `number \| string` | 否 | `6` | 进度条线宽，默认单位 rpx |
| `activeColor` | `string` | 否 | `"#007aff"` | 已完成部分的颜色 |
| `backgroundColor` | `string` | 否 | `"rgba(0,0,0,0.04)"` | 未完成部分的颜色 |
| `active` | `boolean` | 否 | `false` | 是否开启从左到右的进度动画 |
| `activeMode` | `"backwards" \| "forwards"` | 否 | `"backwards"` | 动画播放模式，backwards 从头播放，forwards 从上次结束点继续播放 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View, Progress } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <Progress percent={50} strokeWidth={8} />
    </View>
  );
}
```

##### 显示百分比

```tsx
import React from 'react';
import { View, Progress } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Progress percent={20} showInfo strokeWidth={8} />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Progress percent={60} showInfo strokeWidth={8} />
      </View>
      <View>
        <Progress percent={100} showInfo strokeWidth={8} />
      </View>
    </View>
  );
}
```

##### 自定义样式

```tsx
import React from 'react';
import { View, Progress } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Progress
          percent={70}
          showInfo
          strokeWidth={12}
          borderRadius={6}
          fontSize={14}
          activeColor="#52c41a"
          backgroundColor="#e8e8e8"
        />
      </View>
      <View>
        <Progress
          percent={40}
          showInfo
          strokeWidth={12}
          borderRadius={6}
          activeColor="#ff4d4f"
          backgroundColor="#fff1f0"
        />
      </View>
    </View>
  );
}
```

##### 进度动画

```tsx
import React, { useState } from 'react';
import { View, Progress, Button } from '@ray-js/ray';

export default function Demo() {
  const [percent, setPercent] = useState(0);

  return (
    <View style={{ padding: 20 }}>
      <Progress
        percent={percent}
        showInfo
        strokeWidth={8}
        active
        activeMode="forwards"
      />
      <View style={{ marginTop: 20, display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <Button size="mini" onClick={() => setPercent(Math.min(percent + 20, 100))}>
          增加
        </Button>
        <Button size="mini" onClick={() => setPercent(0)}>
          重置
        </Button>
      </View>
    </View>
  );
}
```
### RichText

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

富文本组件，用于渲染富文本内容。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `nodes` | `string \| RichTextTextNode[]` | 否 | - | 节点列表（元素/文本节点数组）或 HTML 字符串 |
| `onSelect` | `(event: RichTextSelectEvent) => void` | 否 | - | 点击富文本内标签时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View, RichText } from '@ray-js/ray';

export default function Demo() {
  return (
    <View style={{ padding: 20 }}>
      <RichText
        nodes='<div><h2 style="color: #333;">标题</h2><p style="color: #666; line-height: 1.6;">这是一段富文本内容</p></div>'
      />
    </View>
  );
}
```

##### HTML String 格式

```tsx
import React from 'react';
import { View, RichText } from '@ray-js/ray';

export default function Demo() {
  const htmlString = `
    <div style="padding: 10px;">
      <h1 style="color: #007aff; margin-bottom: 10px;">欢迎使用 RichText</h1>
      <p style="color: #333; line-height: 1.8;">
        Life is <i>like</i> a box of <b style="color: red;">chocolates</b>.
      </p>
      <p style="color: #666; margin-top: 10px;">
        You never know what you are gonna get.
      </p>
    </div>
  `;

  return (
    <View style={{ padding: 20 }}>
      <RichText nodes={htmlString} />
    </View>
  );
}
```

##### 文本节点列表格式

```tsx
import React from 'react';
import { View, RichText } from '@ray-js/ray';

export default function Demo() {
  const nodes = [
    { type: 'text' as const, text: '这是第一段文本。' },
    { type: 'text' as const, text: '这是第二段文本，支持 &amp; 等 HTML 实体。' },
  ];

  return (
    <View style={{ padding: 20 }}>
      <RichText nodes={nodes} />
    </View>
  );
}
```

##### 点击标签事件

```tsx
import React from 'react';
import { View, RichText } from '@ray-js/ray';

export default function Demo() {
  const html = `
    <div style="padding: 10px;">
      <p>点击下方链接文字查看控制台输出：</p>
      <a style="color: #007aff; text-decoration: underline;">可点击的链接</a>
    </div>
  `;

  return (
    <View style={{ padding: 20 }}>
      <RichText
        nodes={html}
        onSelect={(e) => console.log('点击标签:', e.detail.name, e.detail.attrs)}
      />
    </View>
  );
}
```

#### 受信任的 HTML 节点及属性

全局支持 class 和 style 属性，**不支持 id 属性**。

| 节点       | 属性                            |
| :--------- | ------------------------------- |
| a          |                                 |
| abbr       |                                 |
| address    |                                 |
| article    |                                 |
| aside      |                                 |
| b          |                                 |
| bdi        |                                 |
| bdo        | dir                             |
| big        |                                 |
| blockquote |                                 |
| br         |                                 |
| caption    |                                 |
| center     |                                 |
| cite       |                                 |
| code       |                                 |
| col        | span，width                     |
| colgroup   | span，width                     |
| dd         |                                 |
| del        |                                 |
| div        |                                 |
| dl         |                                 |
| dt         |                                 |
| em         |                                 |
| fieldset   |                                 |
| font       |                                 |
| footer     |                                 |
| h1         |                                 |
| h2         |                                 |
| h3         |                                 |
| h4         |                                 |
| h5         |                                 |
| h6         |                                 |
| header     |                                 |
| hr         |                                 |
| i          |                                 |
| img        | alt，src，height，width         |
| ins        |                                 |
| label      |                                 |
| legend     |                                 |
| li         |                                 |
| mark       |                                 |
| nav        |                                 |
| ol         | start，type                     |
| p          |                                 |
| pre        |                                 |
| q          |                                 |
| rt         |                                 |
| ruby       |                                 |
| s          |                                 |
| section    |                                 |
| small      |                                 |
| span       |                                 |
| strong     |                                 |
| sub        |                                 |
| sup        |                                 |
| table      | width                           |
| tbody      |                                 |
| td         | colspan，height，rowspan，width |
| tfoot      |                                 |
| th         | colspan，height，rowspan，width |
| thead      |                                 |
| tr         | colspan，height，rowspan，width |
| tt         |                                 |
| u          |                                 |
| ul         |                                 |
| iframe     |                                 |
| pre        |                                 |
