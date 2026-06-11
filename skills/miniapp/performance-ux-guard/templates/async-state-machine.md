# 异步链路标准状态机模板

在 Build 模式下生成任何异步操作时，默认使用此模板。覆盖 loading / success / error / empty / retry 四态。

基于 Ray（`@ray-js/ray`）+ React Hooks + ahooks `useRequest` + `@ray-js/smart-ui`。

## 通用 Hook

```tsx
import { useState, useCallback, useRef } from "react";

type PageState = "loading" | "success" | "error" | "empty";

interface AsyncStateOptions<T> {
  fetchFn: () => Promise<T>;
  isEmpty?: (data: T) => boolean;
}

function useAsyncState<T>({ fetchFn, isEmpty }: AsyncStateOptions<T>) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [data, setData] = useState<T | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setPageState("loading");
    setErrorMsg("");
    try {
      const res = await fetchFn();
      if (!mountedRef.current) return;
      const empty = isEmpty ? isEmpty(res) : !res;
      setData(res);
      setPageState(empty ? "empty" : "success");
    } catch (e: any) {
      if (!mountedRef.current) return;
      setPageState("error");
      setErrorMsg(e?.message || I18n.t("load_failed"));
    }
  }, [fetchFn, isEmpty]);

  const retry = useCallback(() => {
    run();
  }, [run]);

  const cleanup = useCallback(() => {
    mountedRef.current = false;
  }, []);

  return { pageState, data, errorMsg, run, retry, cleanup };
}
```

## 页面级使用

```tsx
import React, { useEffect } from "react";
import { View, Text } from "@ray-js/ray";
import { Loading, Button } from "@ray-js/smart-ui";
import Empty from "@src/components/empty";
import styles from "./index.less?modules";

export default function MyPage() {
  const { pageState, data, errorMsg, run, retry, cleanup } = useAsyncState({
    fetchFn: () => fetchMyData(),
    isEmpty: (res) => !res?.list?.length,
  });

  useEffect(() => {
    run();
    return cleanup;
  }, [run, cleanup]);

  if (pageState === "loading") {
    return (
      <View className={styles.loadingContainer}>
        <Loading size="40px" />
      </View>
    );
  }

  if (pageState === "error") {
    return (
      <View className={styles.errorContainer}>
        <Text className={styles.errorText}>{errorMsg}</Text>
        <Button size="small" onClick={retry}>
          {I18n.t("retry")}
        </Button>
      </View>
    );
  }

  if (pageState === "empty") {
    return <Empty data={emptyConfig} />;
  }

  return (
    <View className={styles.container}>
      {/* 正常内容 */}
    </View>
  );
}
```

## 配合 ahooks useRequest

当使用 ahooks `useRequest` 时，可直接利用其内置的 loading/error 状态：

```tsx
import { useRequest } from "ahooks";
import { View, Text } from "@ray-js/ray";
import { Loading, Button } from "@ray-js/smart-ui";
import Empty from "@src/components/empty";

export default function MyPage() {
  const { data, loading, error, run } = useRequest(fetchMyData, {
    manual: false,
  });

  const isEmpty = !data?.list?.length;

  if (loading) {
    return (
      <View className={styles.loadingContainer}>
        <Loading size="40px" />
      </View>
    );
  }

  if (error) {
    return (
      <View className={styles.errorContainer}>
        <Text className={styles.errorText}>
          {error.message || I18n.t("load_failed")}
        </Text>
        <Button size="small" onClick={run}>
          {I18n.t("retry")}
        </Button>
      </View>
    );
  }

  if (isEmpty) {
    return <Empty data={emptyConfig} />;
  }

  return (
    <View className={styles.container}>
      {/* 正常内容 */}
    </View>
  );
}
```

## 操作类异步（防重提交）

对于按钮触发的副作用操作（创建任务、提交表单等），使用 ref guard 防止重复提交：

```tsx
const submittingRef = useRef(false);

const handleSubmit = async (params: SubmitParams) => {
  if (submittingRef.current) return;
  submittingRef.current = true;
  try {
    const res = await createTaskFn(params);
    ty.showToast({ title: I18n.t("submit_success"), icon: "success" });
  } catch (error: any) {
    ty.showToast({
      title: error?.message || I18n.t("submit_failed"),
      icon: "none",
      duration: 2000,
    });
  } finally {
    submittingRef.current = false;
  }
};
```

## 多请求并行初始化

首屏需要并行发起多个请求时，使用 `Promise.allSettled` 隔离失败：

```tsx
const loadInitialData = useCallback(async () => {
  const [dataResult, configResult] = await Promise.allSettled([
    fetchDataFn(),
    fetchConfigFn(),
  ]);

  if (!mountedRef.current) return;

  if (dataResult.status === "fulfilled") {
    setData(dataResult.value);
  }

  if (configResult.status === "fulfilled") {
    setConfig(configResult.value);
  }

  setInitialLoading(false);
}, [fetchDataFn, fetchConfigFn]);

useEffect(() => {
  mountedRef.current = true;
  loadInitialData().catch(() => {
    if (mountedRef.current) setInitialLoading(false);
  });
  return () => {
    mountedRef.current = false;
  };
}, [loadInitialData]);
```

## 关联规则

- `ix-async-chain`
- `ix-error-recovery`
- `ix-empty-state`
- `ix-duplicate-submit`
- `content-error-message`
