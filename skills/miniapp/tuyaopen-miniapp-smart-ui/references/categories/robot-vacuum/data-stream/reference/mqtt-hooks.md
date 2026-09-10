# MQTT Hooks

本页面文档描述所有 MQTT hooks 的公开 API。每个 hook 均需在 `MqttProvider` 上下文内使用。

## 清扫功能

### useZoneClean

划区清扫。

```ts
useZoneClean(): {
  requestZoneClean: () => Promise<ZoneCleanResponse>;
  setZoneClean: (params: SetZoneCleanParams) => Promise<ZoneCleanResponse>;
}
```

**方法：**

| 方法                   | 说明                 |
| ---------------------- | -------------------- |
| `requestZoneClean()`   | 查询当前划区清扫配置 |
| `setZoneClean(params)` | 设置并启动划区清扫   |

**setZoneClean 参数：**

| 字段            | 类型                              | 必填 | 说明         |
| --------------- | --------------------------------- | ---- | ------------ |
| `zones`         | `Array<{points, name, advanced}>` | 是   | 清扫区域列表 |
| `origin`        | `Object`                          | 是   | 坐标原点信息 |
| `suctions`      | `string[]`                        | 否   | 吸力设置     |
| `cisterns`      | `(string\|number)[]`              | 否   | 水量设置     |
| `cleanCounts`   | `number[]`                        | 否   | 清扫次数     |
| `yMops`         | `number[]`                        | 否   | Y 形拖地     |
| `sweepMopModes` | `string[]`                        | 否   | 清扫模式     |

---

### useSelectRoomClean

选房清扫。

```ts
useSelectRoomClean(): {
  requestSelectRoomClean: () => Promise<RoomCleanResponse>;
  setRoomClean: (data: SetRoomCleanParams) => Promise<RoomCleanResponse>;
}
```

**方法：**

| 方法                       | 说明               |
| -------------------------- | ------------------ |
| `requestSelectRoomClean()` | 查询选房清扫配置   |
| `setRoomClean(data)`       | 设置并启动选房清扫 |

**setRoomClean 参数：**

接受房间数组，每个房间：

| 字段           | 类型             | 必填 | 说明     |
| -------------- | ---------------- | ---- | -------- |
| `roomId`       | `number`         | 是   | 房间 ID  |
| `suction`      | `string`         | 否   | 吸力     |
| `cistern`      | `string\|number` | 否   | 水量     |
| `cleanTimes`   | `number`         | 否   | 清扫次数 |
| `yMop`         | `number`         | 否   | Y 形拖地 |
| `sweepMopMode` | `string`         | 否   | 清扫模式 |

---

### useSpotClean

定点清扫。

```ts
useSpotClean(): {
  requestSpotClean: () => Promise<SpotCleanResponse>;
  setSpotClean: (params: SetSpotCleanParams) => Promise<SpotCleanResponse>;
}
```

**方法：**

| 方法                   | 说明               |
| ---------------------- | ------------------ |
| `requestSpotClean()`   | 查询定点清扫配置   |
| `setSpotClean(params)` | 设置并启动定点清扫 |

**setSpotClean 参数：**

| 字段            | 类型                 | 必填 | 说明         |
| --------------- | -------------------- | ---- | ------------ |
| `spots`         | `Array`              | 是   | 定点坐标列表 |
| `origin`        | `Object`             | 是   | 坐标原点信息 |
| `suctions`      | `string[]`           | 否   | 吸力设置     |
| `cisterns`      | `(string\|number)[]` | 否   | 水量设置     |
| `cleanCounts`   | `number[]`           | 否   | 清扫次数     |
| `yMops`         | `number[]`           | 否   | Y 形拖地     |
| `sweepMopModes` | `string[]`           | 否   | 清扫模式     |

---

### useCarpetClean

地毯清扫。

```ts
useCarpetClean(): {
  requestCarpetClean: () => Promise<CarpetCleanResponse>;
  setCarpetClean: (data: number[]) => Promise<CarpetCleanResponse>;
}
```

**方法：**

| 方法                   | 说明                           |
| ---------------------- | ------------------------------ |
| `requestCarpetClean()` | 查询地毯清扫配置               |
| `setCarpetClean(data)` | 设置地毯清扫，传入地毯 ID 数组 |

