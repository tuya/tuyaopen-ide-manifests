# 使用

[AI-generated summary: 本文档介绍Tuya Miniapp面板小程序的国际化多语言实现方案，包括本地多语言定义、平台配置以及完整的API使用指南。覆盖内容：I18N, getLang, getDpLang, getDpName, getFaultLang, formatValue, 多语言规范, 语言切换, 优先级管理, Bitmap类型故障处理, 模板变量替换, 常见问题排查]

智能小程序或面板小程序的国际化多语言是开发过程中必不可少的一部分，能够帮助应用程序适应不同语言和文化的用户，提升用户体验和市场覆盖率。因此我们在 `面板 SDK` 中内置了 I18N 模块，该模块在 [内置 I18n 对象](/cn/miniapp/develop/miniapp/guide/i18n/config) 的基础之上拓展了一些功能，以便适用于面板小程序的多语言需求。

## 快速上手

首先，确保你已经安装了 `@ray-js/panel-sdk`，可以使用以下命令进行安装：

```bash
$ yarn add @ray-js/panel-sdk
```

然后确保项目的多语言文件结构示例如下，可参考 [public-sdm 模板](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate)：

```bash
├── src
│   ├── i18n
│   │   ├── index.ts # 多语言实例化导出
│   │   └── strings.ts # 多语言定义
│   └── ...
```

### 定义多语言

本地代码的多语言一般仅用于快速查看项目涉及的多语言词条以及兜底异常情况，如线上多语言为空时。另外像其他语种涉及多地区如 zh_CN、en_GB 等，本地代码也无法实现全兼容，因此建议不要在本地代码内定义除中英文外的多语言。

在 `src/i18n/strings.{js,ts}` 文件中进行编辑。

```javascript
// en 和 zh 必须都定义
export default {
  en: {
    hello: 'Hello',
    // 更多语言条目
  },
  zh: {
    hello: '您好',
    // 更多语言条目
  },
};
```

### 实例化多语言

在 `src/i18n/index.{js,ts}` 文件中进行实例化导出。

```javascript
import { kit } from '@ray-js/panel-sdk';
import strings from './strings';

const { I18N } = kit;

const Strings = new I18N(strings);

export default Strings;
```

### 使用多语言

可在任意需要使用多语言的场景进行调用。例如，在组件中：

```javascript
import React from 'react';
import Strings from '../i18n';

const MyComponent = () => (
  <div>
    {Strings.getLang('hello')}
  </div>
);

export default MyComponent;
```

### 平台配置多语言

#### 配置小程序多语言

