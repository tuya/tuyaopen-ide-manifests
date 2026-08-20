# Kit 类型定义获取

Tuya MiniApp 提供一组 `@tuya-miniapp/*-kit` 包，分别覆盖基础 API、容器
能力、设备控制、家庭、媒体、地图、P2P 等。每个 Kit 对应 `ty.*` 下的一段
全局 API；本节说明类型文件从哪儿来、缺失时怎么补。

## 先分清三件事（缺哪一件，症状完全不同）

一个 Kit 在开发链路上其实牵三样互不替代的东西：

| 东西 | 在哪 | 缺了会怎样 |
|------|------|-----------|
| **类型声明** `.d.ts` | 工程 `typings/tuya-miniapp__XxxKit/index.d.ts` | 编辑器报错、`tsc` 不过。**运行时不受影响** |
| **运行时版本声明** | `project.tuya.json` 的 `dependencies` | 类型能过，**真机上调该 API 抛异常** |
| **运行时实现** `dist/index.js` | 由 IDE / 官方 IDE 下载并注入，不在工程里 | 预览里框架拿不到该 Kit，**页面白屏或该能力失效** |

本节讲第一件。**第二件见下方「声明运行时版本」。第三件不是你能手工放进工程的**
——它由 IDE 在预览时下载并注入 `window.getNativeKits()`，你只需要把第二件声明对。

> **所以「只把 `.d.ts` 补齐」不能让页面渲染出来。** `.d.ts` 在编译期就被擦掉，
> 产物里不留任何代码；框架要的是真实模块对象。两件事都要做。

## 模板内置的 Kit 类型（`typings/` 目录，开箱即用）

| Kit | 命名空间 | 典型场景 |
|-----|---------|---------|
| BaseKit | `ty.*` 基础 | 基础系统 API（storage、toast、router...） |
| MiniKit | `ty.*` 容器 | 小程序容器能力（导航栏、状态栏...） |
| BizKit | `ty.biz.*` | 涂鸦通用业务 API |
| DeviceKit | `ty.device.*` | 设备控制、配网、蓝牙 |
| HomeKit | `ty.home.*` | 家庭信息获取 |
| IPCKit | `ty.ipc.*` | 摄像头 / IPC 能力 |
| AIKit | `ty.ai.*` | AI 能力（翻译、语音...） |
| MediaKit | `ty.media.*` | 音乐律动、摄像头异层渲染（v3.7.0 预装） |
| MapKit | `ty.map.*` | 地图、定位、扫地机地图（v7.8.3 预装） |
| P2PKit | `ty.p2p.*` | 扫地机 / 摄像头 P2P 直连（v7.7.6 预装） |

> **注意**：MediaKit、MapKit、P2PKit 的类型文件已预装，但运行时仍需在
> `project.tuya.json` 中声明版本，见下方「声明运行时版本」。

## 添加未内置的 Kit 类型（手动获取）

`registry-npm.tuya-inc.top` 对 `@tuya-miniapp/*` 包**开放匿名读取**，无需
登录，外网直连。

**类型文件位置**：每个 Kit 包内 `package/@types/index.d.ts`（不是根目录的
`package/index.d.ts`）。

> ⚠ **这条路只能拿类型，不能拿运行时实现。** npm 上的包虽然也含
> `dist/index.js`，但实测（2026-08-20）那条发布线**停在 2.x**——例如
> `@tuya-miniapp/base-kit` 最新 `2.2.3`，`meta.json` 里的原生插件前缀还是旧的
> `TYUni*`；而平台侧在用的是 **3.x**（前缀 `TUNI*`），两条产物线的版本完全不
> 重叠，`dist/index.js` 体量也差一倍以上（48K vs 124K）。**不要把 npm 包里的
> `dist/index.js` 当作预览/真机的运行时 Kit 使用**，它比平台在跑的落后两代。

### 完整工作流（以 SomeKit 为例）

```bash
# 1. 查询可用版本（可选，确认包存在）
npm view @tuya-miniapp/SomeKit --registry https://registry-npm.tuya-inc.top version

# 2. 下载包（不安装到 node_modules）
cd source/miniapp
npm pack @tuya-miniapp/SomeKit --registry https://registry-npm.tuya-inc.top

# 3. 提取 @types/index.d.ts 到 typings/
#    目录名用双下划线（mirrors npm scope 约定）
mkdir -p typings/tuya-miniapp__SomeKit
tar -xzOf tuya-miniapp-SomeKit-*.tgz package/@types/index.d.ts \
  > typings/tuya-miniapp__SomeKit/index.d.ts

# 4. 清理临时文件
rm tuya-miniapp-SomeKit-*.tgz
```

`tsconfig.json` 的 `typeRoots: ["./typings", ...]` 已覆盖此路径，**无需修改 tsconfig**。

## 声明运行时版本

类型文件让 TypeScript 不报错，但手机端 App 是否加载该 Kit 取决于
`project.tuya.json` 的 `dependencies` 声明——**缺少声明时类型可用、但 API 在设备上抛异常**。

```json
{
  "dependencies": {
    "BaseKit": "3.0.0",
    "MiniKit": "3.1.0",
    "MediaKit": "3.0.0",
    "MapKit": "3.0.0",
    "P2PKit": "3.0.0"
  }
}
```

**选版本原则**：选带「推荐」标识的版本，不要盲目声明最新版（最大化手机端
兼容性）。Tuya MiniApp IDE 的版本选择界面上有推荐标识；也可查
[developer.tuya.com Kit 版本比对页](https://developer.tuya.com/cn/miniapp/common/desc/tech-stack/api)。

## 预览白屏 / 某个 `ty.*` 能力不存在时怎么查

运行时 Kit 由 IDE 下载并缓存，**下载失败是静默的**（只落一条 warn，预览照样起），
所以症状往往是"页面白屏"或"某个 API 未定义"而不是报错。按这个顺序对：

```bash
# 1. 工程声明了哪些 Kit 及版本
python3 -c "import json;print(json.load(open('project.tuya.json'))['dependencies'])"

# 2. 本机缓存里实际有哪些（布局是 <Kit>/<版本>/，含 dist/index.js 才算完整）
ls ~/TuyaOpenIDE/.tuyaopen/miniapp-kits/

# 3. 只列出「半装成功的空壳」——注意 -mindepth 2，判据在版本目录这一层，
#    对着 <Kit>/ 顶层查会把每个 Kit 都误报成坏的
cd ~/TuyaOpenIDE/.tuyaopen/miniapp-kits
find . -mindepth 2 -maxdepth 2 -type d ! -exec test -e '{}/dist/index.js' \; -print
```

第 3 条命令有输出，说明那个版本声明了但没下载成功。IDE 日志里搜 `kit .* skipped`
能看到原因（网络、版本不存在、登录态过期等）。**没有输出是正常状态。**

只声明了类型而没在 `dependencies` 里声明版本，症状不同：预览/真机上该 API 抛异常，
而不是白屏。
