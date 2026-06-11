# 照明 (light)

## 照明情景库

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

### 接口能力

对照明情景库的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.4.14` 使用。**

| 接口名                                | 描述                                                |
| ------------------------------------- | --------------------------------------------------- |
| checkLightLibrariesVersionsUpgradable | 校验所绑定的库是否存在可更新的版本                  |
| upgradeToLatestLightLibrariesVersions | 升级设备或群组使用的库版本到最新                    |
| getLightLibrariesData                 | 获取设备或群组所绑定的照明（情景/音乐等）库中的数据 |
| getLightLibrariesDataTypes            | 获取设备或群组的所绑定的照明库数据类型              |

## 照明场景

#### getLightAppAiRuleNames

> [VERSION] @tuya-miniapp/cloud-api >= 1.2.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置, 具体操作: 找到 小程序照明场景能力 卡片, 点击卡片右下角 授权 按钮, 完成该云能力授权。

##### 描述

获取 App 端侧 AI 照明方案名称列表。该接口用于获取指定房间可用的灯光场景方案，包括基础场景（开/关）和 DIY 场景。返回的场景列表包含场景名称、颜色、图标、开灯百分比以及可选的场景数据列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 ID |
| `roomId` | `number` | 是 | 房间 ID |
| `sceneType` | `number` | 是 | 场景类型 (1: 基础场景开, 2: 基础场景关, 3: DIY 场景) |

##### 返回值

类型: `Promise<LightAppAiNameInfo[]>`

场景信息对象数组（nameRosettaKey、name、turnOnPercent、color、icon、sceneDataList、id 等，详见文档「返回参数」表及 SceneData 结构）

###### 引用对象

###### `interface` SceneData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `productId` | `string` | 否 | 产品 ID |
| `sceneId` | `number` | 否 | 场景 ID |
| `sceneCellBackground` | `string` | 否 | 场景单元格背景 |
| `dpCode` | `string` | 否 | DP 编码 |
| `sceneData` | `string` | 否 | 可直接下发的场景 DP 数据 |

##### 示例代码

###### 请求示例

```typescript
import { getLightAppAiRuleNames } from '@tuya-miniapp/cloud-api';

const params = {
  ownerId: '2142765',
  roomId: 65570111,
  sceneType: 3,
};

getLightAppAiRuleNames(params)
  .then(result => {
    console.log('场景方案列表:', result);
    result.forEach(scene => {
      console.log(`场景名称: ${scene.name}`);
      console.log(`开灯比例: ${scene.turnOnPercent}%`);
      console.log(`颜色: ${scene.color}`);
    });
  })
  .catch(error => {
    console.error('获取场景列表失败:', error);
  });
```

###### 返回示例

```json
[
  { "color": "50657A", "name": "全亮", "turnOnPercent": 100 },
  { "color": "71C149", "name": "全关" },
  { "color": "50657A", "name": "聊天", "turnOnPercent": 60 },
  { "color": "EA903A", "name": "家人互动", "turnOnPercent": 60 },
  { "color": "BA7B69", "name": "亲子互动", "turnOnPercent": 60 },
  { "color": "4E7ACE", "name": "接待", "turnOnPercent": 60 },
  {
    "color": "DC4F58",
    "name": "场景 31",
    "sceneDataList": [{ "sceneId": 112000112, "sceneData": "******" }]
  },
  {
    "color": "EA903A",
    "name": "场景 32",
    "sceneDataList": [{ "sceneId": 112000212, "sceneData": "******" }]
  }
]
```

##### 补充说明

1. `sceneDataList` 字段用于区分场景类型：
   - 有数据：表示该场景是情景库场景，可以直接下发 `sceneData` 到设备
   - 无数据或为空：表示该场景是 AI 生成式风格场景，需要进一步处理
2. 返回的场景列表会根据房间内设备的能力动态生成，不同房间可能返回不同的场景列表。
3. `turnOnPercent` 字段表示该场景下会有多少比例的灯具被打开，可用于 UI 展示或场景说明。
4. `color` 字段是不带 `#` 的 16 进制色值，使用时需要添加 `#` 前缀，如 `#50657A`。
#### previewLightScene

