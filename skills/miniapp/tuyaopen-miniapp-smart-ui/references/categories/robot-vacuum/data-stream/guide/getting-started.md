# 快速开始

本指南介绍如何安装 `@ray-js/robot-data-stream` 并完成基本的 MQTT 和 P2P 数据流配置。

## 安装

```bash
yarn add @ray-js/robot-data-stream
```

确保你的项目已安装以下 peer 依赖：

```bash
yarn add @ray-js/ray @ray-js/log4js @ray-js/robot-protocol
```

## 配置 MqttProvider

所有 MQTT hooks 依赖 `MqttProvider` 上下文。在应用顶层包裹这个 Provider，为子组件提供设备通信能力。

```tsx
import { MqttProvider } from '@ray-js/robot-data-stream';

function App() {
  return (
    <MqttProvider
      useMqtt={true}
      commandVersion="1"
      devices={devices}
      preferredChannel="mqtt"
      onError={error => {
        console.error('MQTT 错误:', error.message, error.errCode);
      }}
      onMqttReady={() => {
        console.log('MQTT 监听已就绪');
      }}
    >
      <YourRobotPanel />
    </MqttProvider>
  );
}
```

### MqttProvider 属性

| 属性               | 类型                          | 必填 | 默认值   | 说明                                                  |
| ------------------ | ----------------------------- | ---- | -------- | ----------------------------------------------------- |
| `useMqtt`          | `boolean`                     | 是   | -        | 是否启用 MQTT 通信。设为 `false` 时回退到旧版指令通道 |
| `commandVersion`   | `'0' \| '1'`                  | 是   | -        | 协议版本。`'1'` 为当前版本，`'0'` 为旧版兼容          |
| `devices`          | `MqttContextValue['devices']` | 是   | -        | 设备模型对象，提供 `getDevInfo()` 和 DP 指令发送能力  |
| `preferredChannel` | `'mqtt' \| 'lan'`             | 否   | `'mqtt'` | 首选通信通道。LAN 直连延迟更低，不可用时自动回退      |
| `onError`          | `(error: MqttError) => void`  | 否   | -        | 未处理的 MQTT 错误回调（超时、请求失败等）            |
| `onMqttReady`      | `() => void`                  | 否   | -        | MQTT 协议监听注册完成后的回调                         |

### 通道选择机制

`preferredChannel` 控制消息发送优先使用哪个通道：

- **`'mqtt'`** — 通过云端 MQTT 转发，适用范围广
- **`'lan'`** — 局域网直连设备，延迟更低

库内部通过 `ty.getDeviceOnlineType()` 检测设备在线状态（bit 0 = WiFi，bit 1 = LAN），当首选通道不可用时自动回退到另一个通道。

## 使用 MQTT Hooks

配置好 `MqttProvider` 后，在子组件中直接调用 hooks 与设备通信。

```tsx
import { useDevInfo, useZoneClean } from '@ray-js/robot-data-stream';

function RobotController() {
  const { requestDevInfo } = useDevInfo();
  const { requestZoneClean, setZoneClean } = useZoneClean();

  const handleQueryDevInfo = async () => {
    try {
      const res = await requestDevInfo();
      console.log('设备信息:', res.info);
    } catch (error) {
      // error 为 MqttError 实例，包含 errCode 和 reqType
      console.error('查询失败:', error.errCode);
    }
  };

  return <button onClick={handleQueryDevInfo}>查询设备信息</button>;
}
```

### 错误处理

所有 hooks 返回的方法都是 Promise。请求失败时抛出 `MqttError`：

```tsx
import { MqttError } from '@ray-js/robot-data-stream';

try {
  await requestDevInfo();
} catch (error) {
  if (error instanceof MqttError) {
    // errCode: -1 表示超时，-2 表示参数校验失败，其他为设备返回的错误码
    console.error(`请求 ${error.reqType} 失败，错误码: ${error.errCode}`);
  }
}
```

## 使用 P2P 数据流

`useP2PDataStream` 用于建立 P2P 连接并实时接收地图和路径数据。这个 hook 独立于 `MqttProvider`，直接通过 P2P SDK 通信。

```tsx
import { useP2PDataStream } from '@ray-js/robot-data-stream';

function MapView({ devId }: { devId: string }) {
  const { appendDownloadStreamDuringTask } = useP2PDataStream(
    devId,
    mapData => {
      // 收到地图数据（Base64 编码的二进制数据）
      console.log('地图数据:', mapData);
    },
    pathData => {
      // 收到清扫路径数据
      console.log('路径数据:', pathData);
    },
    {
      onReceiveAIPicData: data => {
        console.log('AI 图片数据:', data);
      },
      onDefineStructuredMode: isStructured => {
        console.log('结构化模式:', isStructured);
      },
    }
  );

  return <div>地图渲染区域</div>;
}
```

hook 在挂载时自动初始化 P2P SDK、连接设备并开始下载数据。当应用进入后台超过 10 秒后会断开连接，返回前台时自动重连。组件卸载时自动清理所有连接和监听。

## 使用事件中心

`StreamDataNotificationCenter` 是一个全局事件发射器，可以在非 React 上下文中监听数据流事件。

```tsx
import { StreamDataNotificationCenter } from '@ray-js/robot-data-stream';

// 监听地图数据
StreamDataNotificationCenter.on('receiveMapData', data => {
  console.log('收到地图数据');
});

// 取消监听
StreamDataNotificationCenter.off('receiveMapData', handler);
```
