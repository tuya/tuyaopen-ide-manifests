# Kit 类型定义获取

Tuya MiniApp 提供一组 `@tuya-miniapp/*-kit` 包，分别覆盖基础 API、容器
能力、设备控制、家庭、媒体、地图、P2P 等。每个 Kit 对应 `ty.*` 下的一段
全局 API；本节说明类型文件从哪儿来、缺失时怎么补。

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
