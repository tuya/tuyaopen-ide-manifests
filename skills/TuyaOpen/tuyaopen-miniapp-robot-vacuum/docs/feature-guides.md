# 扫地机功能实现指南

本文件是**跨库桥梁索引**，帮助开发者将面板功能需求映射到正确的 API 组合。开发者的模板项目（sweeprobottemplate）已经有功能实现代码，这里提供的是"每个功能涉及哪些 API"的精确索引，方便 AI 按需 Grep 查找详细文档。

## 使用方式

开发者问"怎么实现 XX 功能"时：
1. 在下方找到对应功能的 API 映射表
2. 用 Grep 搜索 `references/` 下对应的文件，获取 API 的详细参数和用法
3. 结合 SKILL.md 中的 DP Codes 表和协议信息，串联完整流程
4. 如果功能索引中标注了**最佳实践**，用 Grep 搜索 `references/map-sdk/guide/advanced-usage.md` 获取完整代码示例

## 功能索引

### 选区清扫（Zone Cleaning）

用户在地图上框选矩形区域，机器人只清扫选定区域。

**完整流程**：
```
用户点击"添加选区" → 地图生成初始区域 → 用户拖拽调整 → 确认 → 编码坐标 → 下发指令 → 启动清扫
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateCleanZone(zone)` | 用户拖拽/调整区域后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickCleanZone(zone)` | 用户点击区域时触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveCleanZone(id)` | 用户删除区域时触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getCleanZones()` | 获取所有清扫区域数据 | references/map-sdk/reference/methods.md |
| 方法 | `getCleanZonePointsByViewportCenter(opts)` | 在视口中心生成初始区域坐标 | references/map-sdk/reference/methods.md |
| 数据 | `cleanZones: ZoneParam[]` | 传入清扫区域数据 | references/map-sdk/reference/data.md |
| 运行时 | `editingCleanZoneIds: string[]` | 当前编辑中的区域 ID | references/map-sdk/reference/runtime.md |
| 配置 | `controls.cleanZone.*` | 区域样式（颜色/描边/最小尺寸等） | references/map-sdk/reference/config.md |
| 类型 | `ZoneParam` | `{ id: string, points: Point[] }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `## 地图控制元素` → `references/map-sdk/guide/advanced-usage.md`（含清扫划区完整代码示例）

**DP 指令流程**（点阵格式协议）：
1. 设置 `mode` = `'zone'`
2. 用 `@ray-js/robot-protocol` 的 `encodeXxx0x{code}()` 编码区域坐标
3. 通过 `command_trans` DP 下发编码数据
4. 设置 `switch_go` = `true` 启动清扫

**DP 指令流程**（结构化协议）：
1. 使用 `@ray-js/robot-data-stream` 的 `useZoneClean()` hook
2. 传入区域坐标，hook 自动编码并通过 MQTT 下发

---

### 禁区编辑（Forbidden Area）

用户在地图上设置扫地禁区和拖地禁区，机器人清扫时自动避开。

**完整流程**：
```
用户点击"添加禁区" → 选择类型（扫地/拖地） → 拖拽调整区域 → 确认 → 编码 → 下发保存
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateForbiddenSweepZone(zone)` | 扫地禁区拖拽后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickForbiddenSweepZone(zone)` | 点击扫地禁区触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveForbiddenSweepZone(id)` | 删除扫地禁区触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onUpdateForbiddenMopZone(zone)` | 拖地禁区拖拽后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickForbiddenMopZone(zone)` | 点击拖地禁区触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveForbiddenMopZone(id)` | 删除拖地禁区触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getForbiddenSweepZones()` | 获取所有扫地禁区 | references/map-sdk/reference/methods.md |
| 方法 | `getForbiddenMopZones()` | 获取所有拖地禁区 | references/map-sdk/reference/methods.md |
| 方法 | `getForbiddenSweepZonePointsByViewportCenter()` | 生成扫地禁区初始坐标 | references/map-sdk/reference/methods.md |
| 方法 | `getForbiddenMopZonePointsByViewportCenter()` | 生成拖地禁区初始坐标 | references/map-sdk/reference/methods.md |
| 方法 | `isZoneIntersectsAnyRoom(points)` | 检查禁区是否与房间重叠 | references/map-sdk/reference/methods.md |
| 方法 | `isNearChargerOrRobot(points, threshold)` | 检查是否靠近充电座/机器人 | references/map-sdk/reference/methods.md |
| 数据 | `forbiddenSweepZones: ZoneParam[]` | 传入扫地禁区数据 | references/map-sdk/reference/data.md |
| 数据 | `forbiddenMopZones: ZoneParam[]` | 传入拖地禁区数据 | references/map-sdk/reference/data.md |
| 运行时 | `editingForbiddenSweepZoneIds: string[]` | 编辑中的扫地禁区 ID | references/map-sdk/reference/runtime.md |
| 运行时 | `editingForbiddenMopZoneIds: string[]` | 编辑中的拖地禁区 ID | references/map-sdk/reference/runtime.md |
| 配置 | `controls.forbiddenSweepZone.*` | 扫地禁区样式 | references/map-sdk/reference/config.md |
| 配置 | `controls.forbiddenMopZone.*` | 拖地禁区样式 | references/map-sdk/reference/config.md |
| 类型 | `ZoneParam` | `{ id: string, points: Point[] }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `## 地图控制元素` → `references/map-sdk/guide/advanced-usage.md`（含禁区完整代码示例）

