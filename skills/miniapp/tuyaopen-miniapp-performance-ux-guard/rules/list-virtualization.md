---
id: list-virtualization
priority: HIGH
category: List > Rendering
---

# 长列表必须虚拟化或分页

## Rule
超过 50 项的列表必须使用虚拟列表/分页/增量渲染策略，禁止一次性全量渲染。

## Bad (Ray 小程序)
```tsx
<View>
  {allItems.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</View>
```
全量创建 DOM 节点（`allItems` 可达 200+ 条）。

## Good (Ray 小程序)
```tsx
<VirtualList
  data={visibleItems}
  itemHeight={160}
  renderItem={({ item }) => <ItemCard item={item} />}
/>

// 或分页：每页 20 条 + 触底加载更多
```
仅渲染可视区域或当前页，避免一次性挂载全部项。

## Why
全量渲染长列表导致大量 DOM 节点，内存飙升、首次渲染缓慢、滑动帧率下降。虚拟列表仅渲染可视区域，性能稳定。
