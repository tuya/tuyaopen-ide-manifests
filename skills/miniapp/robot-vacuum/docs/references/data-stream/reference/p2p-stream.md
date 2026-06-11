# P2P 数据流

本页面文档描述 `useP2PDataStream` hook 的完整公开 API，以及 `StreamDataNotificationCenter` 事件中心。

## useP2PDataStream

用于建立与扫地机的 P2P 连接，实时接收地图数据、清扫路径、AI 图片等二进制数据流。

### 函数签名

```ts
function useP2PDataStream(
  devId: string,
  onReceiveMapData: (data: string) => void,
  onReceivePathData: (data: string) => void,
  options?: UseP2PDataStreamOptions
): {
  appendDownloadStreamDuringTask: (
    files: string[],
    successCb?: () => void,
    failedCb?: () => void
  ) => Promise<boolean> | void;
};
```

### 参数

| 参数                | 类型                      | 必填 | 说明                                           |
| ------------------- | ------------------------- | ---- | ---------------------------------------------- |
| `devId`             | `string`                  | 是   | 设备 ID                                        |
| `onReceiveMapData`  | `(data: string) => void`  | 是   | 地图数据回调，接收 Base64 编码的二进制数据     |
| `onReceivePathData` | `(data: string) => void`  | 是   | 清扫路径数据回调，接收 Base64 编码的二进制数据 |
| `options`           | `UseP2PDataStreamOptions` | 否   | 可选配置项                                     |

### UseP2PDataStreamOptions

| 属性                     | 类型                                                        | 说明                                   |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------- |
| `logTag`                 | `string`                                                    | 日志标签，用于区分多个实例             |
| `enableCustomLog`        | `boolean`                                                   | 是否启用自定义日志上报                 |
| `onReceiveAIPicData`     | `(data: string) => void`                                    | AI 识别图片数据回调                    |
| `onReceiveAIPicHDData`   | `(data: string) => void`                                    | AI 高清图片数据回调                    |
| `onReceiveWifiMapData`   | `(data: string) => void`                                    | WiFi 信号热力图数据回调                |
| `onLogger`               | `(type: 'warn' \| 'error' \| 'info', data: string) => void` | 日志回调，接收库内部的日志输出         |
| `onDefineStructuredMode` | `(isStructured: boolean) => void`                           | 设备上报地图数据是否为结构化格式的回调 |

### 返回值

| 属性                             | 类型                                                                                           | 说明                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `appendDownloadStreamDuringTask` | `(files: string[], successCb?: () => void, failedCb?: () => void) => Promise<boolean> \| void` | 在活跃的数据流任务中追加下载文件 |

### 使用示例

```tsx
import { useP2PDataStream } from '@ray-js/robot-data-stream';

function MapPanel({ devId }: { devId: string }) {
  const { appendDownloadStreamDuringTask } = useP2PDataStream(
    devId,
    mapData => {
      // 处理地图数据
      decodeAndRenderMap(mapData);
    },
    pathData => {
      // 处理路径数据
      decodeAndRenderPath(pathData);
    },
    {
      onReceiveAIPicData: data => {
        decodeAndRenderAIPic(data);
      },
      onReceiveWifiMapData: data => {
        decodeAndRenderWifiMap(data);
      },
      onDefineStructuredMode: isStructured => {
        // 根据是否结构化选择不同的解码方式
        setStructuredMode(isStructured);
      },
      onLogger: (type, data) => {
        console.log(`[P2P ${type}]`, data);
      },
    }
  );

  // 在清扫过程中追加下载 AI 图片文件
  const handleLoadAI = () => {
    appendDownloadStreamDuringTask(
      ['ai.bin.stream'],
      () => console.log('追加下载成功'),
      () => console.log('追加下载失败')
    );
  };

  return (
    <div>
      <MapRenderer />
      <button onClick={handleLoadAI}>加载 AI 数据</button>
    </div>
  );
}
```

### 生命周期

hook 内部自动管理以下生命周期：

1. **初始化** — 组件挂载时调用 P2P SDK 初始化
2. **连接** — 与设备建立 P2P 连接
3. **数据观察** — 开始下载地图、路径等文件流，通过回调返回数据
4. **应用生命周期管理** — 监听应用前后台切换：
   - 进入后台超过 10 秒后断开 P2P 连接
   - 返回前台时自动重新连接并恢复数据流
5. **清理** — 组件卸载时断开连接、移除监听、反初始化 SDK

### 文件类型

P2P 通道支持的文件类型及其用途：

| 文件名                                             | 类型码 | 说明            |
| -------------------------------------------------- | ------ | --------------- |
| `map.bin` / `map.bin.stream`                       | 0      | 原始地图数据    |
| `map_structured.bin` / `map_structured.bin.stream` | 6      | 结构化地图数据  |
| `cleanPath.bin` / `cleanPath.bin.stream`           | 1      | 清扫路径数据    |
| `ai.bin` / `ai.bin.stream`                         | 4      | AI 识别图片     |
| `aiHD_XXXX_YYYY.bin` / `aiHD_XXXX_YYYY.bin.stream` | 5      | AI 高清图片     |
| `wifi_map.bin` / `wifi_map.bin.stream`             | 7      | WiFi 信号热力图 |

不带 `.stream` 后缀的文件为一次性下载，带 `.stream` 后缀的为持续推送流。

## StreamDataNotificationCenter

全局事件发射器（基于 `mitt`），可在任意位置监听 P2P 数据流事件，不依赖 React 组件树。

### 方法

| 方法                  | 说明                         |
| --------------------- | ---------------------------- |
| `on(event, handler)`  | 注册事件监听                 |
| `off(event, handler)` | 移除事件监听                 |
| `emit(event, data)`   | 触发事件（通常由库内部调用） |

### 使用示例

```ts
import { StreamDataNotificationCenter } from '@ray-js/robot-data-stream';

const handleMapData = (data: string) => {
  console.log('收到地图数据');
};

// 注册监听
StreamDataNotificationCenter.on('receiveMapData', handleMapData);

// 移除监听
StreamDataNotificationCenter.off('receiveMapData', handleMapData);
```
