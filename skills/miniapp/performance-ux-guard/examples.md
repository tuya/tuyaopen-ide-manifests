# Miniapp Performance UX Guard Examples

以下示例覆盖三类：**Build 模式示例**（生成代码时使用模板）、**代码级模式示例**（Bad/Good 对比）和**审查输出示例**（Review 输出风格）。

Bad/Good 代码示例默认优先使用 Ray 小程序写法；确实需要展示原生小程序模板语法时，需补充 Ray/TSX 等价示例。

## 目录

- **Part A — Build Mode Examples**
  - A0. Build Guardrails 输出示例
  - A0b. Build 模式下使用模板生成代码
- **Part B — Code Pattern Examples**
  - B1. setData 粒度优化（`perf-setdata-granularity`）
  - B2. 请求并行化（`perf-serial-requests`）
  - B3. 按钮防重提交（`ix-duplicate-submit`）
  - B4. 生命周期清理（`perf-lifecycle-cleanup`）
  - B5. 体验埋点标准上报（`obs-feedback-schema`）
  - B6. 滚动事件节流（`list-scroll-throttle`）
  - B7. 安全区域适配（`layout-safe-area`）
  - B8. 弹窗滚动穿透处理（`layout-scroll-penetration`）
  - B9. 错误提示规范（`content-error-message`）
  - B10. 缓存优先首屏渲染（`launch-cache-strategy`）
- **Part C — Review Output Examples**
  - C1. Create task flow review
  - C2. Startup + feedback loop review

---

## Part A — Build Mode Examples

### A0. Build Guardrails 输出示例

用户请求：

> "帮我写一个创建任务的功能，点击按钮后调用接口创建任务，创建成功后开始轮询状态。"

AI 在生成代码前先输出：

```markdown
## Build Guardrails（本次适用）
- [x] 异步操作：使用 async-state-machine 模板（创建+轮询均需 loading/error/success 态）
- [x] 网络请求：使用 request-wrapper 模板（timeout=10s, retry=2）
- [x] 防重提交：创建按钮需加 submitting guard
- [x] setData：路径更新，轮询结果仅更新变化项
- [x] 生命周期清理：onUnload 清理轮询定时器
- [x] 埋点：创建操作上报 experience_event（含 duration + errorCode）
```

然后开始编码，代码中直接内建上述护栏。

### A0b. Build 模式下使用模板生成代码

用户请求：

> "帮我写一个页面加载数据的逻辑，需要支持缓存优先和失败重试。"

AI 直接使用 `templates/async-state-machine.md` + `templates/request-wrapper.md` 生成：

```tsx
import React, { useCallback, useEffect, useState } from 'react'
import { getStorage, setStorage, View } from '@ray-js/ray'
import { request } from '../../utils/request'
import I18n from '../../i18n'

type PageState = 'loading' | 'success' | 'empty' | 'error'

export default function ListPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [listData, setListData] = useState([])

  const fetchData = useCallback(async (hasCurrentData = false) => {
    setPageState((current) => (hasCurrentData || current === 'success' ? 'success' : 'loading'))
    try {
      const res = await request({ url: '/api/list', timeout: 10000, retries: 2 })
      const nextList = res.data || []
      setListData(nextList)
      setPageState(nextList.length > 0 ? 'success' : 'empty')
      await setStorage({ key: 'listData', data: JSON.stringify(nextList) })
    } catch (e) {
      if (!hasCurrentData) {
        setErrorMessage(I18n.t('load_failed_retry'))
        setPageState('error')
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const cached = await getStorage({ key: 'listData' }).catch(() => null)
      if (cancelled) {
        return
      }
      if (cached?.data) {
        const parsed = JSON.parse(cached.data)
        setListData(parsed)
        setPageState('success')
        await fetchData(parsed.length > 0)
        return
      }
      await fetchData(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [fetchData])

  return (
    <View>
      {/* Render loading / error / empty / success states here */}
    </View>
  )
}
```

---

## Part B — Code Pattern Examples

### B1. setData 粒度优化（`perf-setdata-granularity`）

Bad:

```js
this.setData({
  userInfo: { ...this.data.userInfo, nickname: newName }
})
```

Good:

```js
this.setData({ 'userInfo.nickname': newName })
```

### B2. 请求并行化（`perf-serial-requests`）

Bad:

```js
const user = await getUserInfo()
const config = await getAppConfig()
const credits = await getCredits()
```

Good:

```js
const [user, config, credits] = await Promise.all([
  getUserInfo(),
  getAppConfig(),
  getCredits()
])
```

### B3. 按钮防重提交（`ix-duplicate-submit`）

Bad:

```js
async handleCreate() {
  const res = await createTask(this.data.params)
  this.setData({ taskId: res.taskId })
}
```

Good:

```js
async handleCreate() {
  if (this.data.submitting) return
  this.setData({ submitting: true })
  try {
    const res = await createTask(this.data.params)
    this.setData({ taskId: res.taskId })
  } catch (e) {
    ty.showToast({ title: I18n.t('create_failed_retry'), icon: 'none' })
  } finally {
    this.setData({ submitting: false })
  }
}
```

### B4. 生命周期清理（`perf-lifecycle-cleanup`）

Bad:

```js
onLoad() {
  this.pollTimer = setInterval(() => this.pollStatus(), 3000)
}
// 无 onUnload
```

Good:

```js
onLoad() {
  this.pollTimer = setInterval(() => this.pollStatus(), 3000)
},
onUnload() {
  clearInterval(this.pollTimer)
  this.pollTimer = null
}
```

### B5. 体验埋点标准上报（`obs-feedback-schema`）

Bad:

```js
ty.reportAnalytics('slow', { page: 'home' })
```