---

## 地毯管理

### useCarpet

地毯的增删改查。

```ts
useCarpet(): {
  addCarpet: (info: CarpetInfo) => Promise<CarpetResponse>;
  updateCarpet: (info: Partial<CarpetInfo>) => Promise<CarpetResponse>;
  deleteCarpet: (data: { ids: number[] }) => Promise<CarpetResponse>;
  queryCarpet: (data?) => Promise<CarpetResponse>;
  setCarpet: (info: CarpetInfo) => Promise<CarpetResponse>;
}
```

**方法：**

| 方法                  | 说明               |
| --------------------- | ------------------ |
| `addCarpet(info)`     | 添加地毯           |
| `updateCarpet(info)`  | 更新地毯信息       |
| `deleteCarpet({ids})` | 删除指定 ID 的地毯 |
| `queryCarpet()`       | 查询所有地毯       |
| `setCarpet(info)`     | 设置地毯属性       |

**CarpetInfo 字段：**

| 字段        | 类型     | 说明       |
| ----------- | -------- | ---------- |
| `shape`     | `string` | 地毯形状   |
| `polygons`  | `Array`  | 多边形顶点 |
| `num`       | `number` | 编号       |
| `type`      | `string` | 地毯类型   |
| `cleanMode` | `string` | 清洁模式   |

---

## 房间与分区

### useRoomProperty

房间属性管理。

```ts
useRoomProperty(): {
  requestRoomProperty: () => Promise<RoomPropertyResponse>;
  setRoomProperty: (data: SetRoomPropertyParams) => Promise<RoomPropertyResponse>;
}
```

**方法：**

| 方法                    | 说明                             |
| ----------------------- | -------------------------------- |
| `requestRoomProperty()` | 查询所有房间属性（仅 MQTT 模式） |
| `setRoomProperty(data)` | 设置房间属性                     |

**setRoomProperty 参数：**

| 字段               | 类型                 | 必填 | 说明         |
| ------------------ | -------------------- | ---- | ------------ |
| `ids`              | `number[]`           | 是   | 房间 ID 列表 |
| `num`              | `number`             | 否   | 房间数量     |
| `suctions`         | `string[]`           | 否   | 吸力         |
| `cleanCounts`      | `number[]`           | 否   | 清扫次数     |
| `yMops`            | `number[]`           | 否   | Y 形拖地     |
| `sweepMopModes`    | `string[]`           | 否   | 清扫模式     |
| `names`            | `string[]`           | 否   | 房间名称     |
| `nameLabels`       | `string[]`           | 否   | 房间标签     |
| `floorTypes`       | `string[]`           | 否   | 地面类型     |
| `orders`           | `number[]`           | 否   | 清扫顺序     |
| `routePreferences` | `string[]`           | 否   | 路线偏好     |
| `waterValues`      | `(string\|number)[]` | 否   | 自定义水量值 |

---

### usePartDivision

房间分隔。

```ts
usePartDivision(): {
  setPartDivision: (points: Array, roomId: number | string, origin: Object) => Promise<PartDivisionResponse>;
}
```

**方法：**

| 方法                                      | 说明                 |
| ----------------------------------------- | -------------------- |
| `setPartDivision(points, roomId, origin)` | 在指定房间设置分隔线 |

---

### usePartMerge

分区合并。

```ts
usePartMerge(): {
  setPartMerge: (data: { ids: number[] }) => Promise<PartMergeResponse>;
}
```

**方法：**

| 方法                  | 说明                 |
| --------------------- | -------------------- |
| `setPartMerge({ids})` | 合并指定房间 ID 列表 |

---

## 虚拟区域

### useVirtualArea

虚拟禁区管理。

```ts
useVirtualArea(): {
  requestVirtualArea: () => Promise<VirtualAreaResponse>;
  setVirtualArea: (params: SetVirtualAreaParams) => Promise<VirtualAreaResponse>;
}
```

**方法：**

| 方法                     | 说明             |
| ------------------------ | ---------------- |
| `requestVirtualArea()`   | 查询所有虚拟禁区 |
| `setVirtualArea(params)` | 设置虚拟禁区     |