> [VERSION] @tuya-miniapp/cloud-api >= 1.2.0

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置, 具体操作: 找到 小程序照明场景能力 卡片, 点击卡片右下角 授权 按钮, 完成该云能力授权。

##### 描述

根据场景规则 JSON 数据，预览照明场景效果，返回执行成功和失败的动作列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 ID |
| `previewExpr` | `string` | 是 | 预览的场景 JSON 数据（PreviewExprData 对象序列化后的字符串） |

##### 返回值

类型: `Promise<PreviewLightSceneResult>`

successActions（执行成功的设备 ID 列表）、failActions（执行失败的设备 ID 列表）

###### PreviewLightSceneResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `successActions` | `string[]` | 否 | 执行成功的动作列表 |
| `failActions` | `string[]` | 否 | 执行失败的动作列表 |

##### 示例代码

###### 请求示例

```typescript
import { previewLightScene } from '@tuya-miniapp/cloud-api';

const params = {
  ownerId: '214276111',
  previewExpr: JSON.stringify({
    actions: [
      {
        executorProperty: {
          switch_led: false,
        },
        actionExecutor: 'lightDevice',
      },
    ],
    parentRegionId: 65570551,
    originPercent: 0,
    targetPercent: 0,
    type: 2,
  }),
};

previewLightScene(params)
  .then(result => {
    console.log('场景预览结果:', result);
    console.log('成功的设备:', result.successActions);
    console.log('失败的设备:', result.failActions);
  })
  .catch(error => {
    console.error('场景预览失败:', error);
  });
```

###### 返回示例

```json
{
  "successActions": ["6c4003f3231bb36d40q123", "6c135cd26c3fcab5862456"],
  "failActions": ["6c9fb53eqkzdw123", "6c7d2bgchtp9x345"]
}
```

##### 补充说明

1. `previewExpr` 参数是一个 JSON 字符串，建议先构建 JavaScript 对象，再使用 `JSON.stringify()` 转换。
2. 预览接口不会真正执行场景，只是验证配置的正确性和设备的可用性。
3. 返回的 `successActions` 和 `failActions` 数组包含的是设备 ID，可用于判断哪些设备配置正确，哪些设备可能需要调整。
4. 如果所有设备都配置正确，`failActions` 将是空数组。
#### saveLightScene

> [VERSION] @tuya-miniapp/cloud-api >= 1.2.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置-云能力进行授权配置, 具体操作: 找到 小程序照明场景能力 卡片, 点击卡片右下角 授权 按钮, 完成该云能力授权。

##### 描述

新增、编辑并保存照明场景。该接口用于保存灯光场景的规则配置，包括场景名称、图标、执行动作等信息���

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 ID |
| `sceneExpr` | `string` | 是 | 场景规则 JSON 数据（SaveExprData 对象序列化后的字符串） |

##### 返回值

类型: `Promise<SaveLightSceneResult>`

保存后的场景信息（含 id、code、name、parentRegionId、ownerId、icon、enabled、status、sceneType 等，详见文档「返回参数」表）；

###### SaveLightSceneResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 否 | 主键 ID |
| `code` | `string` | 否 | 场景编码 |
| `name` | `string` | 否 | 名称 |
| `parentRegionId` | `string` | 否 | 归属父区域 ID |
| `ownerId` | `string` | 否 | 家庭 ID |
| `uid` | `string` | 否 | 用户 ID |
| `actualRuleId` | `string` | 否 | 真实规则 ID |
| `icon` | `string` | 否 | 图标 |
| `clickIcon` | `string` | 否 | 根据 icon 字段，拼接点击图标 |
| `enabled` | `number` | 否 | 是否启用 (1: 启用, 0: 未启用) |
| `status` | `number` | 否 | 状态 (0: 已删除, 1: 正常) |
| `sort` | `number` | 否 | 排序 |
| `sceneType` | `1 \| 2 \| 3` | 否 | 场景类型 (1: 基础场景开, 2: 基础场景关, 3: 自定义场景) |
| `subSceneType` | `number` | 否 | 子类型，0 是��认值，无业务含义 |
| `actions` | `LinkageActionVO[]` | 否 | 执行动作 |
| `conditions` | `LinkageConditionVO[]` | 否 | 条件，目前只有分布式蓝牙灯光场景会使用该字段 |
| `modifyUid` | `string` | 否 | 更新当前记录的用户 ID |
| `brightPercent` | `number` | 否 | 亮度值百分比 |
| `brightVisible` | `boolean` | 否 | 亮度值百分比是否可见 |
| `displayColor` | `string` | 否 | 背景色 |
| `background` | `string` | 否 | 背景图片 |
| `scheduleBound` | `boolean` | 否 | 是否被日程引用 |
| `distributedAbnormalCode` | `0 \| 1 \| 2 \| 100` | 否 | 分布式灯光场景的异常状态 (0: 正常, 1: 暂存状态, 2: 房间设备变动导致的未同步, 100: 其他异常状态) |
| `distributeShortAddress` | `number` | 否 | 分布式规则的短地址 |
| `matchType` | `number` | 否 | 条件匹配类型, 目前只有蓝牙分布式灯光场景才会用到该字段 |
| `gmtCreate` | `number` | 否 | 创建时间 |
| `gmtModified` | `number` | 否 | 更新时间 |

