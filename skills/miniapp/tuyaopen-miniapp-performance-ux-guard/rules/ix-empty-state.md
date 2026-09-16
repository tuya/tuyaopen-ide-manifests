---
id: ix-empty-state
priority: MEDIUM
category: Interaction > State
---

# 异常状态专属 UI

## Rule

必须为空数据、加载中、错误、弱网四种异常状态设计专属 UI，禁止展示空白或 broken UI。

## Bad (Ray 小程序)

```tsx
function ListView({ items }) {
  return (
    <View>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </View>
  );
}
```

列表数据为空时直接渲染为一片空白 — 用户不知是加载中还是无数据。

## Good (Ray 小程序)

```tsx
function ListView() {
  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <ErrorRetry message={I18n.t('load_failed')} onRetry={loadData} />;
  }

  if (items.length === 0) {
    return <EmptyState title={I18n.t('empty_no_data')} />;
  }

  return (
    <View>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </View>
  );
}
```

Ray/React 页面先判断 loading/error/empty，再渲染成功态，避免空数组直接渲染成白屏。

## Why

异常状态是用户高频遇到的场景。清晰的空状态引导和错误提示能显著降低用户困惑和流失。