Good:

```js
reportExperienceEvent({
  eventType: 'page_slow',
  duration: 3200,
  errorCode: '',
  action: 'page_load',
  requestId: this.data.lastRequestId,
})
```

### B6. 滚动事件节流（`list-scroll-throttle`）

Bad:

```js
onScroll(e) {
  this.setData({ scrollTop: e.detail.scrollTop })
}
```

Good:

```js
onScroll: throttle(function(e) {
  this.setData({ scrollTop: e.detail.scrollTop })
}, 50)
```

### B7. 安全区域适配（`layout-safe-area`）

Bad:

```css
.bottom-bar { position: fixed; bottom: 0; height: 100rpx; }
```

Good:

```css
.bottom-bar { position: fixed; bottom: 0; height: 100rpx; padding-bottom: env(safe-area-inset-bottom); }
```

### B8. 弹窗滚动穿透处理（`layout-scroll-penetration`）

Bad:

```ttml
<view class="modal-mask" bindtap="onClose">
  <view class="modal-content">...</view>
</view>
```

Good:

```ttml
<view class="modal-mask" catchtouchmove="preventMove" bindtap="onClose">
  <view class="modal-content" catchtap="noop">...</view>
</view>
```

### B9. 错误提示规范（`content-error-message`）

Bad:

```js
ty.showToast({ title: 'Error 500', icon: 'none' })
```

Good:

```js
ty.showToast({ title: I18n.t('network_error_retry'), icon: 'none' })
```

### B10. 缓存优先首屏渲染（`launch-cache-strategy`）

Bad:

```js
async onLoad() {
  const data = await fetchHomeData()
  this.setData({ homeData: data })
}
```

Good:

```js
async onLoad() {
  const cached = ty.getStorageSync('homeData')
  if (cached) {
    this.setData({ homeData: cached })
  }
  try {
    const fresh = await fetchHomeData()
    this.setData({ homeData: fresh })
    ty.setStorageSync('homeData', fresh)
  } catch (e) {
    if (!cached) {
      this.setData({ error: I18n.t('load_failed_retry') })
    }
  }
}
```

Ray 小程序中只缓存低频变化、体积可控、允许短暂陈旧的数据；实时状态或依赖动态参数的数据不应套用缓存优先。

---

## Part C — Review Output Examples

### C1. Create task flow review

#### Input

> "帮我 review 一下 image2video 的创建任务流程，主要看性能和交互。"

#### Expected output style

```markdown
## Risk Summary
- Blocking: 0
- High: 2
- Medium: 2

## Findings
1. [High] 创建后轮询启动时机固定延迟 — `ix-async-chain`
   - Location: `submitTask` in `src/pages/home/modules/image2Video/index.tsx`
   - Why it matters: 用户提交后可能短时间看不到进度变化
   - Fix: 先立即触发一次状态查询，再进入 interval 轮询
   - Verify: 提交后 1s 内可见任务进入等待/生成态

2. [High] 轮询定时器在页面卸载后未清理 — `perf-lifecycle-cleanup`
   - Location: onUnload handler missing
   - Why it matters: 页面退出后轮询继续执行，内存泄漏
   - Fix: onUnload 中 clearInterval
   - Verify: 退出页面后控制台无轮询请求

3. [Medium] 创建中缺少按钮级 loading/禁用保护 — `ix-button-feedback`
   - Location: create action entry
   - Why it matters: 连续点击可能引发重复请求
   - Fix: submitting guard + loading 文案
   - Verify: 高频点击仅创建一次任务

4. [Medium] 创建事件无体验埋点 — `obs-feedback-schema`
   - Location: handleCreate function
   - Why it matters: 无法追踪创建成功率和耗时
   - Fix: 上报 experience_event（含 duration + errorCode）
   - Verify: 埋点数据包含必填字段
```

### C2. Startup + feedback loop review

#### Input

> "按启动性能和反馈渠道标准，做一轮上线前评审。"

#### Expected output style

```markdown
## Release Gate: BLOCKED
- 主包体积: 1.8MB PASS
- Blocking 问题: 0 PASS
- 按钮反馈: 完整 PASS
- 启动同步 API: 3 次 BLOCKED (≤2)
- 关键路径埋点: 缺 sessionId BLOCKED
- 硬编码中文: 无 PASS
- **Gate Result: BLOCKED**

## Quality Grade: C
- Blocking: 0 / High: 2 / Medium: 2

## Findings
1. [High] `launch-sync-api` 启动阶段存在 3 次同步调用
2. [High] `obs-feedback-schema` 体验事件缺少 sessionId 字段
3. [Medium] `obs-alert-thresholds` 未配置异常召回阈值
4. [Medium] `perf-lifecycle-cleanup` 首页轮询未在 onHide 暂停

## MCP Evidence: Not Available

## Wiki Baseline
- Launch Optimization Coverage: 15/19
- Feedback Loop Readiness: 准入=强，召回=弱，度量=中
```

---

## Reusable checklist snippet

每次输出都可复用如下检查项：

```markdown
## Regression Checklist
- [ ] 首屏关键路径未新增阻塞请求
- [ ] 关键按钮具备 loading/禁用/防重入
- [ ] 失败分支有提示且可恢复
- [ ] 列表刷新和轮询对滚动体验影响可接受
- [ ] 无障碍基本项已检查（触摸目标/对比度/替代文本）
- [ ] 安全区域与键盘适配已验证
- [ ] 生命周期清理已验证（定时器/监听器/轮询）
- [ ] 体验埋点字段完整（业务参数 + 小程序基础参数封装）
- [ ] 反馈关联标识就位（sessionId/requestId）
- [ ] MCP 证据完整（snapshot/screenshot/logs）
```