###### 引用对象

###### `interface` LinkageActionVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actionExecutor` | `string` | 否 | 执行器类型，如 "lightDevice" |
| `entityId` | `string` | 否 | 实体 ID（设备 ID） |
| `entityName` | `string` | 否 | 实体名称（设备名称） |
| `executorProperty` | `Record<string, any>` | 否 | 执行属性，包含设备控制指令 |
| `extraProperty` | `Record<string, any>` | 否 | 额外属性，包含场景相关信息 |

###### `interface` LinkageConditionVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `conditionType` | `string` | 否 | 条件类型 |
| `entityId` | `string` | 否 | 实体 ID |
| `expr` | `Record<string, any>` | 否 | 条件表达式 |

##### 示例代码

###### 请求示例

```typescript
import { saveLightScene } from '@tuya-miniapp/cloud-api';

const params = {
  ownerId: '194137',
  sceneExpr: JSON.stringify({
    actions: [
      {
        actionExecutor: 'lightDevice',
        entityId: 'vdevo176127325226099',
        entityName: '调试-步进调光-vdevo',
        executorProperty: {
          switch_led: true,
          work_mode: 'scene',
          smb_scene: '0132010100000000000003e80000320101000000000000000a0000',
        },
        extraProperty: {
          parentRegionId: '57939115',
          sceneName: '500毫秒渐变（暖光）',
          sceneId: '22304912',
          sceneType: 1,
          selectCellBackground: 'https://images.tuyacn.com/light/library/icon/img_scene.png',
        },
      },
    ],
    parentRegionId: 57939115,
    name: '500毫秒渐变（暖光）',
    displayColor: 'BA7B69',
    sceneType: 3,
    matchType: 1,
    icon: 'https://images.tuyacn.com/smart/rule/light/dianji_default.png',
  }),
};

saveLightScene(params)
  .then(result => {
    console.log('场景保存成功:', result);
  })
  .catch(error => {
    console.error('场景保存失败:', error);
  });
```

###### 返回示例

```json
{
  "id": 123456,
  "code": "light_scene_001",
  "name": "500毫秒渐变（暖光）",
  "parentRegionId": "57939115",
  "ownerId": "194137",
  "uid": "ay1234567890",
  "icon": "https://images.tuyacn.com/smart/rule/light/dianji_default.png",
  "enabled": 1,
  "status": 1,
  "sort": 1,
  "sceneType": 3,
  "displayColor": "BA7B69",
  "matchType": 1,
  "gmtCreate": 1766558627585,
  "gmtModified": 1766558627585
}
```

##### 补充说明

1. `sceneExpr` 参数是一个复杂的 JSON 字符串，建议先构建 JavaScript 对象，再使用 `JSON.stringify()` 转换。
2. 返回结果中部分字段为可选字段，实际返回内容可能根据场景类型和配置有所不同。
## 生物节律

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

### 接口能力

