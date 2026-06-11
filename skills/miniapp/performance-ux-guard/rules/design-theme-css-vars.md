---
id: design-theme-css-vars
priority: HIGH
category: Design > Theming
---

# Use Theme CSS Variables for Color, not Raw rgba()

## Rule

小程序框架已内置 `--app-*` 这套深浅色自适应 CSS 变量（如 `--app-B6-N2`、`--app-M1`、`--app-T6-f`、`--app-P4`），**所有项目默认可用，无需自行在 `:root` 中定义**。

UI 还原时的标准工作流：

1. 拿到设计稿任意 `rgba(...)` / `#xxx` / 字号 / 间距 / 圆角值
2. **先去 `references/app-css-variables.md` 的反查表里查匹配变量**
3. 找到 → 直接用 `var(--app-XX)`
4. 实在没匹配的（极少数项目特殊色）→ 才允许字面量，且必须说明原因

**不得**未经反查就直接写 `rgba()` / `#xxx` 字面量；这套变量是框架沉淀，**不会轻易变更，只会增量增加**，可以放心依赖。

## Bad

```css
.card-title {
  color: rgba(0, 0, 0, 0.90);          /* 写死黑色文字, dark mode 不跟随 */
}
.card-meta {
  color: rgba(0, 0, 0, 0.50);
}
.card {
  background: rgba(255, 255, 255, 1);   /* 写死白底, dark mode 仍是白底 */
  border-radius: 12px;                  /* 写死圆角, 没复用 token */
}
```

dark mode 完全不跟随，需要再补一套 `:root[data-theme=dark]` 才能救回来；圆角、间距也散落各处难以集中维护。

## Good

```css
.card-title {
  color: var(--app-B6-N1);     /* light: rgba(0,0,0,0.90); dark: 自动反白 */
}
.card-meta {
  color: var(--app-B6-N3);     /* light: rgba(0,0,0,0.50); dark: 自动反白 */
}
.card {
  background: var(--app-B6);   /* light: 白; dark: 深色容器 */
  border-radius: var(--app-C3_2);  /* 12px, 集中维护 */
}
```

平台层 `:root` 已定义双套值，**dark mode 自动跟随**，业务代码只写一份。

## Why

- **深浅色一致性**：纯黑/纯白在 dark 模式下刺眼或对比度失衡；平台变量已做过视觉曲线调校。
- **代码量**：1 套 CSS 而不是 2 套（light + `@media (prefers-color-scheme: dark)`）。
- **维护性**：全局调主题色只需改 `:root`，不用全仓库 sed。
- **设计一致性**：UI 同学输出的 token 名与代码 1:1 对应，review 更直观。

## 选变量步骤

1. UI 稿告诉你颜色是 `rgba(0, 0, 0, 0.20)`
2. 去 `references/app-css-variables.md` **反查表**找 → 0.20 对应 `N6` 后缀，落在 `B*-N6` 系列
3. 看上下文挑：容器是 `--app-B6` 就用 `--app-B6-N6`；容器是 `--app-B2_2` 就用 `--app-B2_2-N6`
4. 字号 / 间距 / 圆角同理：18px 主标题 → `--app-T8-f` + `--app-T8-h`；16px 内边距 → `--app-P4`；12px 圆角 → `--app-C3_2`
