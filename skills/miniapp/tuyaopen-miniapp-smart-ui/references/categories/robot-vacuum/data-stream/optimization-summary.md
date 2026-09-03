# MQTT 代码优化总结

## 已完成的优化

### 第一批次优化

### 1. ✅ 创建统一的 useMqttMessage Hook

**文件：** `src/mqtt/hooks/useMqttMessage.ts`

**功能：**
- 统一的消息发送逻辑
- 自动从 Context 获取 `devId`（如果未提供）
- 统一的错误处理
- 支持 MQTT 模式检查

**使用示例：**
```typescript
const { sendMqttMessage } = useMqttMessage();

// 自动从 Context 获取 devId
const result = await sendMqttMessage<ResponseType>(reqType, message);

// 或手动指定 devId（向后兼容）
const result = await sendMqttMessage<ResponseType>(reqType, message, devId);
```

### 2. ✅ 重构 useCarpet Hook

**文件：** `src/mqtt/useCarpet.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理（使用 `handleMqttError`）
- ✅ 移除重复的 `sendMqttMessage` 内部函数
- ✅ 修复 bug：`setCarpet` 方法中错误使用 `CarpetEnum.query` 的问题

**变更对比：**

```typescript
// ❌ 优化前
export const useCarpet = (devId: string) => {
  const sendMqttMessage = <T>(devId: string, reqType: CarpetEnum, message: any) => {
    // 重复的逻辑...
  };
  // ...
};

// ✅ 优化后
export const useCarpet = (devId?: string) => {
  const { sendMqttMessage } = useMqttMessage();
  // 使用统一的 sendMqttMessage
  // ...
};
```

### 3. ✅ 重构 useCarpetClean Hook

**文件：** `src/mqtt/useCarpetClean.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理
- ✅ 简化代码，移除重复逻辑

**变更对比：**

```typescript
// ❌ 优化前
const requestCarpetClean = () => {
  try {
    const params = createSetCommonParams({
      deviceId: devId,
      reqType: CarpetCleanEnum.query,
    });
    ty.device.sendMqttMessage(params);
    const { taskId } = params.message;
    return normalResolve(CarpetCleanEnum.query, taskId);
  } catch (error) {
    return Promise.reject(...);
  }
};

// ✅ 优化后
const requestCarpetClean = () => {
  try {
    return sendMqttMessage<CarpetCleanResponse>(CarpetCleanEnum.query, {}, devId);
  } catch (error) {
    throw handleMqttError(error, 'Failed to request carpet clean');
  }
};
```

### 4. ✅ 更新导出文件

**文件：** `src/mqtt/index.ts`

**变更：**
- 导出 `useMqttMessage` Hook，供高级用户使用
- 保持所有现有导出不变，确保向后兼容

## 优化效果

### 第二批次优化（新增）

### 5. ✅ 重构 useDeviceModel Hook

**文件：** `src/mqtt/useDeviceModel.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理
- ✅ 简化代码，移除重复逻辑

### 6. ✅ 重构 useFurnitureModel Hook

**文件：** `src/mqtt/useFurnitureModel.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理
- ✅ 移除调试代码（console.log）

### 7. ✅ 重构 useWifiMap Hook

