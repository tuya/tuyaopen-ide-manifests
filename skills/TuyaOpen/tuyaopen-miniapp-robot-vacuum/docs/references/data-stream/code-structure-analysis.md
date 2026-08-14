# MQTT 代码结构分析与优化建议

## 当前代码结构分析

### 1. 架构概览

```
src/mqtt/
├── mqttProvider.tsx      # Context Provider，提供全局配置
├── createCommonOptions.ts # 创建 MQTT 消息参数
├── promise.ts             # Promise 封装，监听 MQTT 响应
├── type/                  # 类型定义
└── use*.ts                # 各种业务 Hook
```

### 2. 发现的问题

#### 2.1 API 使用不一致性 ⚠️

**问题描述：**
- `useCarpet` 和 `useCarpetClean` 需要手动传入 `devId` 参数
- 其他 Hook（如 `useDevInfo`, `useVirtualWall`, `useZoneClean`）通过 Context 获取配置
- 导致使用方式不统一，增加学习成本

**示例对比：**

```typescript
// ❌ useCarpet - 需要手动传入 devId
const { addCarpet } = useCarpet(devId);

// ✅ useDevInfo - 从 Context 获取
const { requestDevInfo } = useDevInfo(devId); // 虽然也传了 devId，但内部使用了 Context
```

#### 2.2 代码重复 ⚠️

**问题描述：**
- 每个 Hook 都重复实现 `createSetCommonParams` + `sendMqttMessage` + `normalResolve` 的逻辑
- `useCarpet` 内部有 `sendMqttMessage` 辅助函数，但其他 Hook 没有
- 大量重复的 try-catch 错误处理代码

**重复代码示例：**

```typescript
// useCarpet.ts 中的 sendMqttMessage（局部函数）
const sendMqttMessage = <T extends BaseResponse>(
  devId: string,
  reqType: CarpetEnum,
  message: Record<string, any>
): Promise<T> => {
  const params = createSetCommonParams({
    deviceId: devId,
    reqType,
    message,
  });
  ty.device.sendMqttMessage(params);
  const { taskId } = params.message;
  return normalResolve(reqType, taskId) as Promise<T>;
};

// useCarpetClean.ts 中重复的逻辑
const params = createSetCommonParams({
  deviceId: devId,
  reqType: CarpetCleanEnum.query,
});
ty.device.sendMqttMessage(params);
const { taskId } = params.message;
return normalResolve(CarpetCleanEnum.query, taskId);
```

#### 2.3 Context 使用不一致 ⚠️

**问题描述：**
- `useCarpet` 和 `useCarpetClean` 没有使用 Context，无法获取 `useMqtt`、`commandVersion` 等配置
- 其他 Hook 支持 MQTT/非 MQTT 模式切换，但这两个 Hook 只支持 MQTT 模式
- 无法统一管理配置和切换通信方式

#### 2.4 错误处理不统一 ⚠️

**问题描述：**
- 有些 Hook 使用 try-catch 包装（如 `useCarpet`）
- 有些 Hook 直接 throw（如 `useVirtualWall`）
- 错误信息格式不统一

#### 2.5 类型定义分散 ⚠️

**问题描述：**
- 响应类型定义分散在各个 Hook 文件中
- 缺少统一的类型导出和复用机制

## 优化建议

### 1. 统一 Hook API 设计 ✅

**建议：** 所有 Hook 都应该：
- 统一从 Context 获取 `devId`（通过 `devices.common.getDevInfo()`）
- 统一使用 Context 中的 `useMqtt`、`commandVersion` 等配置
- 保持一致的函数签名

**优化后的使用方式：**

```typescript
// 所有 Hook 统一使用方式
const { addCarpet } = useCarpet(); // 不再需要传入 devId
const { requestDevInfo } = useDevInfo(); // 统一
```

### 2. 提取公共的消息发送逻辑 ✅

**建议：** 创建一个统一的 `useMqttMessage` Hook 或工具函数

**实现方案：**