**setVirtualArea 参数：**

| 字段     | 类型                          | 必填 | 说明         |
| -------- | ----------------------------- | ---- | ------------ |
| `data`   | `Array<{points, name, mode}>` | 是   | 禁区列表     |
| `origin` | `Object`                      | 是   | 坐标原点信息 |

---

### useVirtualWall

虚拟墙管理。

```ts
useVirtualWall(): {
  requestVirtualWall: () => Promise<VirtualWallResponse>;
  setVirtualWall: (params: SetVirtualWallParams) => Promise<VirtualWallResponse>;
}
```

**方法：**

| 方法                     | 说明           |
| ------------------------ | -------------- |
| `requestVirtualWall()`   | 查询所有虚拟墙 |
| `setVirtualWall(params)` | 设置虚拟墙     |

**setVirtualWall 参数：**

| 字段     | 类型           | 必填 | 说明           |
| -------- | -------------- | ---- | -------------- |
| `data`   | `Array<Array>` | 是   | 虚拟墙线段坐标 |
| `origin` | `Object`       | 是   | 坐标原点信息   |

---

## 地图管理

### useHistoryMap

历史地图管理，包含删除、切换、保存操作。

```ts
useHistoryMap(): {
  deleteHistoryMap: (mapId: string) => Promise<DeleteMapResponse>;
  changeCurrentMap: (mapId: string, url: string) => Promise<UseMapResponse>;
  saveMap: (data?: { oper?: number }) => Promise<SaveMapResponse>;
}
```

**方法：**

| 方法                           | 说明                      |
| ------------------------------ | ------------------------- |
| `deleteHistoryMap(mapId)`      | 删除指定地图              |
| `changeCurrentMap(mapId, url)` | 切换当前使用的地图        |
| `saveMap(data?)`               | 保存当前地图，`oper` 可选 |

---

### useResetMap

重置地图。

```ts
useResetMap(): {
  setResetMap: () => Promise<ResetMapResponse>;
}
```

**方法：**

| 方法            | 说明         |
| --------------- | ------------ |
| `setResetMap()` | 重置当前地图 |

---

## 设备信息与设置

### useDevInfo

查询设备信息。

```ts
useDevInfo(): {
  requestDevInfo: () => Promise<DevInfoResponse>;
}
```

**方法：**

| 方法               | 说明         |
| ------------------ | ------------ |
| `requestDevInfo()` | 查询设备信息 |

---

### useSchedule

定时任务管理。

```ts
useSchedule(): {
  requestSchedule: (message?: { version?: string }) => Promise<ScheduleResponse>;
  setSchedule: (message: SetScheduleParams) => Promise<ScheduleResponse>;
}
```

**方法：**

| 方法                        | 说明             |
| --------------------------- | ---------------- |
| `requestSchedule(message?)` | 查询定时任务列表 |
| `setSchedule(message)`      | 设置定时任务     |

**setSchedule 参数：**

| 字段   | 类型                  | 必填 | 说明         |
| ------ | --------------------- | ---- | ------------ |
| `num`  | `number`              | 是   | 定时任务数量 |
| `list` | `Array<ScheduleItem>` | 是   | 定时任务列表 |

**ScheduleItem 字段：**

| 字段               | 类型                 | 说明     |
| ------------------ | -------------------- | -------- |
| `active`           | `boolean`            | 是否启用 |
| `suctions`         | `string[]`           | 吸力     |
| `sweepMopModes`    | `string[]`           | 清扫模式 |
| `ids`              | `number[]`           | 房间 ID  |
| `cleanCounts`      | `number[]`           | 清扫次数 |
| `cycle`            | `string`             | 重复周期 |
| `cisterns`         | `(string\|number)[]` | 水量     |
| `time`             | `string`             | 执行时间 |
| `routePreferences` | `string[]`           | 路线偏好 |

---

### useQuiteHours

勿扰模式设置。

```ts
useQuiteHours(): {
  requestQuiteHours: () => Promise<QuietHoursResponse>;
  setQuiteHours: (params: SetQuietHoursParams) => Promise<QuietHoursResponse>;
}
```