对生物节律的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.4.14` 使用。**

| 接口名                         | 描述                           |
| ------------------------------ | ------------------------------ |
| createLightRhythmsRefreshTimer | 创建定时刷新生物节律时间的任务 |
| getLightRhythmsCityInfo        | 获取城市信息                   |
| getLightRhythmsTimeInfo        | 获取日出日落时间               |

## 音乐律动

#### onMusic2RgbChange

**名称**

onMusic2RgbChange

> 需引入MediaKit，且在>=3.2.0版本才可使用

**描述**

调用 onMusic2RgbChange，手机将开始收音并将麦克风的声音转换输出 hsv 等颜色数据以便进行下发，同时会保持 App 页面常亮

**请求参数**

| 参数        | 数据类型                                                                                         | 说明                                     | 是否必填 |
| :---------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------- | :------- |
| callback    | `function`                                                                                       | 获取转换后数据的回调                     | 是       |
| musicOption | `{ mode: number, colorList: [], dBRange: [number, number], throttle?: number }, customProps: Record<string, any> }` | 需要自定义颜色可进行配置, 详情见下面示例 | 否       |

**返回参数**

- 无

**请求示例**

```javascript
import { kit } from '@ray-js/panel-sdk';
const { onMusic2RgbChange } = kit.music2rgb;

// 1. 当点击开始按钮时,调用 onMusic2RgbChange，会进行收音并将麦克风的声音转换输出 hsv 等颜色数据以便进行下发，
// 同时会保持 App 页面常亮
const musicOption = {
  mode: 1, // 0 跳变；1 渐变 默认1
  colorList: [], // 可选入参， 随机在其中进行颜色选择 { hue: number; saturation: number; value: number }[]
  dBRange: [40, 80], // 可选入参， 分贝范围，会影响颜色亮度；版本 v1.13.2 开始支持
  throttle: 300, // 可选入参，节流时间，单位毫秒，默认300毫秒；版本 v1.14.0 开始支持
  customProps: {
    customKey: 'customValue',
  } // 可选入参，允许传入自定义参数，如：{ customKey: 'customValue' } 会在回调中返回；版本 v1.13.2 开始支持
};

/**
 * @param {(musicData: {
 *   mode: number; // 0 跳变；1 渐变 默认1
 *   hue: number;
 *   saturation: number;
 *   value: number;
 *   bright: number;
 *   temperature: number;
 *   db: number; // 分贝值，版本 v1.13.2 开始支持
 *   index: number; // 响应外部声音的灵敏度，可通过判断 index 返回值大小来控制音乐律动是否响应，来实现灵敏度控制需求；版本 v1.13.2 开始支持
 *   customProps: Record<string, any>; // 自定义属性，版本 v1.13.2 开始支持
 * }) => void} callback
 * @param {{
 *  mode: 0 | 1; // 0 跳变；1 渐变 默认1
 *  colorList: { hue: number; saturation: number; value: number }[];
 *  dBRange: [number, number]; // 分贝范围，会影响颜色亮度；版本 v1.13.2 开始支持
 *  throttle: number; // 节流时间，单位毫秒，默认300毫秒；版本 v1.14.0 开始支持
 *  customProps: Record<string, any>; // 自定义属性，透传；版本 v1.13.2 开始支持
 * }} musicOption
 */
onMusic2RgbChange(({ mode, hue, saturation, value, bright, temperature, db, index, customProps }) => {
  // 可继续自行处理下发 DP
  // ...
}, musicOption).catch(err => {
  // 注意：catch 使用方式从 panel-sdk v1.13.2 版本开始支持
  console.error(err);
});

```

#### 注意事项

- 问题1: 如何判断音乐律动的响应状态？
- 方案：可先缓存之前5次（约数，可自行调整）的返回值，如果5次都相同，则认为音乐律动响应状态不变，那么将状态改为不响应，否则认为音乐律动响应。
#### offMusic2RgbChange

**名称**

offMusic2RgbChange

> 需引入MediaKit，且在>=3.2.0版本才可使用

**描述**

停止收音并关闭，同时会关闭 App 页面常亮

**请求参数**

- 无

**返回参数**

- 无

**请求示例**

```javascript
import { music2rgb } from '@ray-js/panel-sdk';
const { offMusic2RgbChange } = music2rgb;

// 当点击结束或暂停按钮时，调用 offMusic2RgbChange
// 注意：catch 使用方式从 panel-sdk v1.13.2 版本开始支持
offMusic2RgbChange().catch((err) => {
  // 异常处理
  console.log('offMusic2RgbChange error', err);
}); // 会停止收音并关闭， 同时会关闭 App 页面常亮
```
