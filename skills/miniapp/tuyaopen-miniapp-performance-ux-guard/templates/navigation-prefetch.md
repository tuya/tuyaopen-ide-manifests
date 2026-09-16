# 导航预取 Hook 模板

提供 `startNavigationPrefetch`（点击侧触发）+ `useNavigationPrefetched`（下一页消费）一对 API，实现"用户点击 → navigate 与 fetch 并行 → 下一页直接用结果"的预取闭环。

规则参考：`rules/perf-navigation-prefetch.md`。

## 完整实现（自封装 hook 版）

```ts
// hooks/useNavigationPrefetch.ts
import { useEffect, useRef, useState } from 'react';

type Entry<T = any> = {
  promise: Promise<T>;
  status: 'pending' | 'fulfilled' | 'rejected';
  data?: T;
  error?: any;
  timestamp: number;
};

const store = new Map<string, Entry>();
const DEFAULT_TTL = 30_000; // 30s，预取后若未被消费则自动失效，避免内存堆积

/**
 * 点击侧：在用户点击的同时并行发起请求（与 navigateTo 同步触发）。
 * - 同 key 仍在新鲜期内 → 复用已有 in-flight Promise，不重复发起
 * - 异常会被 hook 在 fallback 中处理；这里 fire-and-forget
 */
export function startNavigationPrefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): void {
  const existing = store.get(key);
  if (existing && Date.now() - existing.timestamp < DEFAULT_TTL) {
    return;
  }
  const entry: Entry<T> = {
    promise: fetcher(),
    status: 'pending',
    timestamp: Date.now(),
  };
  store.set(key, entry as Entry);

  entry.promise.then(
    (data) => {
      entry.status = 'fulfilled';
      entry.data = data;
    },
    (error) => {
      entry.status = 'rejected';
      entry.error = error;
    },
  );
}

/**
 * 消费侧 hook（下一页）：
 * - 命中预取 fulfilled → 立即返回数据，清除条目
 * - 命中预取 pending  → 等结果
 * - 命中预取 rejected → 自动 fallback 自取
 * - 未命中           → 自动 fallback 自取
 */
export function useNavigationPrefetched<T>(
  key: string,
  fallback: () => Promise<T>,
): { data: T | null; loading: boolean; error: any } {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: any;
  }>({ data: null, loading: true, error: null });

  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    let cancelled = false;

    const runFallback = () => {
      fallbackRef.current().then(
        (data) => !cancelled && setState({ data, loading: false, error: null }),
        (error) => !cancelled && setState({ data: null, loading: false, error }),
      );
    };

    const entry = store.get(key) as Entry<T> | undefined;

    if (!entry) {
      runFallback();
      return () => { cancelled = true; };
    }

    if (entry.status === 'fulfilled') {
      setState({ data: entry.data as T, loading: false, error: null });
      store.delete(key);
      return () => { cancelled = true; };
    }

    if (entry.status === 'rejected') {
      store.delete(key);
      runFallback();
      return () => { cancelled = true; };
    }

    // pending：等结果
    entry.promise.then(
      (data) => {
        if (cancelled) return;
        setState({ data, loading: false, error: null });
        store.delete(key);
      },
      () => {
        if (cancelled) return;
        store.delete(key);
        runFallback();
      },
    );

    return () => { cancelled = true; };
  }, [key]);

  return state;
}

/**
 * 可选：主动清除某个 key（如用户取消跳转、token 失效需要重新获取）
 */
export function clearNavigationPrefetch(key: string): void {
  store.delete(key);
}
```

## 使用方式

```tsx
// 列表页：点击同时启动 fetch + navigate
import { navigateTo } from '@ray-js/ray';
import { startNavigationPrefetch } from '@/hooks/useNavigationPrefetch';

function CardItem({ item }) {
  const handleClick = () => {
    const key = `detail:${item.id}`;
    startNavigationPrefetch(key, () => fetchDetail(item.id));
    navigateTo({ url: `/pages/detail/index?id=${item.id}` });
  };
  return <View onClick={handleClick}>{item.title}</View>;
}

// 详情页：消费预取，没有则 fallback
import { useNavigationPrefetched } from '@/hooks/useNavigationPrefetch';

function DetailPage() {
  const { id } = router.params;
  const { data, loading, error } = useNavigationPrefetched(
    `detail:${id}`,
    () => fetchDetail(id),
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorView onRetry={() => location.reload()} />;
  return <DetailView data={data!} />;
}
```

## 替代方案：全局状态管理（Zustand 示例）

若项目已用 Redux / Zustand / Valtio / MobX 等全局状态库，可在 store 里维护等价能力，思路一致——把请求结果（或 in-flight Promise）按 key 共享给下一页：

```ts
// store/navigationPrefetch.ts
import { create } from 'zustand';

type Cache = { data?: any; promise?: Promise<any>; ts: number };

interface State {
  store: Record<string, Cache>;
  start: <T>(key: string, fetcher: () => Promise<T>) => void;
  consume: <T>(key: string) => Promise<T | undefined>;
}

const TTL = 30_000;

export const useNavigationPrefetchStore = create<State>((set, get) => ({
  store: {},

  start: (key, fetcher) => {
    const current = get().store[key];
    if (current && Date.now() - current.ts < TTL) return;
    const promise = fetcher().then((data) => {
      set((s) => ({ store: { ...s.store, [key]: { data, ts: Date.now() } } }));
      return data;
    });
    set((s) => ({ store: { ...s.store, [key]: { promise, ts: Date.now() } } }));
  },

  consume: async (key) => {
    const entry = get().store[key];
    if (!entry) return undefined;
    const value = entry.data ?? (await entry.promise.catch(() => undefined));
    set((s) => {
      const next = { ...s.store };
      delete next[key];
      return { store: next };
    });
    return value;
  },
}));
```

业务侧调用：`start(key, fetcher)` 在列表页点击时调用，`consume(key)` 在详情页 mount 时调用，配合自身组件 state 管理 loading/error。

## 注意事项

- **TTL**：默认 30 秒过期，避免长时间未消费的条目堆积内存。可按业务调整或加 `setInterval` 主动 GC。
- **失败必降级**：预取失败 → 自动 fallback 自取；两者都失败才报错给用户。
- **不要预取整列表**：列表里几十个 item，只对**用户即将点击的当前 item**预取，不要遍历列表全预取。
- **作用域**：本机制是**短时跨页传递**，不是缓存层；命中后清除，下次进入再走新请求，避免拿到陈旧数据。
- **跟 `launch-data-prefetch` 互补**：app 启动期已知参数（`homeId` 等）走 `global.config.ts` 静态预取；点击时才确定参数的走本模板。

## 关联

- `rules/perf-navigation-prefetch`：本模板对应的 rule
- `rules/launch-data-prefetch`：启动期静态预取
- `rules/perf-serial-requests`：同一页面内并行
- `templates/request-wrapper.md`：请求层 timeout / retry / error 标准封装