**DP 指令**（点阵格式协议）：通过 `command_trans` 下发 `encodeVirtualArea0x{code}()` 编码数据
**DP 指令**（结构化协议）：使用 `useForbiddenZone()` hook 通过 MQTT 下发

---

### 虚拟墙（Virtual Wall）

用户在地图上画一条线段，机器人不会越过。

**完整流程**：
```
用户点击"添加虚拟墙" → 拖拽调整线段 → 确认 → 编码 → 下发保存
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateVirtualWall(wall)` | 虚拟墙拖拽后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickVirtualWall(wall)` | 点击虚拟墙触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveVirtualWall(id)` | 删除虚拟墙触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getVirtualWalls()` | 获取所有虚拟墙 | references/map-sdk/reference/methods.md |
| 方法 | `getWallPointsByViewportCenter(opts)` | 生成虚拟墙初始坐标（支持 horizontal/vertical） | references/map-sdk/reference/methods.md |
| 方法 | `isWallIntersectsAnyRoom(points)` | 检查虚拟墙是否穿过房间 | references/map-sdk/reference/methods.md |
| 数据 | `virtualWalls: VirtualWallParam[]` | 传入虚拟墙数据 | references/map-sdk/reference/data.md |
| 运行时 | `editingVirtualWallIds: string[]` | 编辑中的虚拟墙 ID | references/map-sdk/reference/runtime.md |
| 配置 | `controls.virtualWall.*` | 虚拟墙样式 | references/map-sdk/reference/config.md |
| 类型 | `VirtualWallParam` | `{ id: string, points: Point[] }` (2个端点) | references/map-sdk/reference/types.md |

**最佳实践**：Grep `### 虚拟墙` → `references/map-sdk/guide/advanced-usage.md`（含虚拟墙完整代码示例）

**DP 指令**：与禁区共用同一套编码/下发逻辑，虚拟墙数据通常和禁区一起打包下发。

---

### 选房清扫（Room Selection / Room Cleaning）

用户在地图上点选一个或多个房间，机器人只清扫选定房间。

**完整流程**：
```
进入选房模式 → 用户点选房间 → 设置清扫顺序（可选） → 确认 → 下发房间ID列表 → 启动清扫
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onClickRoom(room)` | 用户点击房间时触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickRoomProperties(room)` | 点击房间属性信息触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRoomPropertiesDrawed(rooms)` | 房间属性绘制完成触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `areRoomsAdjacent(roomIds)` | 检查房间是否相邻（用于合并） | references/map-sdk/reference/methods.md |
| 方法 | `isPointInAnyRoom(point)` | 判断某点在哪个房间内 | references/map-sdk/reference/methods.md |
| 数据 | `roomProperties: RoomProperty[]` | 传入房间属性数据 | references/map-sdk/reference/data.md |
| 运行时 | `enableRoomSelection: boolean` | 开启房间选择模式 | references/map-sdk/reference/runtime.md |
| 运行时 | `selectRoomIds: number[]` | 当前选中的房间 ID 列表 | references/map-sdk/reference/runtime.md |
| 运行时 | `roomSelectionMode` | 选择样式：`'checkmark'`（勾选）或 `'order'`（排序） | references/map-sdk/reference/runtime.md |
| 运行时 | `showRoomName: boolean` | 显示房间名称 | references/map-sdk/reference/runtime.md |
| 运行时 | `showRoomProperty: boolean` | 显示房间属性图标 | references/map-sdk/reference/runtime.md |
| 运行时 | `showRoomOrder: boolean` | 显示清扫顺序 | references/map-sdk/reference/runtime.md |
| 配置 | `room.colors.*` | 房间颜色（active/inactive/name 等） | references/map-sdk/reference/config.md |
| 类型 | `RoomProperty` | 房间属性（name, cleanTimes, suction 等） | references/map-sdk/reference/types.md |
| 类型 | `RoomData` | 扩展 RoomProperty，含 centerPoint 和 index | references/map-sdk/reference/types.md |