小程序多语言需要在 [小程序开发者平台](https://platform.tuya.com/miniapp/) 中进行添加，选择对应的小程序后，点击侧边栏 **多语言管理**。

#### 配置产品多语言

产品多语言仅适用于面板小程序，且产品多语言的配置优先级高于面板小程序的多语言配置，详见 [Q：面板小程序的多语言逻辑是怎样的？](#q面板小程序的多语言逻辑是怎样的)

产品多语言需要在 [涂鸦开发者平台-产品多语言](https://platform.tuya.com/exp/i18n/multilingual) 中进行添加，选择对应的产品后，点击对应的 Tab 标签页进行多语言配置。

## 进阶开发

### 多语言规范

```javascript
export default {
  en: {
    dsc_edit: 'Edit', // Basic multi language with dsc_ start and name it semantically
    dsc_hour: 'Hour',
    dsc_minute: 'Minute',
    dsc_countdown_on: 'Turn on after {0}{1}',
    dp_switch: 'Switch', // Datapoint (DP) related multi language should be in accordance with the `dp_${dpCode}`
    dp_switch_on: 'Switch is On', // Boolean type datapoint related multi language should be in accordance with the `dp_${dpCode}_${'on' || 'off'}`
    dp_mode_smart: 'Smart Mode', // Enum type datapoint related multi language should be in accordance with the `dp_${dpCode}_${enumValue}`
    dp_fault_0: 'Binary first bit is faulty', // Bitmap type datapoint related multi language should be in accordance with the `dp_${dpCode}_${bit}`
    dp_fault_1: 'Binary second bit is faulty', // How to use of bitmap, see https://support.tuya.com/en/help/_detail/K9mc4euc6tq9i
  },
  zh: {
    dsc_edit: '编辑', // 基础多语言以 dsc_ 开头并命名语义化即可
    dsc_hour: '时',
    dsc_minute: '分',
    dsc_countdown_on: '设备将在{0}{1}后开启',
    dp_switch: '开关', // 功能点（DP）相关多语言需按照 `dp_${dpCode}` 进行命名
    dp_switch_on: '开关开', // 布尔类型功能点状态相关多语言需按照 `dp_${dpCode}_${'on' || 'off'}` 进行命名
    dp_mode_smart: '智能模式', // 枚举类型功能点状态相关多语言需按照 `dp_${dpCode}_${enumValue}` 进行命名
    dp_fault_0: '第一位故障', // Bitmap 类型功能点状态相关多语言需按照 `dp_${dpCode}_${bit}` 进行命名
    dp_fault_1: '第二位故障', // Bitmap 型如何使用可参考 https://support.tuya.com/zh/help/_detail/K9mc4euc6tq9i
  },
};
```

### 多语言 API

#### 获取多语言

**名称**

getLang

**描述**

获取 key 值对应的多语言字符串，在当前语种下不存在时会从 en 中去查找，如果都不存在则返回 `defaultValue` 或者 `${key}`

**请求参数**

| 参数         | 数据类型 | 说明                                 | 是否必填 |
| :----------- | :------- | :----------------------------------- | :------- |
| key          | `string` | 多语言 key 值                        | 是       |
| defaultValue | `string` | 默认值，没有查到对应配置时，返回该值 | 否       |

**返回参数**

| 参数   | 数据类型 | 说明                                           |
| :----- | :------- | :--------------------------------------------- |
| result | `string` | 返回对应 key 值的多语言字符串，或 defaultValue |

**请求示例**

```javascript
// 请求示例对应多语言数据源
// export default {
//   en: {
//     dsc_edit: 'Edit',
//     dsc_edit_en: 'Edit',
//   },
//   zh: {
//     dsc_edit: '编辑',
//   },
// };
import Strings from '../i18n';

Strings.getLang('dsc_edit'); // 假设当前运行语种环境为 zh，获取已配置的多语言
Strings.getLang('dsc_edit_en'); // 假设当前运行语种环境为 zh，但 zh 下不存在该词条，会从 en 中查找
Strings.getLang('dsc_edit_not_exist'); // 假设当前运行语种环境为 zh，获取未配置的多语言
```

**返回示例**

```javascript
'编辑' // 假设当前运行语种环境为 zh，获取已配置的多语言
'Edit' // 假设当前运行语种环境为 zh，但 zh 下不存在该词条，会从 en 中查找
'dsc_edit_not_exist'; // 假设当前运行语种环境为 zh，获取未配置的多语言
```

#### 获取功能点多语言

**名称**

getDpLang

**描述**

获取 DP code 功能点对应的多语言字符串，在当前语种下不存在时会从 en 中去查找，如果都不存在则返回 `dp_${code}_${value}`

getDpLang 相较于 getLang 来说，主要是用于规范化获取功能点相关的多语言，一般来说仅用于面板小程序。<br/>
  举个例子：getLang('dp_switch_on') 等同于 getDpLang('switch'.toLowerCase(), true);

**请求参数**

| 参数  | 数据类型                  | 说明               | 是否必填 |
| :---- | :------------------------ | :----------------- | :------- |
| code  | `string`                  | DP code，即功能点 code            | 是       |
| value | `string\|boolean\|number` | 对应 DP 点的状态值 | 否       |

**返回参数**

| 参数   | 数据类型 | 说明                                   |
| :----- | :------- | :------------------------------------- |
| result | `string` | 返回对应 key 值的多语言字符串，或 code |

**请求示例**

```javascript
// 请求示例对应多语言数据源
// export default {
//   en: {
//     dp_switch: 'Switch', // Datapoint (DP) related multi language should be in accordance with the `dp_${dpCode}`
//     dp_switch_on: 'Switch is On', // Boolean type datapoint related multi language should be in accordance with the `dp_${dpCode}_${'on' || 'off'}`
//   },
//   zh: {
//     dp_switch: '开关', // 功能点（DP）相关多语言需按照 `dp_${dpCode}` 进行命名
//     dp_switch_on: '开关开', // 布尔类型功能点状态相关多语言需按照 `dp_${dpCode}_${'on' || 'off'}` 进行命名
//   },
// };
import Strings from '../i18n';

Strings.getDpLang('switch'); // 假设当前运行语种环境为 zh，获取已配置的功能点多语言
Strings.getDpLang('switch', true); // 假设当前运行语种环境为 zh，获取已配置的功能点状态多语言
Strings.getDpLang('switch', false); // 假设当前运行语种环境为 zh，获取未配置的功能点状态多语言
```

**返回示例**

```javascript
'开关' // 假设当前运行语种环境为 zh，获取已配置的功能点多语言
'开关开' // 假设当前运行语种环境为 zh，获取已配置的功能点状态多语言
'dp_switch_off'; // 假设当前运行语种环境为 zh，获取未配置的功能点状态多语言
```

#### 获取功能点名称

**名称**

getDpName

**描述**

获取 DP 点对应的名称

出于 DP 命名规范性考虑，传入的的 DP code 均会被转换为小写字母，如 `Switch` 会被转换为 `switch`，一般来说仅用于面板小程序

**请求参数**

| 参数        | 数据类型 | 说明     | 是否必填 |
| :---------- | :------- | :------- | :------- |
| code        | `string` | DP code，即功能点 code  | 是       |
| defaultName | `string` | 默认名称 | 是       |

**返回参数**

| 参数   | 数据类型 | 说明                                          |
| :----- | :------- | :-------------------------------------------- |
| result | `string` | 返回对应 key 值的多语言字符串，或 defaultName |

**请求示例**

```javascript
// export default {
//   en: {
//     dp_switch: 'Switch', // Datapoint (DP) related multi language should be in accordance with the `dp_${dpCode}`
//   },
//   zh: {
//     dp_switch: '开关', // 功能点（DP）相关多语言需按照 `dp_${dpCode}` 进行命名
//   },
// };
import Strings from '../i18n';

Strings.getDpName('switch', '插座开关'); // 假设当前运行语种环境为 zh，获取已配置的功能点多语言
Strings.getDpName('switch_led', '彩光开关'); // 假设当前运行语种环境为 zh，获取未配置的功能点多语言
```

**返回示例**

```javascript
'开关'
'彩光开关'
```

#### 获取故障功能点多语言

**名称**

getFaultLang

**描述**

获取故障类型功能点（Bitmap 类型）对应的多语言字符串。该方法用于处理设备故障信息的多语言显示，支持按位解析故障码并返回对应的多语言描述。

getFaultLang 专门用于处理 Bitmap 类型的故障功能点，通过解析故障值的每一位来获取对应的故障描述。多语言 key 遵循 `dp_${faultCode}_${label}` 的命名规范。该 API 从 `@ray-js/panel-sdk` 1.14.0 版本开始支持。

**请求参数**

| 参数           | 数据类型                | 说明                                                         | 是否必填             |
| :------------- | :---------------------- | :----------------------------------------------------------- | :------------------- |
| faultCode         | `string`        | DP code，必须为故障类型的功能点 code                                       | 是                   |
| faultValue     | `number`                | 故障值，用于按位解析故障状态                                 | 是                   |
| options        | `object`                | 配置选项                                                     | 是                   |
| options.schema | `object`                | 故障类型的功能点 schema 信息，因此必须包含 `property.label` 数组             | 是                   |
| options.mode   | `'first'\|'all'`        | 返回模式：'first' 返回第一个故障，'all' 返回所有故障         | 否，默认 'first'     |
| options.targetBits | `number[]`          | 指定要处理的故障位数组，不指定则处理所有位                   | 否                   |

**返回参数**

| 参数   | 数据类型 | 说明                                           |
| :----- | :------- | :--------------------------------------------- |
| result | `string` | 返回故障的多语言字符串，多个故障时用逗号分隔   |

**请求示例**

```javascript
// 请求示例对应多语言数据源
// export default {
//   en: {
//     dp_fault_motor_fault: 'Motor Fault',       // 对应 schema.property.label[0]
//     dp_fault_sensor_error: 'Sensor Error',     // 对应 schema.property.label[1]  
//     dp_fault_overheat: 'Overheat Protection',  // 对应 schema.property.label[2]
//   },
//   zh: {
//     dp_fault_motor_fault: '电机故障',            // 对应 schema.property.label[0]
//     dp_fault_sensor_error: '传感器错误',         // 对应 schema.property.label[1]
//     dp_fault_overheat: '过热保护',               // 对应 schema.property.label[2]
//   },
// };

import Strings from '../i18n';

// Schema 定义
const faultSchema = {
  property: {
    label: ['motor_fault', 'sensor_error', 'overheat']
  }
};

// 示例1: 获取第一个故障（默认模式）
Strings.getFaultLang('fault', 5, { 
  schema: faultSchema 
}); 
// faultValue = 5 (二进制 101)，第0位和第2位为1

// 示例2: 获取所有故障
Strings.getFaultLang('fault', 7, { 
  schema: faultSchema, 
  mode: 'all' 
}); 
// faultValue = 7 (二进制 111)，所有位都为1

// 示例3: 只处理指定的故障位
Strings.getFaultLang('fault', 7, { 
  schema: faultSchema, 
  mode: 'all',
  targetBits: [0, 2] 
});
// 只检查第0位和第2位的故障
```

**返回示例**

```javascript
'电机故障'                          // 示例1: mode='first'，返回第一个匹配的故障
'电机故障, 传感器错误, 过热保护'     // 示例2: mode='all'，返回所有故障
'电机故障, 过热保护'                // 示例3: 指定 targetBits，只返回指定位的故障
```

#### 替换多语言模板变量

**名称**

formatValue

**描述**

`formatValue` 方法用于从语言包中获取指定键的模板字符串，并将传入的值替换到模板字符串中的占位符位置。

**请求参数**

| 参数   | 数据类型 | 说明                   | 是否必填 |
| :----- | :------- | :--------------------- | :------- |
| key    | `string` | 指定语言包中的键，用于获取对应的模板字符串 | 是       |
| ...values | `string[]`  | 可变参数，表示需要替换到模板字符串中的值。每个值将依次替换模板字符串中的占位符 {0}, {1}, {2}，依此类推 | 是       |

**返回参数**

| 参数   | 数据类型 | 说明           |
| :----- | :------- | :------------- |
| result | `string` | 返回替换后的字符串 |

**请求示例**

```javascript
// export default {
//   en: {
//     dsc_countdown_on: 'Turn on after {0}{1}',
//   },
//   zh: {
//     dsc_countdown_on: '设备将在{0}{1}后开启',
//   },
// };
import Strings from '../i18n';

// 正确使用：将参数替换到模板字符串的占位符中
Strings.formatValue('dsc_countdown_on', '1小时', '5分钟');

// ❌ 错误示例：不要将纯数字作为多语言 key 配置
// 如果多语言配置中存在 { "0": "小时", "1": "分钟" }
// 调用 Strings.formatValue('dsc_countdown_on', '1', '5') 可能会导致意外的替换结果
```

**返回示例**

```javascript
'设备将在1小时5分钟后开启'
```

**注意事项**

请确保 `0-9` 之类的数字不被作为 key 配置多语言，因为底层基于 `I18n.t` 实现，详细可参考 [多语言占位符](/cn/miniapp/develop/miniapp/guide/i18n/config#多语言占位符)。

### 多语言语种切换测试

小程序的语言环境依赖于当前运行环境，即 `Tuya MiniApp IDE` 或 `App 真机`，目前不支持动态切换语言，如果需要进行语言切换测试，可以通过下述操作方式进行：

- 在 `App 真机` 中切换语言。
  - iOS：[更改 iPhone 或 iPad 上的语言](https://support.apple.com/zh-cn/109358)
  - Android：[更改 Android 手机上的应用语言](https://support.google.com/android/answer/12395118?hl=zh-Hans&sjid=15451232456307275327-AP)
- 在 `Tuya MiniApp IDE` 中切换语言，详见下图。

## 常见问题

更多多语言常见问题可查看 [帮助中心-多语言](https://support.tuya.com/zh/help/_list?category=Cbutcmllzdtzl)

### Q: 为什么我在本地代码中定义的多语言没有生效？

A：本地的多语言优先级低于平台上传的多语言，如果平台上传了多语言，本地代码中定义的多语言将不会生效。

### Q：为什么我在小程序平台上修改了多语言，但是却不生效？

A1：如果是 `智能小程序`，如果确认在业务代码中使用的多语言 key 和平台上修改的多语言 key 一致，且确认清理过 App 缓存重进小程序，如果还是不生效，请联系涂鸦技术支持。

A2: 如果是 `面板小程序`，请按以下步骤进行排查：

1. 当前在 `Tuya MiniApp IDE` 或在 App 真机中运行设备对应产品关联的面板小程序是否为当前修改的小程序。

注意点1：面板小程序运行时的多语言是基于当前设备对应的产品进行拉取的，相当于拉取的是当前产品关联的面板小程序的多语言，所以如果修改的是其他小程序的多语言，是不会生效的，更多可查看 [Q：面板小程序的多语言逻辑是怎样的？](#q面板小程序的多语言逻辑是怎样的)

2. 当前在 `Tuya MiniApp IDE` 或在 App 真机中运行设备对应产品是否存在相同 key 的多语言配置且写入过不同的多语言值。

注意点2：产品多语言的配置优先级高于面板小程序的多语言配置，更多可查看  [Q：面板小程序的多语言逻辑是怎样的？](#q面板小程序的多语言逻辑是怎样的)

3. 如果确认前俩步骤都没有问题，且确认清理过 App 缓存重进小程序，如果还是不生效，请联系涂鸦技术支持。

### Q：面板小程序的多语言逻辑是怎样的？

A: 由于面板小程序可以同时被多个产品关联，而不同的产品可能需要不同的多语言配置，因此面板小程序的多语言的设计逻辑见下：

| 多语言类型 | 优先级 | 配置场景 | 来源截图 |
| --- | --- | --- | --- |
| 本地多语言 <div style={{ minWidth: '120px' }} /> | `3` <div style={{ minWidth: '30px' }} /> | 1. 快速查看项目涉及的多语言词条。 
 2. 在线上多语言无法获取到时用于兜底。<div style={{ minWidth: '200px' }} /> |
|
| 面板小程序多语言 <div style={{ minWidth: '120px' }} /> | `2` <div style={{ minWidth: '30px' }} /> | 用于批量对当前面板小程序中所有关联的产品同时生效多语言。
*（前提是该面板小程序已经发布且关联过对应产品，且对应的产品尚未配置多语言，否则将优先使用产品已有的多语言配置）*<div style={{ minWidth: '200px' }} /> |

|
| 产品多语言 <div style={{ minWidth: '120px' }} /> | `1` <div style={{ minWidth: '30px' }} /> | 用于仅针对当前产品配置多语言。<div style={{ minWidth: '200px' }} /> |
|

**相当于产品多语言配置的优先级最高，其次是面板小程序多语言配置，最后是本地多语言配置。**

### Q：为什么会出现多语言上传失败？

A: 可按照以下步骤进行排查：

1. 检查上传的多语言文件是否符合平台要求的 EXCEL 或 JSON 格式，且大小小于 1M。
2. 检查上传的多语言文件内容是否存在英文下写了中文的场景，如下所示：

```javascript
export default {
  en: {
    hello: '你好', // 在 en 英文下写入了中文
  },
  zh: {
    hello: '你好',
  },
};
```

3. 检查上传的多语言文件内容是否存在中英文 key 不完全对齐的情况，如下所示：

```javascript
export default {
  en: {
    hello: 'Hello',
    world: 'World', // 只在 en 英文下配置了 world，在 zh 中文下没有配置
  },
  zh: {
    hello: '你好',
  },
};
```

4. 检查上传的多语言文件内容是否存在多语言 key 重复的情况，如下图所示（普遍发生在 EXCEL 中）：

```javascript
export default {
  en: {
    hello: 'Hello',
    world: 'World',
    hello: 'Helloo', // 重复的 key
  },
  zh: {
    hello: '你好',
    world: '世界',
    hello: '你好啊',
  },
};
```
