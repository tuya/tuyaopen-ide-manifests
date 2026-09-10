# 样式

如果您是需要用 Ray 开发小程序（微信小程序、智能小程序），我们推荐您直接使用 rpx。

rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为 750rpx。如在 iPhone6 上，屏幕宽度为 375px，共有 750 个物理像素，则 750rpx = 375px = 750 物理像素，1rpx = 0.5px = 1 物理像素。

| 设备         | rpx 换算 px (屏幕宽度/750) | px 换算 rpx (750/屏幕宽度) |
| ------------ | -------------------------- | -------------------------- |
| iPhone5      | 1rpx = 0.42px              | 1px = 2.34rpx              |
| iPhone6      | 1rpx = 0.5px               | 1px = 2rpx                 |
| iPhone6 Plus | 1rpx = 0.552px             | 1px = 1.81rpx              |

## 预处理器

Ray 目前默认支持 less，后续我们会以插件的形式支持更多的预处理器配置。

## px 转换

目前 Ray 使用 px 写法，在编译成小程序时不会自动编译成 rpx，保持 px 不变，如果编译到 web，px 则会变成 rem，转换比例是 100 : 1。

比如

```css
.foo {
  height: 16px;
}
```

编译到小程序时

```css
.foo {
  height: 16px;
}
```

编译到 Web 时：

```css
.foo {
  height: 0.16rem;
}
```

## CSS Modules

Ray 会自动识别 CSS Modules，以 `.module.css` 或 `.module.less` 结尾的文件会被识别为 CSS Modules 文件，

比如：

```js
// 会自动识别 foo.module.css 为 CSS Modules
import styles from './foo.module.css';
// 会自动识别 bar.css 为全局样式
import './bar.css';
```