**最佳实践**：
- 选择房间：Grep `## 选择房间` → `references/map-sdk/guide/advanced-usage.md`（含完全受控的选房代码示例）
- 房间配色：Grep `## 房间智能配色` → `references/map-sdk/guide/advanced-usage.md`（含四色定理自动配色方案）
- 清扫顺序：Grep `## 设置清扫顺序` → `references/map-sdk/guide/advanced-usage.md`（含 order 模式完整实现）
- 房间属性：Grep `## 房间信息` → `references/map-sdk/guide/advanced-usage.md`（含 roomProperties 使用示例）

**DP 指令流程**（点阵格式协议）：
1. 设置 `mode` = `'selectRoom'`
2. 编码选中房间 ID 列表，通过 `command_trans` 下发
3. 设置 `switch_go` = `true`

**DP 指令流程**（结构化协议）：使用 `useRoomClean()` hook

---

### 定点清扫（Spot Cleaning）

用户在地图上指定一个点，机器人移动到该位置并清扫周围区域。

**完整流程**：
```
用户点击"定点清扫" → 在地图上放置标记点 → 确认 → 下发坐标 → 启动清扫
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateSpot(spot)` | 用户移动定点标记触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickSpot(spot)` | 点击定点标记触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getSpots()` | 获取所有定点 | references/map-sdk/reference/methods.md |
| 方法 | `getSpotPointByViewportCenter()` | 在视口中心生成定点坐标 | references/map-sdk/reference/methods.md |
| 数据 | `spots: SpotParam[]` | 传入定点数据 | references/map-sdk/reference/data.md |
| 运行时 | `editingSpotIds: string[]` | 编辑中的定点 ID | references/map-sdk/reference/runtime.md |
| 配置 | `controls.spot.*` | 定点样式 | references/map-sdk/reference/config.md |
| 类型 | `SpotParam` | `{ id: string, point: Point }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `## 途径点` → `references/map-sdk/guide/advanced-usage.md`（含途径点/定点标记的代码示例）

**DP 指令流程**（点阵格式协议）：
1. 设置 `mode` = `'pose'`
2. 编码目标坐标，通过 `command_trans` 下发
3. 设置 `switch_go` = `true`

---

### 路径展示（Path Display）

