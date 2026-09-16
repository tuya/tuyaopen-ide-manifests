# useP2PDataStream Hook 文档

## 概述

`useP2PDataStream` 是一个 React Hook，用于管理扫地机器人的 P2P（点对点）数据流连接。它负责初始化 P2P SDK、建立设备连接、监听数据流、处理应用前后台切换，以及管理连接生命周期。

## 功能特性

- ✅ P2P SDK 初始化和连接管理
- ✅ 自动重连机制
- ✅ 应用前后台切换处理
- ✅ 数据流监听和回调
- ✅ IDE 环境特殊处理
- ✅ 虚拟设备检测
- ✅ 连接状态追踪和日志记录

## API 接口

### 参数

```typescript
useP2PDataStream(
  devId: string,                                    // 设备ID
  onReceiveMapData: (data: string) => void,       // 接收地图数据回调
  onReceivePathData: (data: string) => void,       // 接收路径数据回调
  opt?: {                                          // 可选配置
    logTag?: string;                                // 日志标签
    onReceiveAIPicData?: (data: string) => void;   // 接收AI图片数据回调
    onReceiveAIPicHDData?: (data: string) => void;  // 接收AI高清图片数据回调
    onReceiveWifiMapData?: (data: string) => void;  // 接收WiFi地图数据回调
    onLogger?: TOnLogger;                          // 日志回调函数
    onDefineStructuredMode?: (isStructured: boolean) => void; // 结构化模式定义回调
  }
)
```

### 返回值

```typescript
{
  appendDownloadStreamDuringTask: (
    files: Array<string>,
    successCb?: () => void,
    failedCb?: () => void
  ) => Promise<boolean> | void;
}
```

## 核心流程

### 1. 初始化阶段

1. **环境检测**

   - 检测是否为 IDE 环境（devtools）
   - 检测是否为虚拟设备（vdevo 开头）

2. **IDE 环境处理**

   - 如果检测到 IDE 环境，直接注册事件监听
   - 不进行实际的 P2P 连接
   - 返回清理函数，用于卸载时移除事件监听

3. **虚拟设备处理**

   - 如果设备 ID 以 `vdevo` 开头，记录警告并返回
   - 虚拟设备不支持 P2P 连接

4. **P2P SDK 初始化**
   - 调用 `SweeperP2pInstance.initP2pSdk(devId)`
   - 初始化成功后触发连接流程
   - 初始化失败记录追踪点

### 2. 连接阶段

1. **建立 P2P 连接**

   - 调用 `SweeperP2pInstance.connectDevice()`
   - 记录连接开始时间戳（用于性能追踪）

2. **连接成功处理**

   - 设置 `isInit.current = true`
   - 启动数据观察（`startObserver()`）
   - 注册会话状态变化监听

3. **连接失败处理**
   - 触发重连机制（`reconnectP2p()`）
   - 重连成功后启动数据观察
   - 注册会话状态变化监听

### 3. 数据观察阶段

`startObserver()` 函数执行以下操作：

1. **启动数据流监听**

   - 调用 `SweeperP2pInstance.startObserverSweeperDataByP2P()`
   - 传入下载类型（固定为 1，表示持续下载）
   - 注册所有数据回调函数

2. **注册会话状态监听**
   - 监听 P2P 会话状态变化
   - 处理断开重连逻辑

### 4. 应用生命周期管理

#### 应用进入后台（handleAppHide）

1. 设置 `isAppOnBackground.current = true`
2. 如果已初始化，启动 10 秒定时器
3. 定时器到期后，如果仍在后台，执行 `unmount()` 断开连接

#### 应用回到前台（handleAppShow）

1. 设置 `isAppOnBackground.current = false`
2. 清除后台定时器
3. 延迟 500ms 后检查连接状态
4. 如果未初始化或 P2P 未激活，且不在连接中，则重新连接

### 5. 清理阶段

在页面卸载时（`usePageEvent('onUnload')`）：

1. 执行 `unmount()` 断开连接
2. 移除应用前后台监听
3. 反初始化 P2P SDK

## 内部状态管理

### useRef 状态

- `isInit`: 是否已初始化连接
- `offSessionStatusChange`: 会话状态变化监听器的取消函数
- `isAppOnBackground`: 应用是否在后台
- `timer`: 后台定时器引用

### useMemo 优化

- `log`: Logger 实例，避免重复创建

### useCallback 优化

- `startObserver`: 启动数据观察
- `connectP2p`: P2P 连接逻辑
- `unmount`: 断开连接逻辑
- `handleAppHide`: 应用隐藏处理
- `handleAppShow`: 应用显示处理

## 错误处理

1. **初始化失败**

   - 记录追踪点 `initP2pSdkFail`
   - 不抛出错误，静默处理

2. **连接失败**

   - 自动触发重连机制
   - 记录追踪点 `connectDeviceFail`

3. **重连失败**
   - 在 `reconnectP2p` 内部处理
   - 6 秒后自动重试

## 追踪和日志

### 追踪点（Trace Points）

- `initP2pSdk`: P2P SDK 初始化成功
- `initP2pSdkFail`: P2P SDK 初始化失败
- `connectDeviceSuccess`: 设备连接成功
- `connectDeviceFail`: 设备连接失败
- `reconnectP2p`: 重连成功
- `startObserverSweeperDataByP2P`: 开始观察数据流

### 日志记录

所有关键操作都会记录日志：

- 连接开始/成功/失败
- 应用前后台切换
- 数据观察启动
- 连接断开

## 使用示例

```typescript
import { useP2PDataStream } from '@/index';

function RobotMapComponent() {
  const { appendDownloadStreamDuringTask } = useP2PDataStream(
    'device123',
    mapData => {
      // 处理地图数据
      console.log('收到地图数据:', mapData);
    },
    pathData => {
      // 处理路径数据
      console.log('收到路径数据:', pathData);
    },
    {
      logTag: 'RobotMap',
      onLogger: (type, msg) => {
        console.log(`[${type}]`, msg);
      },
      onReceiveAIPicData: data => {
        console.log('收到AI图片数据:', data);
      },
      onDefineStructuredMode: isStructured => {
        console.log('结构化模式:', isStructured);
      },
    }
  );

  // 在任务中追加下载文件
  const handleAppendFiles = async () => {
    await appendDownloadStreamDuringTask(
      ['file1.bin', 'file2.bin'],
      () => console.log('追加成功'),
      () => console.log('追加失败')
    );
  };

  return <div>...</div>;
}
```

## 注意事项

1. **设备 ID 格式**

   - 不能以 `vdevo` 开头（虚拟设备）
   - 必须是有效的设备 ID

2. **IDE 环境**

   - IDE 环境下不会建立真实连接
   - 需要安装 'Robot Vacuum Debugger' 插件进行调试

3. **应用生命周期**

   - 应用进入后台 10 秒后会自动断开连接
   - 应用回到前台会自动重连

4. **依赖项管理**

   - Hook 内部使用 `useCallback` 和 `useMemo` 优化性能
   - 确保回调函数引用稳定，避免不必要的重新渲染

5. **清理时机**
   - 页面卸载时会自动清理所有资源
   - 确保在组件卸载前完成清理

## 流程图

详见下方流程图部分。
