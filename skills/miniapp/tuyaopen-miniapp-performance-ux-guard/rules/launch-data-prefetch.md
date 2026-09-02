---
id: launch-data-prefetch
priority: MEDIUM-HIGH
category: Launch > Data
---

# 首屏强依赖数据应预取

## Rule

首屏强依赖且参数稳定的数据可以接入数据预取，在页面代码加载前并行发起请求；适合接入的接口必须同时满足：
- **首屏强依赖**：页面 mount 后就要用到，越早拿到越好
- **参数稳定**：参数只来自启动上下文（如 `homeId`、设备 ID）或常量，不依赖用户实时输入 / 登录后动态参数 / 上一页异步结果

不要把所有请求都接入预取；命中率低 / 参数动态的预请求会浪费并发、流量和缓存空间，反而拖慢启动。**用户点击触发跳转、参数在点击瞬间才确定的场景，请用 `perf-navigation-prefetch`**（导航并行预取），跟本规则互补不重叠。

## 配置（`global.config.ts` 的 `preFetch` 字段）

在工程根 `src/global.config.ts` 的 `preFetch` 字段里声明哪些接口需要预请求；每个 key 对应一个接口配置。

```ts
// src/global.config.ts
export const tuya = {
  themeLocation: "theme.json",
  window: { /* ... */ },
  preFetch: {
    // key 是业务自定义的标识，消费时通过 fetchKey 引用
    init: {
      api: "/v1.0/m/life/ai/memo/init",
      data: { gid: "{{homeId}}" },     // 启动模板变量,支持 {{homeId}} 等
      method: "POST",
      validity: 5,                      // 缓存消费有效期(秒)
    },
    list: {
      api: "/v1.0/m/life/ai/memo/memo-list",
      data: { gid: "{{homeId}}", pageNo: "1", pageSize: "20" },
      method: "GET",
      validity: 5,
    },
  },
};
```

字段含义：

| 字段 | 含义 | 备注 |
|---|---|---|
| `api` | 接口路径 | 同 `ty.apiRequestByHighway/ByAtop` 的 `api` |
| `data` | 请求参数 | 支持 `{{homeId}}` 等启动模板变量做静态替换；运行时拿不到的参数**不要**写在这里 |
| `method` | 请求方法 | `GET` / `POST` |
| `validity` | 缓存窗口(秒) | 超过该窗口未消费,缓存被清理;在窗口内**只能被消费一次** |

> `validity` 不是缓存 TTL,是"消费有效期"：消费一次后缓存仍在,但**不应再被使用**；大部分业务只该消费一次,后续重复请求应走实时接口。

## 消费侧用法（页面/组件内）

在调用接口处加 `fetchKey`（引用 `preFetch` 配置 key）+ `validate`（响应校验函数）：

```ts
import { raceFetch } from "@tuya-fe/mini-prefetch";

const raceRequestByHighway = raceFetch(ty.apiRequestByHighway);
// 如果是 atop 接口：
// const raceRequestByAtop = raceFetch(ty.apiRequestByAtop);

let firstFlag = true;  // 确保 fetchKey 只用一次,后续重复调用接口不该再使用预请求缓存

raceRequestByHighway<IMemoDetail>({
  api: "/v1.0/m/life/ai/memo/init",
  method: "POST",
  data: { gid },
  fetchKey: firstFlag ? "init" : undefined,    // 引用 preFetch 配置的 key,空则走普通请求
  validate: (res) => {                          // 校验响应是否真的属于本接口
    firstFlag = false;
    return !!res?.memoId;                       // 返回 false → 丢弃预请求结果,走实时请求
  },
});
```

要点：
- `fetchKey` 仅在**首次消费**时给值，后续调用置 `undefined`（不要重复用同一缓存）
- `validate` **必须实现**：根据响应字段判定数据归属，校验失败会自动丢弃错误数据并由 raceFetch 兜底
- `raceFetch` 包装后，会**并行发起**预请求消费 + 实时请求，取最快且 `validate` 通过的结果

## 关键陷阱

1. **安卓 < 6.11.0 多并发预请求会串扰**：配置多个 preFetch 接口时，res 有概率被错配到别的接口（A 收到 B 的响应）；接口失败也不会触发 fail 回调。必须用 `@tuya-fe/mini-prefetch` 的 `raceFetch` 包装，靠 `validate` 校验 + 实时请求兜底。
2. **单接口可简化**：项目只有一个 preFetch 接口时不存在串扰，可直接 `ty.apiRequestByHighway` + `fetchKey`，无需 raceFetch。也可在 `project.json` 用 kit 版本约束让安卓 < 6.11.0 走老版本（只一个 preFetch），新版本再配多个。
3. **动态参数不能进 `preFetch.data`**：登录后参数、上一页传入参数、用户输入参数都无法做静态替换，写进去等于无效预取。
4. **缓存只消费一次**：列表搜索这种"相同参数不同时间结果不同"的场景，第二次起必须走实时请求。

## Bad (Ray 小程序)

```tsx
function openDetail(item) {
  navigateTo({
    url: `/pages/detail/index?id=${item.id}&token=${runtimeToken}`,
  });
}

// global.config.ts 试图把依赖 item.id + runtimeToken 的详情接口配置为静态预请求
preFetch: {
  detail: {
    api: "/v1.0/m/life/detail",
    data: { id: "{{itemId}}", token: "{{runtimeToken}}" },  // 启动期拿不到
    method: "GET",
    validity: 5,
  },
}
```

动态参数来自点击项和运行时 token，启动模板拿不到 → 静态预请求无法可靠命中，反而增加无效请求；且没有 `validate`、没用 `raceFetch`，安卓老版本下还有串扰风险。

## Good (Ray 小程序)

```ts
// src/global.config.ts —— 只对首屏强依赖、参数稳定的接口预取
preFetch: {
  homeFeed: {
    api: "/v1.0/m/home/feed",
    data: { gid: "{{homeId}}" },
    method: "GET",
    validity: 5,
  },
}
```

```tsx
import { raceFetch } from "@tuya-fe/mini-prefetch";
const raceRequestByHighway = raceFetch(ty.apiRequestByHighway);

function HomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const firstFetchRef = useRef(true);

  useEffect(() => {
    raceRequestByHighway<FeedResp>({
      api: "/v1.0/m/home/feed",
      method: "GET",
      data: { gid: currentHomeId },
      fetchKey: firstFetchRef.current ? "homeFeed" : undefined,
      validate: (res) => {
        firstFetchRef.current = false;
        return Array.isArray(res?.list);
      },
    }).then((res) => setFeed(res.list));
  }, []);

  return <HomeFeed list={feed} />;
}
```

仅对首屏强依赖、参数稳定且命中率高的 feed 做预取；动态详情页保留页面内请求；用 `raceFetch` + `validate` 兜底串扰风险。

## Why

数据预取将网络请求与代码加载并行，可节省首屏数据等待时间。但预取不是越多越好：低命中或参数动态的预请求会浪费并发、流量和缓存空间。安卓老版本（< 6.11.0）多并发预请求还存在串扰，必须用 `@tuya-fe/mini-prefetch` + `validate` 双重保障防止数据错配。