**方法：**

| 方法                    | 说明                             |
| ----------------------- | -------------------------------- |
| `requestQuiteHours()`   | 查询勿扰模式配置（仅 MQTT 模式） |
| `setQuiteHours(params)` | 设置勿扰模式                     |

**setQuiteHours 参数：**

| 字段        | 类型                             | 必填 | 说明     |
| ----------- | -------------------------------- | ---- | -------- |
| `startTime` | `{hour: number, minute: number}` | 是   | 开始时间 |
| `endTime`   | `{hour: number, minute: number}` | 是   | 结束时间 |
| `active`    | `boolean`                        | 是   | 是否启用 |
| `day`       | `string`                         | 是   | 生效日期 |

---

### usePassword

设备密码管理。

```ts
usePassword(): {
  requestPassword: () => Promise<PasswordResponse>;
  setPassword: (params: SetPasswordParams) => Promise<PasswordResponse>;
  checkPassword: (params: CheckPasswordParams) => Promise<PasswordResponse>;
}
```

**方法：**

| 方法                    | 说明                         |
| ----------------------- | ---------------------------- |
| `requestPassword()`     | 查询密码状态（仅 MQTT 模式） |
| `setPassword(params)`   | 设置密码                     |
| `checkPassword(params)` | 校验密码                     |

**setPassword 参数：**

| 字段          | 类型     | 必填 | 说明                    |
| ------------- | -------- | ---- | ----------------------- |
| `password`    | `string` | 是   | 新密码（自动 MD5 加密） |
| `oldPassword` | `string` | 否   | 旧密码（修改时需要）    |

**checkPassword 参数：**

| 字段       | 类型     | 必填 | 说明                        |
| ---------- | -------- | ---- | --------------------------- |
| `password` | `string` | 是   | 待校验密码（自动 MD5 加密） |

---

### useVoice

语音语言管理。

```ts
useVoice(): {
  requestAllVoices: () => Promise<VoiceListResponse>;
  requestVoiceInUse: () => Promise<VoiceInUseResponse>;
  setVoice: (message: SetVoiceParams) => Promise<VoiceResponse>;
}
```

**方法：**

| 方法                  | 说明                   |
| --------------------- | ---------------------- |
| `requestAllVoices()`  | 获取所有可用语音包列表 |
| `requestVoiceInUse()` | 查询当前使用的语音     |
| `setVoice(message)`   | 设置语音语言           |

**setVoice 参数：**

| 字段  | 类型     | 必填 | 说明           |
| ----- | -------- | ---- | -------------- |
| `id`  | `string` | 是   | 语音包 ID      |
| `url` | `string` | 是   | 语音包下载地址 |

---

## WiFi 与模型

### useWifiMap

WiFi 信号热力图。

```ts
useWifiMap(): {
  requestWifiMap: () => Promise<WifiMapResponse>;
  setWifiMap: (data?: { switch?: boolean }) => Promise<WifiMapResponse>;
}
```

**方法：**

| 方法                | 说明                 |
| ------------------- | -------------------- |
| `requestWifiMap()`  | 查询 WiFi 热力图数据 |
| `setWifiMap(data?)` | 设置 WiFi 热力图开关 |

---

### useDeviceModel

设备模型管理。

```ts
useDeviceModel(): {
  requestDeviceList: () => Promise<DeviceModelResponse>;
  setDeviceModel: (data: DeviceModelInfo[]) => Promise<DeviceModelResponse>;
}
```

**方法：**

| 方法                   | 说明             |
| ---------------------- | ---------------- |
| `requestDeviceList()`  | 查询设备模型列表 |
| `setDeviceModel(data)` | 设置设备模型信息 |

---

### useFurnitureModel

家具模型管理。

```ts
useFurnitureModel(): {
  requestFurnitureList: () => Promise<FurnitureModelResponse>;
  setFurnitureModel: (data: FurnitureModelInfo[]) => Promise<FurnitureModelResponse>;
}
```

**方法：**

| 方法                      | 说明             |
| ------------------------- | ---------------- |
| `requestFurnitureList()`  | 查询家具模型列表 |
| `setFurnitureModel(data)` | 设置家具模型信息 |
