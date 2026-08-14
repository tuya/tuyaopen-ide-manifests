---
id: net-image-sign-cache
priority: HIGH
category: Network > Image Cache
---

# 私有图片签名 URL 持久缓存

## Rule
私有云存储图片（签名 URL）必须按唯一业务 ID 缓存首次签名地址到本地存储，后续渲染复用缓存 URL 以命中浏览器/小程序 HTTP 缓存，避免签名变化导致重复下载。

## Bad
```tsx
<Image src={item.targetUrl} />
```
每次轮询/刷新返回新签名 URL → Image 视为新资源 → 重复下载同一张图片，弱网下体验极差。

## Good
```tsx
// CachedImage 组件：稳定签名 URL，利用 HTTP 缓存
<CachedImage cacheKey={item.taskId} src={item.targetUrl} />

// MapCache：内存 + ty.setStorage 双层缓存，跨会话复用
const cache = new MapCache<string>(THREE_DAYS, 200, "__PRIVATE_IMG_SIGN__");
```
1. 以业务唯一 ID（如 taskId）为 key，首次写入签名 URL
2. 后续渲染返回缓存的旧 URL → Image 看到相同 URL → HTTP 缓存命中 → 不下载
3. 本地持久化（ty.setStorage）→ 第二次打开小程序也能秒开
4. onError 时用最新 src 覆盖缓存并重试，防止签名过期导致死图

## Why
私有图片签名 URL 每次请求都会变化，但图片内容不变。不缓存签名地址会导致同一张图被反复下载，浪费带宽并大幅增加加载时间。弱网环境下用户会看到图片反复 loading 闪烁。通过持久缓存稳定 URL，利用浏览器原生 HTTP 缓存机制实现二次访问秒开。

## Implementation Checklist
- [ ] 使用 `CachedImage` 组件替代 `Image` 渲染私有签名图片
- [ ] MapCache 启用 `storageKey` 参数进行本地持久化
- [ ] TTL 设置小于签名有效期（如签名 7 天有效，缓存 3 天）
- [ ] maxSize 控制缓存条目上限，防止 storage 膨胀
- [ ] onError 回退机制：清旧缓存 → 写入最新 src → 重试
