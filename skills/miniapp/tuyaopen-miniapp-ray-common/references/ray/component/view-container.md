# 视图容器 (view-container)

[AI-generated summary: 本文档介绍了Ray平台的视图容器组件族，用于构建页面布局和交互。涵盖基础容器、滚动、轮播、可拖拽等多种场景的实现方式。覆盖内容：View, ScrollView, Swiper, SwiperItem, MovableArea, MovableView, PageContainer, CoverView, hoverable, scrollX, scrollY, scrollIntoView, refresherEnabled, dots, circular, dataSource, renderItem, direction, scale, show, overlay, position]

### View

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

用于页面布局的容器组件，支持 flex 布局、自定义样式等，是构建页面的基础块级元素。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `hoverClassName` | `string` | 否 | `"none"` | 指定按下去的样式类；为 none 时没有点击态效果 |
| `hoverStartTime` | `number` | 否 | `20` | 按住后多久出现点击态，单位毫秒 |
| `hoverStayTime` | `number` | 否 | `70` | 手指松开后点击态保留时间，单位毫秒 |
| `hoverable` | `boolean` | 否 | `true` | 是否启用可触摸响应的 hover 样式 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function BasicView() {
  return (
    <View
      style={{
        height: '120rpx',
        backgroundColor: '#e67d1b',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onTouchStart={() => console.log('touch start')}
      onTouchEnd={() => console.log('touch end')}
      onClick={() => console.log('click')}
    >
      <Text style={{ color: '#fff' }}>点击容器</Text>
    </View>
  );
}
```

##### Flex 布局

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function FlexView() {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <View
        style={{
          flex: 1,
          height: '120rpx',
          backgroundColor: '#e67d1b',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '10rpx',
        }}
        onClick={() => console.log('A')}
      >
        <Text style={{ color: '#fff' }}>A</Text>
      </View>
      <View
        style={{
          flex: 1,
          height: '120rpx',
          backgroundColor: '#e67d1b',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => console.log('B')}
      >
        <Text style={{ color: '#fff' }}>B</Text>
      </View>
    </View>
  );
}
```

##### Hover 点击态

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function HoverView() {
  return (
    <View style={{ padding: '20rpx' }}>
      <View
        hoverable
        style={{
          height: '100rpx',
          backgroundColor: '#e67d1b',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20rpx',
        }}
      >
        <Text style={{ color: '#fff' }}>hoverable（按下透明度降低）</Text>
      </View>
      <View
        hoverable
        hoverClassName="custom-hover"
        hoverStartTime={100}
        hoverStayTime={300}
        style={{
          height: '100rpx',
          backgroundColor: '#1890ff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff' }}>
          自定义 hover（延迟 100ms 出现，保留 300ms）
        </Text>
      </View>
    </View>
  );
}
```
### ScrollView

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

可滚动视图容器，支持横向或纵向滚动，可配置下拉刷新、滚动事件监听等功能。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `scrollX` | `boolean` | 否 | `false` | - | 允许横向滚动 |
| `scrollY` | `boolean` | 否 | `false` | - | 允许纵向滚动 |
| `upperThreshold` | `number` | 否 | `50` | - | 距顶部/左边多远时，触发 scrolltoupper 事件 |
| `lowerThreshold` | `number` | 否 | `50` | - | 距底部/右边多远时，触发 scrolltolower 事件 |
| `scrollTop` | `number` | 否 | `0` | - | 设置竖向滚动条位置 |
| `scrollLeft` | `number` | 否 | `0` | - | 设置横向滚动条位置 |
| `scrollIntoView` | `string` | 否 | - | - | 值应为某子元素 id（id 不能以数字开头）。设置哪个方向可滚动，则在哪个方向滚动到该元素 |
| `scrollIntoViewOffset` | `number` | 否 | `0` | `1.7.58` | 跳转到 scrollIntoView 目标节点时的额外偏移，单位 px |
| `scrollWithAnimation` | `boolean` | 否 | `false` | - | 在设置滚动条位置时使用动画过渡 |
| `onScroll` | `(event: ScrollEvent) => void` | 否 | - | - | 滚动时触发 |
| `onScrollToUpper` | `(event: ScrolltoupperEvent) => void` | 否 | - | - | 滚动到顶部/左边时触发 |
| `onScrollToLower` | `(event: ScrolltolowerEvent) => void` | 否 | - | - | 滚动到底部/右边时触发 |
| `refresherEnabled` | `boolean` | 否 | `false` | `0.9.3` | 开启自定义下拉刷新 |
| `refresherThreshold` | `number` | 否 | `45` | `0.9.3` | 设置自定义下拉刷新阈值 |
| `refresherDefaultStyle` | `"black" \| "white" \| "none"` | 否 | `"black"` | `0.9.3` | 设置自定义下拉刷新默认样式，支持设置 black、white、none，none 表示不使用默认样式 |
| `refresherBackground` | `string` | 否 | `"#FFF"` | `0.9.3` | 设置自定义下拉刷新区域背景颜色 |
| `refresherTriggered` | `boolean` | 否 | `false` | `0.9.3` | 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发 |
| `hideScrollbar` | `boolean` | 否 | `true` | - | 隐藏滚动条 |
| `bounces` | `boolean` | 否 | `true` | `1.7.58` | 是否启用iOS滚动回弹效果（iOS 16.0+ 完全支持） |
| `onRefresherpulling` | `(event: RefresherPullingEvent) => void` | 否 | - | `0.9.3` | 自定义下拉刷新控件被下拉时触发 |
| `onRefresherrefresh` | `(event: RefresherRefreshEvent) => void` | 否 | - | `0.9.3` | 自定义下拉刷新被触发时触发 |
| `onRefresherrestore` | `(event: RefresherRestoreEvent) => void` | 否 | - | `0.9.3` | 自定义下拉刷新被复位时触发 |
| `onRefresherabort` | `(event: RefresherAbortEvent) => void` | 否 | - | `0.9.3` | 自定义下拉刷新被中止时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { ScrollView, View, Text } from '@ray-js/ray';

export default function BasicScrollView() {
  const handleScrollToUpper = () => {
    console.log('已滚动到顶部');
  };

  const handleScrollToLower = () => {
    console.log('已滚动到底部');
  };

  return (
    <ScrollView
      scrollY
      style={{ height: '400rpx', backgroundColor: '#f5f5f5' }}
      onScrollToUpper={handleScrollToUpper}
      onScrollToLower={handleScrollToLower}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <View
          key={i}
          style={{
            height: '100rpx',
            margin: '10rpx',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>列表项 {i + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

##### 下拉刷新

```tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text } from '@ray-js/ray';

export default function PullToRefreshDemo() {
  const [list, setList] = useState(() =>
    Array.from({ length: 10 }, (_, i) => `初始数据 ${i + 1}`)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback((startIndex: number) => {
    return new Promise<string[]>((resolve) => {
      setTimeout(() => {
        const newList = Array.from(
          { length: 10 },
          (_, i) => `数据 ${startIndex + i + 1}`
        );
        resolve(newList);
      }, 1000);
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const newList = await loadData(-1);
      setList(prevList => [...newList, ...prevList]);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleScrollToLower = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newList = await loadData(list.length);
      setList(prevList => [...prevList, ...newList]);
    } finally {
      setLoading(false);
    }
  }, [loading, list.length, loadData]);

  return (
    <ScrollView
      scrollY
      style={{ height: '600rpx', backgroundColor: '#f5f5f5' }}
      refresherEnabled
      refresherThreshold={50}
      refresherTriggered={refreshing}
      refresherBackground="#f5f5f5"
      onRefresherrefresh={handleRefresh}
      onScrollToLower={handleScrollToLower}
      lowerThreshold={100}
    >
      {list.map((item, index) => (
        <View
          key={index}
          style={{
            height: '100rpx',
            margin: '10rpx 20rpx',
            backgroundColor: '#fff',
            borderRadius: '8rpx',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>{item}</Text>
        </View>
      ))}
      {loading && (
        <View
          style={{
            height: '80rpx',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#999', fontSize: '28rpx' }}>加载中...</Text>
        </View>
      )}
    </ScrollView>
  );
}
```

##### 横向滚动

```tsx
import React from 'react';
import { ScrollView, View, Text } from '@ray-js/ray';

export default function HorizontalScrollDemo() {
  const cards = ['卡片1', '卡片2', '卡片3', '卡片4', '卡片5'];

  return (
    <ScrollView
      scrollX
      style={{
        width: '100%',
        height: '200rpx',
        whiteSpace: 'nowrap',
      }}
      onScroll={(e) => console.log('横向滚动位置:', e.detail.scrollLeft)}
    >
      {cards.map((card, index) => (
        <View
          key={index}
          style={{
            width: '300rpx',
            height: '180rpx',
            marginRight: '20rpx',
            backgroundColor: '#1890ff',
            borderRadius: '12rpx',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '32rpx' }}>{card}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

##### 滚动到指定位置

```tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, Button } from '@ray-js/ray';

export default function ScrollIntoViewDemo() {
  const [targetId, setTargetId] = useState('');
  const sections = ['section-a', 'section-b', 'section-c', 'section-d'];

  return (
    <View>
      <View style={{ display: 'flex', marginBottom: '20rpx' }}>
        {sections.map((id) => (
          <Button
            key={id}
            size="mini"
            style={{ marginRight: '10rpx' }}
            onClick={() => setTargetId(id)}
          >
            跳转 {id.split('-')[1].toUpperCase()}
          </Button>
        ))}
      </View>
      <ScrollView
        scrollY
        scrollWithAnimation
        scrollIntoView={targetId}
        scrollIntoViewOffset={10}
        style={{ height: '400rpx', backgroundColor: '#f5f5f5' }}
      >
        {sections.map((id, index) => (
          <View
            key={id}
            id={id}
            style={{
              height: '300rpx',
              margin: '10rpx',
              backgroundColor: ['#e6f7ff', '#fff7e6', '#f6ffed', '#fff1f0'][index],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: '36rpx' }}>区域 {id.split('-')[1].toUpperCase()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

#### 常见问题

##### 为何 scroll-view 在 popup 扩展组件中无法滑动？

popup 组件上加上 `disableScroll` 属性并将值设为 `false` 才能滑动。

##### 如何监听 scroll-view 滚动到底部？

可以直接在 `onScroll` 方法中进行处理，使用 `onScrollToLower` 监听 `scrollView` 的滚动高度来进行判断是否滑动到了底部。
`scrollHeight` 是 `scrollView` 里面所有 `View` 的高度和，`scrollTop` 是滚动的值；
### Swiper

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

幻灯片／轮播容器，支持自动切换、衔接滑动与指示点；使用时需明确整体高度。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `dots` | `boolean` | 否 | `false` | 是否显示面板指示点 |
| `dotColor` | `string` | 否 | `"rgba(0,0,0,0.3)"` | 指示点颜色 |
| `dotActiveColor` | `string` | 否 | `"#000"` | 当前选中的指示点颜色 |
| `autoplay` | `boolean` | 否 | `false` | 是否自动切换 |
| `current` | `number` | 否 | `0` | 当前所在滑块的 index |
| `interval` | `number` | 否 | `5000` | 自动切换时间间隔 |
| `duration` | `number` | 否 | `500` | 滑动动画时长 |
| `circular` | `boolean` | 否 | `false` | 是否采用衔接滑动 |
| `vertical` | `boolean` | 否 | `false` | 滑动方向是否为纵向 |
| `dataSource` | `string[] \| number[] \| Record<string, unknown>[]` | 否 | - | 列表数据，用于与 renderItem 组合渲染 |
| `renderItem` | `(item: string \| number \| Record<string, unknown>, index: number) => any` | 否 | - | 渲染列表每一项 |
| `onChange` | `(event: SwiperComponentChangeEvent) => void` | 否 | - | current 改变时触发 |
| `onAfterChange` | `(event: SwiperComponentAfterChangeEvent) => void` | 否 | - | 动画结束时触发 |

#### 示例代码

##### 基础用法

```tsx
import React, { useState } from 'react';
import { Swiper, SwiperItem, View, Button, Text } from '@ray-js/ray';

export default function BasicSwiper() {
  const [current, setCurrent] = useState(0);
  const colors = ['#1890ff', '#52c41a', '#faad14'];

  return (
    <View>
      <Swiper
        style={{ width: '702rpx', height: '200rpx' }}
        dots
        current={current}
        onChange={(e) => setCurrent(e.current)}
      >
        {colors.map((color, index) => (
          <SwiperItem key={index}>
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff' }}>第 {index + 1} 页</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>
      <Button
        style={{ marginTop: '20rpx' }}
        onClick={() => setCurrent((current + 1) % 3)}
      >
        切换到第 {(current + 1) % 3 + 1} 页
      </Button>
    </View>
  );
}
```

##### 自动轮播与 dataSource

```tsx
import React, { useState } from 'react';
import { Swiper, View, Text } from '@ray-js/ray';

export default function AutoplaySwiper() {
  const [current, setCurrent] = useState(0);
  const dataSource = [
    { id: '1', color: '#1890ff', label: '轮播一' },
    { id: '2', color: '#52c41a', label: '轮播二' },
    { id: '3', color: '#faad14', label: '轮播三' },
  ];

  return (
    <Swiper
      style={{ width: '702rpx', height: '200rpx' }}
      autoplay
      interval={2500}
      circular
      dots
      current={current}
      dataSource={dataSource}
      renderItem={(item) => (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: item.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '32rpx' }}>{item.label}</Text>
        </View>
      )}
      onChange={(e) => setCurrent(e.current)}
    />
  );
}
```

##### 纵向轮播与指示点颜色

```tsx
import React, { useState } from 'react';
import { Swiper, View, Text } from '@ray-js/ray';

export default function VerticalSwiper() {
  const [current, setCurrent] = useState(0);
  const dataSource = [
    { id: '1', color: '#722ed1', label: '纵向一' },
    { id: '2', color: '#eb2f96', label: '纵向二' },
    { id: '3', color: '#13c2c2', label: '纵向三' },
  ];

  return (
    <Swiper
      style={{ width: '702rpx', height: '300rpx' }}
      vertical
      dots
      dotColor="rgba(255,255,255,0.4)"
      dotActiveColor="#fff"
      duration={400}
      current={current}
      dataSource={dataSource}
      renderItem={(item) => (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: item.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '32rpx' }}>{item.label}</Text>
        </View>
      )}
      onChange={(e) => setCurrent(e.current)}
      onAfterChange={(e) => console.log('动画结束:', e.current)}
    />
  );
}
```
### SwiperItem

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

滑块视图容器子项，仅可放置在 Swiper 组件中，宽高自动设置为 100%。

#### 示例代码

##### 基础用法

```tsx
import React, { useState } from 'react';
import { Swiper, SwiperItem, View, Text } from '@ray-js/ray';

export default function BasicSwiperItem() {
  const [current, setCurrent] = useState(0);
  const colors = ['#1890ff', '#52c41a', '#faad14'];

  return (
    <Swiper
      style={{ width: '702rpx', height: '200rpx' }}
      autoplay
      interval={2500}
      dots
      current={current}
      onChange={(e) => setCurrent(e.current)}
    >
      {colors.map((color, index) => (
        <SwiperItem key={index}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff' }}>第 {index + 1} 页</Text>
          </View>
        </SwiperItem>
      ))}
    </Swiper>
  );
}
```

##### 纵向轮播

```tsx
import React, { useState } from 'react';
import { Swiper, SwiperItem, View, Text } from '@ray-js/ray';

export default function VerticalSwiper() {
  const [current, setCurrent] = useState(0);
  const items = ['第一屏', '第二屏', '第三屏'];

  return (
    <Swiper
      style={{ width: '100%', height: '400rpx' }}
      vertical
      dots
      current={current}
      onChange={(e) => setCurrent(e.current)}
    >
      {items.map((label, index) => (
        <SwiperItem key={index}>
          <View
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: index % 2 === 0 ? '#e6f7ff' : '#f6ffed',
            }}
          >
            <Text style={{ fontSize: '36rpx' }}>{label}</Text>
          </View>
        </SwiperItem>
      ))}
    </Swiper>
  );
}
```
### MovableArea

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

MovableView 的可移动区域容器；须包裹 MovableView，且后者须为直接子节点。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `scaleArea` | `boolean` | 否 | `false` | 当里面的 movable-view 设置为支持双指缩放时，设置此值可将缩放手势生效区域修改为整个 movable-area |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { MovableArea, MovableView, View, Text } from '@ray-js/ray';

export default function BasicMovableArea() {
  return (
    <MovableArea
      style={{
        width: '300rpx',
        height: '300rpx',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
      }}
    >
      <MovableView direction="all" x={0} y={0}>
        <View
          style={{
            width: '100rpx',
            height: '100rpx',
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>拖我</Text>
        </View>
      </MovableView>
    </MovableArea>
  );
}
```

##### 缩放区域扩展

```tsx
import React from 'react';
import { MovableArea, MovableView, View, Text } from '@ray-js/ray';

export default function ScaleAreaDemo() {
  return (
    <MovableArea
      scaleArea
      style={{
        width: '400rpx',
        height: '400rpx',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      <MovableView
        direction="all"
        scale
        scaleMin={0.5}
        scaleMax={3}
        scaleValue={1}
      >
        <View
          style={{
            width: '150rpx',
            height: '150rpx',
            backgroundColor: '#722ed1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>整个区域可缩放</Text>
        </View>
      </MovableView>
    </MovableArea>
  );
}
```
### MovableView

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

可拖拽的可移动视图，须置于 MovableArea 内使用。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `direction` | `"all" \| "vertical" \| "horizontal" \| "none"` | 否 | `"none"` | - | movable-view 的移动方向 |
| `inertia` | `boolean` | 否 | `false` | - | movable-view 是否带有惯性 |
| `outOfBounds` | `boolean` | 否 | `false` | - | 超过可移动区域后，movable-view 是否还可以移动 |
| `x` | `number` | 否 | - | - | 定义 x 轴方向的偏移，如果 x 的值不在可移动范围内，会自动移动到可移动范围；改变 x 的值会触发动画 |
| `y` | `number` | 否 | - | - | 定义 y 轴方向的偏移，如果 y 的值不在可移动范围内，会自动移动到可移动范围；改变 y 的值会触发动画 |
| `damping` | `number` | 否 | `20` | - | 阻尼系数，用于控制 x 或 y 改变时的动画和过界回弹的动画，值越大移动越快 |
| `friction` | `number` | 否 | `2` | - | 摩擦系数，用于控制惯性滑动的动画，值越大摩擦力越大，滑动越快停止；必须大于 0，否则会被设置成默认值 |
| `disabled` | `boolean` | 否 | `false` | - | 是否禁用 |
| `scale` | `boolean` | 否 | `false` | - | 是否支持双指缩放，默认缩放手势生效区域是在 movable-view 内 |
| `scaleMin` | `number` | 否 | `0.5` | - | 定义缩放倍数最小值 |
| `scaleMax` | `number` | 否 | `10` | - | 定义缩放倍数最大值 |
| `scaleValue` | `number` | 否 | `1` | - | 定义缩放倍数，取值范围为 0.5 - 10 |
| `animation` | `boolean` | 否 | `true` | - | 是否使用动画 |
| `onChange` | `(event: MovableViewChangeEvent) => void` | 否 | - | - | 拖动过程中触发 |
| `onScale` | `(event: MovableViewScaleEvent) => void` | 否 | - | `2.1.0` | 缩放过程中触发，x 和 y 字段在 2.1.0 之后支持 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { MovableArea, MovableView, View, Text } from '@ray-js/ray';

export default function BasicMovableView() {
  return (
    <MovableArea
      style={{
        width: '400rpx',
        height: '400rpx',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      <MovableView direction="all">
        <View
          style={{
            width: '100rpx',
            height: '100rpx',
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>拖我</Text>
        </View>
      </MovableView>
    </MovableArea>
  );
}
```

##### 惯性与回弹

```tsx
import React from 'react';
import { MovableArea, MovableView, View, Text } from '@ray-js/ray';

export default function InertiaDemo() {
  return (
    <MovableArea
      style={{
        width: '400rpx',
        height: '400rpx',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      <MovableView
        direction="all"
        inertia
        outOfBounds
        damping={30}
        friction={5}
        x={50}
        y={50}
        animation
        onChange={(e) => console.log('位置:', e.detail.x, e.detail.y, '原因:', e.detail.source)}
      >
        <View
          style={{
            width: '100rpx',
            height: '100rpx',
            backgroundColor: '#52c41a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>惯性</Text>
        </View>
      </MovableView>
    </MovableArea>
  );
}
```

##### 禁用与指定位置

```tsx
import React, { useState } from 'react';
import { MovableArea, MovableView, View, Text, Button } from '@ray-js/ray';

export default function DisabledDemo() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <View>
      <View style={{ display: 'flex', marginBottom: '20rpx', gap: '10rpx' }}>
        <Button size="mini" onClick={() => setPos({ x: 0, y: 0 })}>
          左上角
        </Button>
        <Button size="mini" onClick={() => setPos({ x: 150, y: 150 })}>
          居中
        </Button>
      </View>
      <MovableArea
        style={{
          width: '400rpx',
          height: '400rpx',
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        <MovableView direction="all" x={pos.x} y={pos.y} animation>
          <View
            style={{
              width: '100rpx',
              height: '100rpx',
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff' }}>移动</Text>
          </View>
        </MovableView>
        <MovableView direction="all" disabled x={200} y={0}>
          <View
            style={{
              width: '100rpx',
              height: '100rpx',
              backgroundColor: '#d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#999' }}>禁用</Text>
          </View>
        </MovableView>
      </MovableArea>
    </View>
  );
}
```

##### 双指缩放

```tsx
// 缩放效果需在真机上预览
import React from 'react';
import { MovableArea, MovableView, View, Text } from '@ray-js/ray';

export default function ScaleDemo() {
  return (
    <MovableArea
      scaleArea
      style={{
        width: '400rpx',
        height: '400rpx',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      <MovableView
        direction="all"
        scale
        scaleMin={0.5}
        scaleMax={3}
        scaleValue={1}
        onScale={(e) => console.log('缩放:', e.detail.scale, '位置:', e.detail.x, e.detail.y)}
      >
        <View
          style={{
            width: '150rpx',
            height: '150rpx',
            backgroundColor: '#722ed1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>缩放</Text>
        </View>
      </MovableView>
    </MovableArea>
  );
}
```
### PageContainer

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

页面容器，用于从屏幕边缘或底部弹出半屏/全屏内容，支持遮罩、圆角、进入离开动画及生命周期回调。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `show` | `boolean` | 否 | `false` | 是否显示容器组件 |
| `duration` | `number` | 否 | `300` | 动画时长，单位毫秒 |
| `zIndex` | `number` | 否 | `100` | z-index 层级 |
| `overlay` | `boolean` | 否 | `true` | 是否显示遮罩层 |
| `position` | `"top" \| "bottom" \| "right" \| "center"` | 否 | `"bottom"` | 弹出位置 |
| `round` | `boolean` | 否 | `false` | 是否显示圆角 |
| `overlayStyle` | `string \| any` | 否 | - | 自定义遮罩层样式 |
| `customStyle` | `string \| any` | 否 | - | 自定义弹出层样式 |
| `onBeforeEnter` | `(event: PageContainerEventType) => void` | 否 | - | 进入前触发 |
| `onEnter` | `(event: PageContainerEventType) => void` | 否 | - | 进入中触发 |
| `onAfterEnter` | `(event: PageContainerEventType) => void` | 否 | - | 进入后触发 |
| `onBeforeLeave` | `(event: PageContainerEventType) => void` | 否 | - | 离开前触发 |
| `onLeave` | `(event: PageContainerEventType) => void` | 否 | - | 离开中触发 |
| `onAfterLeave` | `(event: PageContainerEventType) => void` | 否 | - | 离开后触发 |
| `onClickOverlay` | `(event: PageContainerEventType) => void` | 否 | - | 点击遮罩层时触发 |

#### 示例代码

##### 基础用法

```tsx
import React, { useState } from 'react';
import { PageContainer, Button, View } from '@ray-js/ray';

export default function BasicPageContainer() {
  const [show, setShow] = useState(false);

  return (
    <View>
      <Button onClick={() => setShow(true)}>从顶部弹出</Button>
      <PageContainer
        show={show}
        position="top"
        overlay={false}
        onClickOverlay={() => setShow(false)}
      >
        <View style={{ height: '200px', padding: '20px' }}>
          <Button onClick={() => setShow(false)}>关闭</Button>
        </View>
      </PageContainer>
    </View>
  );
}
```

##### 从底部弹出带遮罩

```tsx
import React, { useState } from 'react';
import { PageContainer, Button, View, Text } from '@ray-js/ray';

export default function BottomPageContainer() {
  const [show, setShow] = useState(false);

  return (
    <View>
      <Button onClick={() => setShow(true)}>打开底部弹层</Button>
      <PageContainer
        show={show}
        position="bottom"
        round
        overlay
        duration={300}
        onClickOverlay={() => setShow(false)}
      >
        <View
          style={{
            minHeight: '300rpx',
            padding: '40rpx',
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: '32rpx', marginBottom: '20rpx' }}>
            底部弹层内容
          </Text>
          <Button onClick={() => setShow(false)}>关闭</Button>
        </View>
      </PageContainer>
    </View>
  );
}
```

##### 自定义样式与生命周期

```tsx
import React, { useState } from 'react';
import { PageContainer, Button, View, Text } from '@ray-js/ray';

export default function LifecyclePageContainer() {
  const [show, setShow] = useState(false);

  return (
    <View>
      <Button onClick={() => setShow(true)}>打开自定义弹层</Button>
      <PageContainer
        show={show}
        position="bottom"
        round
        overlay
        zIndex={200}
        duration={400}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        customStyle={{ backgroundColor: '#f5f5f5' }}
        onBeforeEnter={() => console.log('进入前')}
        onEnter={() => console.log('进入中')}
        onAfterEnter={() => console.log('进入后')}
        onBeforeLeave={() => console.log('离开前')}
        onLeave={() => console.log('离开中')}
        onAfterLeave={() => console.log('离开后')}
        onClickOverlay={() => setShow(false)}
      >
        <View style={{ padding: '40rpx', minHeight: '300rpx' }}>
          <Text style={{ fontSize: '32rpx' }}>自定义样式弹层</Text>
          <Button onClick={() => setShow(false)} style={{ marginTop: '20rpx' }}>
            关闭
          </Button>
        </View>
      </PageContainer>
    </View>
  );
}
```
### CoverView

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

覆盖在原生组件之上的视图容器，可覆盖 Map、Video 等原生组件。

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { CoverView, Map, Text } from '@ray-js/ray';

export default function BasicCoverView() {
  return (
    <Map
      longitude={120.15}
      latitude={30.28}
      scale={14}
      style={{ width: '100%', height: '400rpx' }}
    >
      <CoverView
        style={{
          position: 'absolute',
          bottom: '20rpx',
          left: '20rpx',
          right: '20rpx',
          padding: '20rpx',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '8rpx',
        }}
      >
         覆盖在地图上的文字
      </CoverView>
    </Map>
  );
}
```