```typescript
// 创建 src/mqtt/useMqttMessage.ts
export const useMqttMessage = () => {
  const { devices } = useMqtt();
  
  const sendMessage = <T extends BaseResponse>(
    reqType: string,
    message?: Record<string, any>
  ): Promise<T> => {
    const devInfo = devices.common.getDevInfo();
    const params = createSetCommonParams({
      deviceId: devInfo.devId,
      reqType,
      message,
    });
    
    ty.device.sendMqttMessage(params);
    const { taskId } = params.message;
    return normalResolve(reqType, taskId) as Promise<T>;
  };
  
  return { sendMessage };
};
```

### 3. 统一 Context 使用 ✅

**建议：** 
- 所有 Hook 都应该使用 `useMqtt()` 获取配置
- 从 Context 中获取 `devId`，而不是作为参数传入
- 支持 MQTT/非 MQTT 模式切换

**优化后的 useCarpet：**

```typescript
export const useCarpet = () => {
  const { useMqtt, devices } = useMqtt();
  const devInfo = devices.common.getDevInfo();
  const devId = devInfo.devId;
  
  // 使用统一的 sendMessage
  const { sendMessage } = useMqttMessage();
  
  const addCarpet: TAddCarpet = carpetInfo => {
    // ... 参数验证
    
    if (!useMqtt) {
      // 非 MQTT 模式的降级处理
      throw new Error('Carpet operations require MQTT mode');
    }
    
    return sendMessage<AddCarpetResponse>(CarpetEnum.add, {
      carpetInfo: sendData,
    });
  };
  
  // ...
};
```

### 4. 统一错误处理 ✅

**建议：** 创建统一的错误处理工具函数

**实现方案：**

```typescript
// src/mqtt/utils/errorHandler.ts
export const handleMqttError = (
  error: unknown,
  defaultMessage: string
): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(defaultMessage);
};

// 使用示例
try {
  return sendMessage(...);
} catch (error) {
  throw handleMqttError(error, 'Failed to add carpet');
}
```

### 5. 类型定义集中管理 ✅

**建议：** 
- 将通用的响应类型提取到 `type/` 目录
- 保持业务特定的类型在各 Hook 文件中

### 6. 创建统一的 Hook 基类/工具 ✅

**建议：** 创建一个基础 Hook，提供通用功能

**实现方案：**

```typescript
// src/mqtt/hooks/useBaseMqttHook.ts
export const useBaseMqttHook = () => {
  const context = useMqtt();
  const devInfo = context.devices.common.getDevInfo();
  
  const sendMqttMessage = <T extends BaseResponse>(
    reqType: string,
    message?: Record<string, any>
  ): Promise<T> => {
    if (!context.useMqtt) {
      throw new Error(`Operation ${reqType} requires MQTT mode`);
    }
    
    const params = createSetCommonParams({
      deviceId: devInfo.devId,
      reqType,
      message,
    });
    
    ty.device.sendMqttMessage(params);
    const { taskId } = params.message;
    return normalResolve(reqType, taskId) as Promise<T>;
  };
  
  return {
    ...context,
    devId: devInfo.devId,
    sendMqttMessage,
  };
};
```

## 优化优先级

### 高优先级 🔴
1. **统一 Hook API** - 消除使用不一致性
2. **提取公共消息发送逻辑** - 减少代码重复
3. **统一 Context 使用** - 确保配置一致性

### 中优先级 🟡
4. **统一错误处理** - 提升代码质量
5. **类型定义优化** - 改善类型安全

### 低优先级 🟢
6. **创建 Hook 基类** - 进一步抽象（可选）

## 迁移建议

### 渐进式迁移策略

1. **第一阶段：** 创建公共工具函数，不破坏现有 API
2. **第二阶段：** 在新代码中使用新的统一 API
3. **第三阶段：** 逐步迁移现有 Hook，保持向后兼容（通过参数默认值）
4. **第四阶段：** 移除旧的 API，统一使用新 API

### 向后兼容方案

```typescript
// 支持新旧两种使用方式
export const useCarpet = (devId?: string) => {
  const context = useMqtt();
  const contextDevId = context.devices.common.getDevInfo().devId;
  const finalDevId = devId || contextDevId; // 优先使用传入的 devId
  
  // ... 实现
};
```

## 总结

当前代码结构整体良好，但存在以下主要问题：
1. **API 不一致** - 需要统一
2. **代码重复** - 需要提取公共逻辑
3. **Context 使用不统一** - 需要标准化

建议优先解决高优先级问题，通过渐进式迁移确保向后兼容性。
