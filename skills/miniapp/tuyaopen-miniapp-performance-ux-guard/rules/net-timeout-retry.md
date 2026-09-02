---
id: net-timeout-retry
priority: MEDIUM-HIGH
category: Network > Resilience
---

# 网络请求必须超时与重试

## Rule
所有网络请求必须设置超时时间并实现失败重试策略。

## Bad

```js
request({ url });
```

未设置 timeout，弱网下可能长时间挂起无反馈。

## Good

```js
await requestWithRetry({
  url,
  timeout: 10000,
  retries: 2,
  retryDelay: exponentialBackoff,
});
```

限定单次等待时间，并对可恢复失败做有限重试。

## Why
无超时设置在弱网环境下导致请求无限挂起，用户界面「假死」。重试机制提升弱网成功率。
