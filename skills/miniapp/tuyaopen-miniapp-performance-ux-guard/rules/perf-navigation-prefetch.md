---
id: perf-navigation-prefetch
priority: MEDIUM-HIGH
category: Performance > Data Fetching
---

# 跨页导航时并行预取下一页数据

## Rule

用户点击触发页面跳转、且下一页强依赖某个接口数据时，**应在点击的同时并行发起请求**，让 `navigateTo` 与网络请求并行执行；下一页 mount 时优先消费已发起/已完成的请求结果，不再串行 `navigate → mount → fetch`。

适用条件（同时满足）：

- 接口参数在**点击处已知**（item.id、目标 page 的 id、当前 token 等运行时值）
- 接口结果**只用于下一页**（不影响当前页）
- 接口可重入或自带去重（连点不会污染数据）

不适用的场景：

- 参数还需异步计算才能确定（如 form 校验通过后才能得到 id）
- 跳转有强分支（点击后可能去 A / B 两个不同页面，难提前命中）

## Bad (Ray 小程序)

```tsx
// 列表页：点击只触发跳转
function CardItem({ item }) {
  return (
    <View onClick={() => navigateTo({ url: `/pages/detail/index?id=${item.id}` })}>
      {item.title}
    </View>
  );
}

// 详情页：mount 完才开始请求
function DetailPage() {
  const { id } = router.params;
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    fetchDetail(id).then(setDetail);   // 串行：navigate 完成才发起
  }, [id]);
  // ...
}
```

时序：`点击 → navigate(~200ms) → useEffect(~50ms) → fetch(~400ms) → 渲染`。用户感知等待 ~650ms，且这段全程是 loading / 白屏。

## Good (Ray 小程序)

```tsx
import { navigateTo } from '@ray-js/ray';
import { startNavigationPrefetch, useNavigationPrefetched } from '@/hooks/useNavigationPrefetch';

// 列表页：点击同时启动 fetch + navigate
function CardItem({ item }) {
  const handleClick = () => {
    startNavigationPrefetch(`detail:${item.id}`, () => fetchDetail(item.id));
    navigateTo({ url: `/pages/detail/index?id=${item.id}` });
  };
  return <View onClick={handleClick}>{item.title}</View>;
}

// 详情页：优先消费预取结果，没有则 fallback 自取
function DetailPage() {
  const { id } = router.params;
  const { data, loading, error } = useNavigationPrefetched(
    `detail:${id}`,
    () => fetchDetail(id),  // fallback：未命中预取时自己拉
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorView onRetry={...} />;
  return <DetailView data={data!} />;
}
```

时序：`点击 → fetch(~400ms) ∥ navigate(~200ms) → 详情页 mount → 已有数据 → 渲染`。预取覆盖时总等待 ≈ max(fetch, navigate) ≈ 400ms，省下约 30-50% 等待。

完整 hook 实现见 `templates/navigation-prefetch.md`，包含全局状态库（Redux/Zustand）的等价替代方案。

## 关键陷阱

1. **预取失败必须能降级**：hook 必须在预取失败时自动回退到 fallback 函数；不能让下一页因为预取失败一直 loading 或白屏。
2. **连点去重**：同 key 已 in-flight 时不要重复发起，否则连续点击会打出多份请求。
3. **跳转取消 / 用户回退**：长时间未消费的预取条目要能自然过期（TTL）+ 命中后自动清除，避免内存堆积或下一次进入页面拿到陈旧数据。
4. **不要全列表预取**：列表里 50 个 item，**不要**每个 item 都预取；只对"用户即将点击的下一个"、"曝光到首屏的前 N 个"或"点击瞬间触发的当前 item"预取，否则浪费带宽。
5. **跟启动预取的边界**：参数在 app 启动期就已知（如 `homeId`），用 `launch-data-prefetch` 静态预取；参数要等用户点击时才确定，用本规则。两条规则**互补**不重叠。

## Why

冷启动/跳转新页时，`navigateTo` 与首屏 `fetch` 都是 200-500ms 量级耗时操作。串行执行总耗时 ≈ navigate + fetch；并行后 ≈ max(navigate, fetch)，典型场景**省 30-50% 等待时间**。从用户感知上，"点击与内容出现之间的卡顿"被显著缩短，loading / 骨架屏的暴露时间也大幅减少。

## 关联

- `launch-data-prefetch`：启动期静态参数预取（app 启动时参数已知）
- `perf-serial-requests`：同一页面内多个无依赖请求并行
- `ix-async-chain`：异步状态机（loading / error / empty 完整覆盖）
- `templates/navigation-prefetch.md`：完整 hook 实现 + 全局状态库替代方案