展示机器人的清扫路径和回充路径。

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onPathDrawed(pathState)` | 路径绘制完成触发 | references/map-sdk/reference/callbacks.md |
| 数据 | `path: string` | 传入路径原始数据 | references/map-sdk/reference/data.md |
| 运行时 | `showPath: boolean` | 是否显示路径 | references/map-sdk/reference/runtime.md |
| 配置 | `path.commonPath.color` | 清扫路径颜色 | references/map-sdk/reference/config.md |
| 配置 | `path.chargePath.color` | 回充路径颜色 | references/map-sdk/reference/config.md |
| 类型 | `PathState` | 路径状态（type, direction, robotPosition 等） | references/map-sdk/reference/types.md |

路径数据通过 `useP2PDataStream` hook 从 P2P 通道实时获取，最后一个坐标点表示机器人当前位置。
详见 `references/data-stream/reference/p2p-stream.md`。

---

### 地图渲染控制

跨功能的通用 API。

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onMapReady(mapApi)` | 地图初始化完成，**获取 mapApi 的唯一时机** | references/map-sdk/reference/callbacks.md |
| 回调 | `onMapFirstDrawed(mapState)` | 首次地图渲染完成 | references/map-sdk/reference/callbacks.md |
| 回调 | `onMapDrawed(mapState)` | 地图渲染完成 | references/map-sdk/reference/callbacks.md |
| 方法 | `isMapDrawn` | 检查地图是否已绘制完成（readonly，返回 Promise\<boolean\>） | references/map-sdk/reference/methods.md |
| 方法 | `updateConfig(partialConfig)` | 动态更新配置（主题切换、颜色调整等场景） | references/map-sdk/reference/methods.md |
| 方法 | `updateRuntime(runtime)` | 动态更新运行时配置 | references/map-sdk/reference/methods.md |
| 方法 | `resetPanZoom()` | 重置地图缩放和平移 | references/map-sdk/reference/methods.md |
| 方法 | `snapshot(opts)` | 截取当前地图为 Base64 图片 | references/map-sdk/reference/methods.md |
| 方法 | `snapshotByData(data, runtime, opts)` | 根据数据生成地图截图（多地图缩略图） | references/map-sdk/reference/methods.md |
| 方法 | `getMapCenterPoint()` | 获取地图中心坐标 | references/map-sdk/reference/methods.md |
| 方法 | `getViewportCenterPoint()` | 获取当前视口中心坐标 | references/map-sdk/reference/methods.md |
| 运行时 | `mapRotation: number` | 地图旋转角度 | references/map-sdk/reference/runtime.md |
| 运行时 | `showRobot: boolean` | 是否显示扫地机器人（默认 true） | references/map-sdk/reference/runtime.md |
| 配置 | `controls.renderOrder: string[]` | 控件渲染层级顺序 | references/map-sdk/reference/config.md |

**最佳实践**：
- 截图：Grep `## 截图` → `references/map-sdk/guide/advanced-usage.md`（含 snapshot 和 snapshotByData 示例）
- 地图旋转：Grep `## 地图旋转` → `references/map-sdk/guide/advanced-usage.md`
- 自适应缩放：Grep `## 自适应缩放` → `references/map-sdk/guide/advanced-usage.md`（含超大/超小地图处理方案）
- 自定义元素：Grep `## 自定义元素` → `references/map-sdk/guide/advanced-usage.md`（含图片/GIF/HTML 自定义元素示例）
- 弹窗中使用地图：Grep `## 在弹窗里使用` → `references/map-sdk/guide/advanced-usage.md`
- 异层渲染手势：Grep `## 小程序异层渲染` → `references/map-sdk/guide/advanced-usage.md`

---

### 家具摆放（Furnitures）

用户在地图上放置床、沙发等家具图片，支持拖拽移动、旋转、缩放。

**完整流程**：
```
配置家具资源(config.furniture.assets) → 在视口中心生成初始坐标 → 添加到 furnitures state → 用户拖拽/旋转/缩放 → 回调更新 state → 保存
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateFurniture(furniture)` | 用户拖拽/旋转/缩放家具后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickFurniture(furniture)` | 点击家具触发（通常用来切换编辑态） | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveFurniture(id)` | 用户删除家具时触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getFurnitures()` | 获取当前所有家具数据 | references/map-sdk/reference/methods.md |
| 方法 | `getFurniturePointsByViewportCenter(opts)` | 在视口中心生成家具初始坐标，需传 furnitureType | references/map-sdk/reference/methods.md |
| 方法 | `drawFurnitures(furnitures)` | 命令式绘制家具（通常不需要手动调用） | references/map-sdk/reference/methods.md |
| 数据 | `furnitures: FurnitureParam[]` | 传入家具数据（受控） | references/map-sdk/reference/data.md |
| 运行时 | `editingFurnitureIds: string[]` | 当前编辑中的家具 ID | references/map-sdk/reference/runtime.md |
| 运行时 | `showFurnitures: boolean` | 是否显示家具（默认 true） | references/map-sdk/reference/runtime.md |
| 配置 | `furniture.assets` | 家具资源定义（type、src、width、height） | references/map-sdk/reference/config.md |
| 配置 | `furniture.*` | 家具编辑样式（旋转方向、缩放限制、轮廓色等） | references/map-sdk/reference/config.md |
| 类型 | `FurnitureParam` | `{ id, furnitureType, points: Point[] }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `## 家具` → `references/map-sdk/guide/advanced-usage.md`（含完整家具功能代码示例）

---

### 自定义区域（Custom Zone Types）

通过 `customZoneTypes` 声明项目专属的矩形区域类型，复用内置区域的拖拽/缩放交互，但有独立的样式和回调。