**文件：** `src/mqtt/useWifiMap.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理
- ✅ 简化代码，移除重复逻辑

### 8. ✅ 重构 useDevInfo Hook

**文件：** `src/mqtt/useDevInfo.ts`

**优化内容：**
- ✅ MQTT 部分使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 保持非 MQTT 模式的降级逻辑不变
- ✅ 统一错误处理

### 9. ✅ 重构 useVoice Hook

**文件：** `src/mqtt/useVoice.ts`

**优化内容：**
- ✅ MQTT 部分使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 保持非 MQTT 模式的降级逻辑不变
- ✅ 统一错误处理

### 10. ✅ 重构 usePassword Hook

**文件：** `src/mqtt/usePassword.ts`

**优化内容：**
- ✅ 使用统一的 `useMqttMessage` Hook
- ✅ `devId` 参数改为可选（向后兼容）
- ✅ 统一错误处理
- ✅ 支持自定义响应类型（`PasswordEnum.rst` 和 `PasswordEnum.checkRst`）

**特殊处理：**
- `useMqttMessage` 新增 `responseType` 参数，支持请求类型和响应类型不同的场景

### 11. ✅ 增强 useMqttMessage Hook

**文件：** `src/mqtt/hooks/useMqttMessage.ts`

**新增功能：**
- ✅ 支持自定义响应类型（`responseType` 参数）
- ✅ 适用于请求类型和响应类型不同的场景（如 `usePassword`）

## 优化效果

### 代码减少
- **第一批次：**
  - `useCarpet.ts`: 减少约 15 行重复代码
  - `useCarpetClean.ts`: 减少约 20 行重复代码
  - 总计减少约 35 行重复代码

- **第二批次：**
  - `useDeviceModel.ts`: 减少约 15 行重复代码
  - `useFurnitureModel.ts`: 减少约 20 行重复代码（含调试代码）
  - `useWifiMap.ts`: 减少约 15 行重复代码
  - `useDevInfo.ts`: 减少约 8 行重复代码（MQTT 部分）
  - `useVoice.ts`: 减少约 12 行重复代码（MQTT 部分）
  - `usePassword.ts`: 减少约 25 行重复代码
  - **总计减少约 95 行重复代码**

- **累计减少：约 130 行重复代码**

### 一致性提升
- ✅ 统一的 API 设计（`devId` 可选）
- ✅ 统一的错误处理方式
- ✅ 统一的代码风格

### 可维护性提升
- ✅ 公共逻辑集中管理
- ✅ 修改消息发送逻辑只需修改一处
- ✅ 更容易添加新功能（如超时配置、重试机制等）

## 向后兼容性

### ✅ 完全兼容

所有优化都保持了向后兼容：

1. **useCarpet**
   ```typescript
   // 旧用法仍然有效
   const { addCarpet } = useCarpet(devId);
   
   // 新用法（推荐）
   const { addCarpet } = useCarpet(); // 自动从 Context 获取 devId
   ```

2. **useCarpetClean**
   ```typescript
   // 旧用法仍然有效
   const { requestCarpetClean } = useCarpetClean(devId);
   
   // 新用法（推荐）
   const { requestCarpetClean } = useCarpetClean(); // 自动从 Context 获取 devId
   ```

## 后续优化建议

### 可选优化（不影响现有功能）

1. **其他 Hook 优化**
   - ✅ `useFurnitureModel` - 已完成
   - ✅ `useDeviceModel` - 已完成
   - ✅ `usePassword` - 已完成
   - `useSchedule` - 支持 MQTT/非 MQTT，可以优化 MQTT 部分
   - `useQuiteHours` - 支持 MQTT/非 MQTT，可以优化 MQTT 部分
   - `useVirtualWall` - 支持 MQTT/非 MQTT，可以优化 MQTT 部分
   - `useZoneClean` - 支持 MQTT/非 MQTT，可以优化 MQTT 部分
   - 其他支持 MQTT/非 MQTT 模式的 hooks

2. **功能增强**
   - 在 `useMqttMessage` 中添加超时配置
   - 添加重试机制
   - 添加请求日志记录

3. **类型优化**
   - 统一响应类型定义
   - 添加更严格的类型检查

## 测试建议

### 需要测试的场景

1. ✅ **向后兼容性测试**
   - 使用旧 API（传入 devId）的功能是否正常
   - 使用新 API（不传 devId）的功能是否正常

2. ✅ **Context 使用测试**
   - 确保在 MqttProvider 内使用时能正确获取 devId
   - 确保在 MqttProvider 外使用时能正确报错

3. ✅ **错误处理测试**
   - MQTT 模式未启用时的错误提示
   - 网络错误时的错误处理

## 文件变更清单

### 新增文件
- ✅ `src/mqtt/hooks/useMqttMessage.ts` - 统一的 MQTT 消息发送 Hook

### 修改文件

**第一批次：**
- ✅ `src/mqtt/useCarpet.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/useCarpetClean.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/index.ts` - 导出新的 Hook

**第二批次：**
- ✅ `src/mqtt/useDeviceModel.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/useFurnitureModel.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/useWifiMap.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/useDevInfo.ts` - 优化 MQTT 部分
- ✅ `src/mqtt/useVoice.ts` - 优化 MQTT 部分
- ✅ `src/mqtt/usePassword.ts` - 重构使用统一逻辑
- ✅ `src/mqtt/hooks/useMqttMessage.ts` - 增强支持自定义响应类型

### 文档文件
- ✅ `docs/code-structure-analysis.md` - 代码结构分析文档
- ✅ `docs/optimization-summary.md` - 优化总结文档（本文件）

## 总结

本次优化成功：
1. ✅ 提取了公共逻辑，减少代码重复
2. ✅ 统一了 API 设计，提升一致性
3. ✅ 保持了向后兼容性，不影响现有代码
4. ✅ 提升了代码可维护性

优化后的代码结构更加清晰，便于后续维护和扩展。
