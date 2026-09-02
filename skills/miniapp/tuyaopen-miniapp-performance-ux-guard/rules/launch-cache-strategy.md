---
id: launch-cache-strategy
priority: MEDIUM-HIGH
category: Launch > Data
---

# 首屏请求采用缓存优先

## Rule
首屏请求可对不频繁变化、用户使用期间只需展示一次或弱网下可接受短暂陈旧的数据采用缓存优先策略（先展示缓存，后静默更新）。不要把所有接口结果都缓存；缓存前必须评估数据时效性、单条大小、总存储占用和内存缓存挤占，避免影响其他关键缓存。

## Bad (Ray 小程序)
```tsx
async function loadHome() {
  const [feed, profile, realtimeStatus] = await Promise.all([
    fetchFeed(),
    fetchProfile(),
    fetchRealtimeStatus(),
  ]);

  await Promise.all([
    setStorage({ key: 'feed_cache', data: JSON.stringify(feed) }),
    setStorage({ key: 'profile_cache', data: JSON.stringify(profile) }),
    setStorage({ key: 'status_cache', data: JSON.stringify(realtimeStatus) }),
  ]);

  setHomeData({ feed, profile, realtimeStatus });
}
```
不区分数据时效性和大小，连实时状态也缓存，容易展示过期数据并占用本地存储。

## Good (Ray 小程序)
```tsx
const HOME_FEED_CACHE_KEY = 'home_feed_cache';
const HOME_FEED_CACHE_TTL = 6 * 60 * 60 * 1000;

async function loadHomeFeed() {
  const cached = await getStorage({ key: HOME_FEED_CACHE_KEY }).catch(() => null);
  const parsed = cached?.data ? JSON.parse(cached.data) : null;

  if (parsed && Date.now() - parsed.updatedAt < HOME_FEED_CACHE_TTL) {
    setFeed(parsed.value);
  }

  const fresh = await fetchHomeFeed();
  setFeed(fresh);

  if (estimateCacheSize(fresh) < 200 * 1024) {
    await setStorage({
      key: HOME_FEED_CACHE_KEY,
      data: JSON.stringify({ value: fresh, updatedAt: Date.now() }),
    });
  }
}
```
只缓存低频变更且体积可控的首页 feed，带 TTL 和大小限制；实时状态仍走实时请求。

## Why
缓存优先策略能让弱网首屏快速展示，但过度缓存会带来陈旧数据、本地存储膨胀和内存缓存挤占。缓存应该服务首屏体验，而不是替代所有数据请求。