**完整流程**：
```
在 config.customZoneTypes 声明类型和样式 → 传入 customZones[type] 数据 → 用户操作 → onUpdateCustomZone/onClickCustomZone 回调 → 更新 state
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateCustomZone(type, zone)` | 用户操作自定义区域后触发，type 为声明的类型名 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickCustomZone(type, zone)` | 点击自定义区域触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onRemoveCustomZone(type, id)` | 用户删除自定义区域触发 | references/map-sdk/reference/callbacks.md |
| 数据 | `customZones` | 传入自定义区域数据（按类型名分组） | references/map-sdk/reference/data.md |
| 运行时 | `editingCustomZoneIds: Record<string, string[]>` | 按类型分组的编辑中区域 ID | references/map-sdk/reference/runtime.md |
| 配置 | `customZoneTypes` | 声明自定义区域类型及其样式 | references/map-sdk/reference/config.md |
| 类型 | `ZoneParam` | `{ id: string, points: Point[] }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `### 自定义区域` → `references/map-sdk/guide/advanced-usage.md`（含 customZoneTypes 完整示例）

---

### 自定义地毯（Custom Carpets）

在地图上展示用户自定义的地毯区域，支持矩形/圆形/多边形，可配置材质贴图和选中状态。

**完整流程**：
```
定义地毯类型(config.customCarpet) → 传入 customCarpets 数据 → 用户点击/拖拽 → 回调更新 state
```

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 回调 | `onUpdateCustomCarpet(carpet)` | 地毯拖拽/调整后触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onDeleteCustomCarpet(id)` | 删除自定义地毯触发 | references/map-sdk/reference/callbacks.md |
| 回调 | `onClickCarpet(carpet)` | 点击地毯触发 | references/map-sdk/reference/callbacks.md |
| 方法 | `getCustomCarpets()` | 获取当前所有自定义地毯 | references/map-sdk/reference/methods.md |
| 方法 | `getCustomCarpetPointsByViewportCenter(opts)` | 在视口中心生成地毯初始坐标 | references/map-sdk/reference/methods.md |
| 数据 | `customCarpets: CustomCarpetParam[]` | 传入自定义地毯数据 | references/map-sdk/reference/data.md |
| 运行时 | `editingCarpetIds: string[]` | 编辑中的地毯 ID | references/map-sdk/reference/runtime.md |
| 运行时 | `selectedCarpetIds: string[]` | 选中的地毯 ID | references/map-sdk/reference/runtime.md |
| 运行时 | `showCustomCarpets: boolean` | 是否显示自定义地毯（默认 true） | references/map-sdk/reference/runtime.md |
| 配置 | `customCarpet.*` | 地毯样式（颜色、材质贴图、选中样式等） | references/map-sdk/reference/config.md |
| 类型 | `CustomCarpetParam` | `{ id, type, shape, points?, customData? }` | references/map-sdk/reference/types.md |

**最佳实践**：Grep `## 自定义地毯` → `references/map-sdk/guide/advanced-usage.md`（含地毯创建、编辑、材质贴图完整示例）

---

### 热力图（Heatmap）

在地图上叠加清扫频率热力图，颜色越深表示清扫次数越多。

**地图组件 API**：

| 类别 | API | 说明 | 搜索文件 |
|---|---|---|---|
| 数据 | `heatmap` | 传入热力图原始数据字符串 | references/map-sdk/reference/data.md |
| 配置 | `config.heatmap` | 热力图视觉样式配置 | references/map-sdk/reference/config.md |
| 类型 | `HeatmapPoint` | 热力图数据点类型 | references/map-sdk/reference/types.md |

---

## 如何查找 API 详情

找到功能对应的 API 后，用 Grep 搜索具体参数和用法：

```
# 例：查找 onUpdateCleanZone 的详细参数
Grep "onUpdateCleanZone" → references/map-sdk/reference/callbacks.md

# 例：查找 controls.cleanZone 的所有配置项
Grep "cleanZone" → references/map-sdk/reference/config.md

# 例：查找 ZoneParam 类型定义
Grep "ZoneParam" → references/map-sdk/reference/types.md

# 例：查找 useZoneClean hook 用法
Grep "useZoneClean" → references/data-stream/reference/mqtt-hooks.md

# 例：查找选区清扫的协议编码函数
Grep "zone" → references/protocol/reference/commands.md
```

搜索到行号后，用 Read（带 offset + limit）只加载匹配区域的 30-50 行上下文。
