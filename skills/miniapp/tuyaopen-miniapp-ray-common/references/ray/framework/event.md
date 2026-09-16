# 事件

## 阻止冒泡

由于小程序本身没有阻止事件冒泡的方式，而是采用不同的方法属性来声明阻止冒泡（如 智能小程序的 `catchtap`）， `Ray` 需要通过 `event.origin.stopPropagation` 阻止冒泡。

```jsx | sandbox
import { View } from '@ray-js/ray';

export default function Page() {
  function handleFooClick(event) {
    event.origin.stopPropagation();
  }
  function handleBarClick() {
    // ...
  }
  return (
    <View onClick={handleBarClick}>
      bar
      <View onClick={handleFooClick}>foo</View>
    </View>
  );
}
```

当您点击 `foo` 标签时，将会触发 `handleFooClick` 回调，但不会执行 `handleBarClick`。
