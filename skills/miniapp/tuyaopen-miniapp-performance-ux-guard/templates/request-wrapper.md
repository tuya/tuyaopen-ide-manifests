# 请求包装器模板

封装 timeout / retry / error handling 的标准请求模式。Build 模式下网络请求默认参考此模板。

基于 Ray（`@ray-js/ray`）+ ahooks `useRequest`。

## 基础封装（带 timeout + retry）

```ts
const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(options: {
  url: string;
  method?: "GET" | "POST";
  data?: Record<string, any>;
  timeout?: number;
  retries?: number;
}): Promise<T> {
  const {
    url,
    method = "GET",
    data,
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
  } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await new Promise<T>((resolve, reject) => {
        ty.request({
          url,
          method,
          data,
          timeout,
          success: (r: any) => {
            if (r.statusCode >= 200 && r.statusCode < 300) {
              resolve(r.data);
            } else {
              reject(new Error(`HTTP ${r.statusCode}`));
            }
          },
          fail: (e: any) =>
            reject(new Error(e.errMsg || I18n.t("network_error"))),
        });
      });
      return res;
    } catch (e: any) {
      lastError = e;
      if (attempt < retries) {
        await sleep(RETRY_DELAY_BASE * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}
```

## 配合 ahooks useRequest 使用

项目中推荐使用 ahooks `useRequest` 管理请求状态，服务函数本身只做数据获取：

```tsx
import { useRequest } from "ahooks";

// 服务函数（纯数据获取，由 ATOP 层封装了 timeout/retry）
async function fetchTaskList(params: TaskListParams) {
  return queryTaskHistoryAtop(params);
}

// 组件中使用
const { data, loading, error, runAsync } = useRequest(fetchTaskList, {
  manual: true,
});

// 手动触发
const handleLoad = async () => {
  try {
    const res = await runAsync(params);
    // 处理数据
  } catch (e: any) {
    ty.showToast({
      title: e?.message || I18n.t("load_failed"),
      icon: "none",
      duration: 2000,
    });
  }
};
```

## 多请求并行

无依赖请求使用 `Promise.allSettled` 并行发起，隔离单个请求的失败：

```tsx
const [dataResult, creditsResult] = await Promise.allSettled([
  queryTaskHistoryFn(params),
  queryCreditsFn(),
]);

if (dataResult.status === "fulfilled") {
  setList(dataResult.value?.list || []);
}

if (creditsResult.status === "fulfilled" && creditsResult.value) {
  setCredits(creditsResult.value.remainingPoints);
}
```

## 关联规则

- `net-timeout-retry`
- `net-concurrent-limit`
- `ix-error-recovery`
