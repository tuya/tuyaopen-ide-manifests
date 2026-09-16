---
id: obs-trace-correlation
priority: HIGH
category: Observability > Tracing
---

# 反馈事件与后端链路关联

## Rule
反馈事件必须携带 sessionId/requestId/taskId 等关联标识，确保用户反馈可与后端链路打通。

## Bad
```js
// 体验反馈与后端日志各自独立：仅上报「卡了」，无 requestId / sessionId
reportFeedback({ message: '卡了' });
```
用户说「卡了」但无法定位到具体请求。

## Good
```js
// 请求层注入 requestId；页面层维护 sessionId；上报时一并携带
reportEvent({
  sessionId,
  requestId,
  taskId,
  // ... 其余业务字段
});
```
后端可通过同一 requestId 查询链路，实现反馈与日志对齐。

## Why
反馈归因依赖链路贯通。如果前端埋点与后端日志无关联 ID，问题定位需要猜测而非查询，排查效率降低一个数量级。
