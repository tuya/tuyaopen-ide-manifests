# 工具方法

[AI-generated summary: 本文档介绍Ray平台面板开发中的通用工具方法库，提供字符串处理、对象操作、数组分组、版本比较和类型判断等基础工具，帮助开发者快速处理常见的数据转换和对象操作需求。覆盖内容：toFixed、toFilled、partition、get、pick、omit、chunk、compareVersion、isObject、isArray、isNil、defaultValue]

工具方法（panel-utils）主要在适配、颜色、数值、时间、字符串、温度等方面封装了一系列常用的工具方法，帮助您更方便的开发智能产品。

## 如何使用

```shell
$ yarn add @ray-js/panel-sdk

# or

$ npm install @ray-js/panel-sdk
```

then

```javascript
import { utils } from '@ray-js/panel-sdk';

utils.toFixed('111', 5); // '00111'
```

### toFixed

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 如果原始字符串长度大于 count，会从右侧截取最后 count 位。与 toFilled 不同，该函数始终返回固定长度的字符串。

#### 描述

获取指定长度字符串，不足时前补零，超出时从右侧截取

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string \| number` | 是 | 需要填充的字符串或数字 |
| `count` | `number` | 是 | 返回字符串的固定长度 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { toFixed } = utils;

toFixed('111', 5);    // '00111'
toFixed('3456111', 5); // '56111'
toFixed(42, 4);        // '0042'
```

---
name: "toFilled"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### toFilled

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 与 toFixed 不同，当原始字符串长度已经大于等于 count 时，不会截断。

#### 描述

将字符串用前导零填充到指定最小长度

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | 是 | 需要填充的字符串 |
| `count` | `number` | 是 | 返回字符串的最小长度 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { toFilled } = utils;

toFilled('111', 5);     // '00111'
toFilled('3456111', 5); // '3456111'
```

---
name: "partition"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### partition

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将字符串按指定长度分割为子字符串数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | 是 | 需要分割的原始字符串 |
| `chunk` | `number` | 是 | 每个子字符串的长度 |

#### 返回值

类型: `string[]`

分割后的字符串数组，最后一个元素长度可能小于 chunk

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { partition } = utils;

partition('1234567', 3); // ['123', '456', '7']
partition('AABB', 2);    // ['AA', 'BB']
```

---
name: "get"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### get

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

根据路径字符串安全地获取嵌套对象的属性值（lodash.get 的轻量替代）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `object` | `Record<string, any>` | 是 | 要查询的源对象 |
| `pathString` | `string` | 是 | 属性路径，使用点号分隔，如 'a.b.c' |
| `defaultValue` | `string \| number \| false \| true \| Record<string, any>` | 否 | 当路径解析结果为 undefined 时返回的默认值 |

#### 返回值

类型: `string \| number \| false \| true \| Record<string, any>`

路径对应的属性值，若未找到则返回 defaultValue

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { get } = utils;

const obj = { a: { b: { c: 42 } } };
get(obj, 'a.b.c');          // 42
get(obj, 'a.b.x', 'N/A');  // 'N/A'
get(obj, 'a.b.c.d');       // undefined
```

---
name: "pick"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### pick

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

从对象中选取指定键的属性，返回新对象（lodash.pick 的轻量替代）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `object` | `Record<string, unknown>` | 是 | 源对象 |
| `keys` | `string[]` | 是 | 需要选取的属性键名数组 |

#### 返回值

类型: `Record<string, unknown>`

仅包含指定键的新对象

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { pick } = utils;

const obj = { a: 1, b: 2, c: 3 };
pick(obj, ['a', 'c']); // { a: 1, c: 3 }
pick(obj, ['d']);       // {}
```

---
name: "omit"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### omit

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

从对象中排除指定键的属性，返回新对象（lodash.omit 的轻量替代）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `object` | `Record<string, unknown>` | 是 | 源对象 |
| `keys` | `string[]` | 是 | 需要排除的属性键名数组 |

#### 返回值

类型: `Record<string, unknown>`

排除指定键后的新对象（浅拷贝）

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { omit } = utils;

const obj = { a: 1, b: 2, c: 3 };
omit(obj, ['b']);      // { a: 1, c: 3 }
omit(obj, ['a', 'c']); // { b: 2 }
```

---
name: "chunk"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### chunk

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数组按指定大小分割为多个子数组（lodash.chunk 的轻量替代）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `arr` | `any[]` | 是 | 需要分割的原始数组 |
| `chunkSize` | `number` | 否 | 每个子数组的大小，默认为 1 |
| `cache` | `any[]` | 否 | 内部递归用缓存数组，通常无需传入 |

#### 返回值

类型: `any[]`

分割后的二维数组

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { chunk } = utils;

chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk(['a', 'b', 'c'], 1); // [['a'], ['b'], ['c']]
```

---
name: "compareVersion"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "通用"
summary: "介绍字符串处理、对象属性获取、数组分组、版本比较及类型判断等通用基础工具方法。"
questions:
  - "partition函数如何将字符串按指定长度分割成数组？partition('1234567',3)结果是什么？"
  - "get函数如何安全地获取对象的深层属性值？与lodash.get有什么相似之处？"
  - "pick和omit函数分别如何从对象中选取或排除指定属性？"
  - "chunk函数如何将数组按指定大小分割成多个子数组？"
  - "compareVersion函数如何比较两个版本号的大小？返回值1、-1、0分别代表什么？"
  - "toFixed和toFilled函数在字符串超长时的处理逻辑有什么不同？"
  - "isObject、isArray等类型判断函数在面板开发中有哪些典型使用场景？"
  - "isNil函数判断的是null还是undefined？还是两者都包含？"
  - "get函数的defaultValue参数在属性路径不存在时如何生效？"
  - "如何从@ray-js/panel-sdk的utils中引入partition、get等通用工具函数？"
---
### compareVersion

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

比较两个语义化版本号字符串的大小

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `v1` | `string` | 是 | 第一个版本号字符串，如 '1.2.3' |
| `v2` | `string` | 是 | 第二个版本号字符串，如 '1.2.4' |

#### 返回值

类型: `false \| 0 \| 1 \| -1`

1 表示 v1 大于 v2，-1 表示 v1 小于 v2，0 表示相等，false 表示参数无效

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { compareVersion } = utils;

compareVersion('1.2.3', '1.2.4'); // -1
compareVersion('2.0.0', '1.9.9'); // 1
compareVersion('1.0.0', '1.0.0'); // 0
compareVersion(null, '1.0.0');    // false
```
### toFixedString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数字转换为指定长度的字符串，不足时前补零，超出时从右侧截取

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 需要转换的数字 |
| `count` | `number` | 是 | 目标字符串的固定长度 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { toFixedString } = utils;

toFixedString(111, 5);  // '00111'
toFixedString(-42, 4);  // '-0042'
toFixedString(123456, 3); // '456'
```

---
name: "toFilledString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### toFilledString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数字转换为指定最小长度的字符串，不足时前补零，超出时保持原样

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 需要转换的数字 |
| `count` | `number` | 是 | 目标字符串的最小长度 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { toFilledString } = utils;

toFilledString(111, 5);      // '00111'
toFilledString(-1111111, 5); // '-1111111'
toFilledString(42, 4);       // '0042'
```

---
name: "bytesToHexString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### bytesToHexString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将字节数组转换为十六进制字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bytes` | `number[]` | 是 | 字节数组，每个元素为 0-255 的整数 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { bytesToHexString } = utils;

bytesToHexString([1, 2]);   // '0102'
bytesToHexString([23, 2]);  // '1702'
bytesToHexString([255, 0]); // 'ff00'
```

---
name: "numToByteNumbers"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### numToByteNumbers

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 适用于非负整数。返回结果采用大端序，例如 256 会转换为 [1, 0]。

#### 描述

将十进制整数转换为大端字节数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 需要转换的十进制整数 |
| `bytes` | `number` | 否 | 最小字节数，默认为 2；当结果不足该长度时会在高位补 0 |

#### 返回值

类型: `number[]`

对应的字节数组，高位在前；若数值超过 bytes 指定的宽度，不会截断

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { numToByteNumbers } = utils;

numToByteNumbers(111);      // [0, 111]
numToByteNumbers(1040001);  // [15, 222, 129]
numToByteNumbers(256, 2);   // [1, 0]
```

---
name: "intToHighLow"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### intToHighLow

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将整数拆分为高低字节数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 需要拆分的整数 |

#### 返回值

类型: `[number, number]`

包含 [高 8 位, 低 8 位] 的元组

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { intToHighLow } = utils;

intToHighLow(2838); // [11, 22]
intToHighLow(5643); // [22, 11]
intToHighLow(256);  // [1, 0]
```

---
name: "inMaxMin"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### inMaxMin

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数值限制在最小值和最大值之间

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `min` | `number` | 是 | 允许的最小值 |
| `max` | `number` | 是 | 允许的最大值 |
| `value` | `number` | 是 | 需要限制的值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { inMaxMin } = utils;

inMaxMin(1, 233, 2838); // 233（超过最大值，返回最大值）
inMaxMin(2, 0, 1);      // 1（在范围外但参数顺序注意 min < max）
inMaxMin(0, 100, 50);   // 50（在范围内，原样返回）
```

---
name: "scaleNumber"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### scaleNumber

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

按指定精度缩放数字并返回字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `scale` | `number` | 是 | 缩放精度，表示除以 10^scale 并保留 scale 位小数 |
| `value` | `number` | 是 | 需要缩放的数值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { scaleNumber } = utils;

scaleNumber(2, 10245); // '102.45'
scaleNumber(1, 1024);  // '102.4'
scaleNumber(0, 42);    // '42'
```

---
name: "range"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### range

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

生成指定范围的数字数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `start` | `number` | 是 | 起始值 |
| `end` | `number` | 是 | 结束值 |
| `step` | `number` | 否 | 步进值，默认为 1 |

#### 返回值

类型: `number[]`

从 start 到 end，步长为 step 的数组

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { range } = utils;

range(0, 3);      // [0, 1, 2]
range(1, 10, 3);  // [1, 4, 7]
range(0, -3, -1); // [0, -1, -2]
```

---
name: "calcPosition"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### calcPosition

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数值从一个范围线性映射到另一个范围

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `value` | `number` | 是 | 原始值 |
| `min` | `number` | 是 | 原始范围的最小值 |
| `max` | `number` | 是 | 原始范围的最大值 |
| `newMin` | `number` | 是 | 目标范围的最小值 |
| `newMax` | `number` | 是 | 目标范围的最大值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { calcPosition } = utils;

calcPosition(50, 0, 100, -100, 0);   // -50
calcPosition(255, 0, 255, 0, 100);   // 100
calcPosition(127.5, 0, 255, 0, 100); // 50
```

---
name: "calcPercent"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### calcPercent

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

计算数值在指定范围内的百分比

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `min` | `number` | 是 | 范围最小值 |
| `max` | `number` | 是 | 范围最大值 |
| `value` | `number` | 是 | 需要计算百分比的值，会被限制在 [min, max] 内 |
| `offset` | `number` | 否 | 百分比起始偏移量（0-1），默认为 0 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { calcPercent } = utils;

calcPercent(0, 100, 50);       // 0.5
calcPercent(25, 255, 25);      // 0
calcPercent(25, 255, 25, 0.1); // 0.1（带偏移量）
```

---
name: "getBitValue"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### getBitValue

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

获取数字在二进制表示中指定位置的位值

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 源数字 |
| `idx` | `number` | 是 | 位索引（从低位开始，0 为最低位） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { getBitValue } = utils;

// 17 = 10001(2)
getBitValue(17, 0); // 1
getBitValue(17, 1); // 0
getBitValue(17, 4); // 1
```

---
name: "changeBitValue"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### changeBitValue

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

翻转数字在二进制表示中指定位置的位值（0 变 1，1 变 0）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 源数字 |
| `idx` | `number` | 是 | 位索引（从低位开始，0 为最低位） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { changeBitValue } = utils;

// 17 = 10001(2)
changeBitValue(17, 0); // 16 (10000)
changeBitValue(17, 1); // 19 (10011)
changeBitValue(17, 4); // 1  (00001)
```

---
name: "setBitValueWithOne"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### setBitValueWithOne

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数字在二进制表示中指定位置的位值设为 1

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 源数字 |
| `idx` | `number` | 是 | 位索引（从低位开始，0 为最低位） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { setBitValueWithOne } = utils;

// 17 = 10001(2)
setBitValueWithOne(17, 0); // 17 (10001)，原本就是 1
setBitValueWithOne(17, 1); // 19 (10011)
setBitValueWithOne(17, 5); // 49 (110001)
```

---
name: "setBitValueWithZero"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### setBitValueWithZero

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将数字在二进制表示中指定位置的位值设为 0

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 源数字 |
| `idx` | `number` | 是 | 位索引（从低位开始，0 为最低位） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { setBitValueWithZero } = utils;

// 17 = 10001(2)
setBitValueWithZero(17, 0); // 16 (10000)
setBitValueWithZero(17, 1); // 17 (10001)，原本就是 0
setBitValueWithZero(17, 4); // 1  (00001)
```

---
name: "numToHexString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### numToHexString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将十进制数字转换为指定长度的十六进制字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `num` | `number` | 是 | 需要转换的十进制数字 |
| `padding` | `number` | 否 | 十六进制字符串的最小长度，默认为 2，不足前补零 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { numToHexString } = utils;

numToHexString(111);    // '6f'
numToHexString(15);     // '0f'
numToHexString(255, 4); // '00ff'
```

---
name: "highLowToInt"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### highLowToInt

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将高低字节合并为一个整数

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `high` | `number` | 是 | 高 8 位字节值 |
| `low` | `number` | 是 | 低 8 位字节值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { highLowToInt } = utils;

highLowToInt(11, 22); // 2838
highLowToInt(22, 11); // 5643
highLowToInt(1, 0);   // 256
```

---
name: "add"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### add

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 通过先乘以 10 的 n 次方转为整数运算，再除回来，避免 JavaScript 浮点数精度丢失。

#### 描述

精确计算两数相加，避免浮点数精度问题

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `number1` | `number` | 是 | 第一个加数 |
| `number2` | `number` | 是 | 第二个加数 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { add } = utils;

add(0.1, 0.2);   // 0.3（而非 0.30000000000000004）
add(1.005, 0.01); // 1.015
```

---
name: "subtract"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "数值"
summary: "介绍高低位转换、位操作、范围映射、浮点精度处理及进制转换等数值计算工具。"
questions:
  - "highLowToInt函数如何将高8位和低8位合并为一个整数？highLowToInt(11,22)的结果是什么？"
  - "getBitValue和changeBitValue函数如何操作指定位置的位值？"
  - "calcPosition函数如何将原范围的值映射到新范围？如将0-100映射到-100-0"
  - "bytesToHexString函数如何将八位整数数组转换为十六进制字符串？"
  - "add和subtract函数如何解决JavaScript浮点数精度问题？"
  - "scaleNumber函数的num参数代表10的几次幂？scaleNumber(2,10245)结果是什么？"
  - "toFixedString和toFilledString函数在字符串超长时的行为有什么区别？"
  - "setBitValueWithOne和setBitValueWithZero函数分别在什么场景下使用？"
  - "range函数如何生成指定步长的数组？range(1,10,2)的结果是什么？"
  - "calcPercent函数的offset参数有什么作用？如何控制百分比起始偏移量？"
---
### subtract

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 通过先乘以 10 的 n 次方转为整数运算，再除回来，避免 JavaScript 浮点数精度丢失。

#### 描述

精确计算两数相减，避免浮点数精度问题

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `number1` | `number` | 是 | 被减数 |
| `number2` | `number` | 是 | 减数 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { subtract } = utils;

subtract(0.3, 0.1);   // 0.2（而非 0.19999999999999998）
subtract(1.005, 0.01); // 0.995
```
### hsv2rgb

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将 HSV 颜色值转换为 RGB 颜色模式

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `h` | `number` | 是 | 色相值（0-360） |
| `s` | `number` | 是 | 饱和度（0-100） |
| `v` | `number` | 是 | 明度（0-100） |
| `a` | `number` | 否 | 可选的 alpha 透明度值（0-1） |

#### 返回值

类型: `number[]`

RGB 数组 [r, g, b]，每个通道值范围 0-255

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hsv2rgb } = utils;

hsv2rgb(0, 100, 100);   // [255, 0, 0]  红色
hsv2rgb(120, 100, 100);  // [0, 255, 0]  绿色
hsv2rgb(240, 100, 100);  // [0, 0, 255]  蓝色
```

---
name: "rgb2hsv"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### rgb2hsv

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将 RGB 颜色值转换为 HSV 颜色模式

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `r` | `number` | 是 | 红色通道值（0-255） |
| `g` | `number` | 是 | 绿色通道值（0-255） |
| `b` | `number` | 是 | 蓝色通道值（0-255） |

#### 返回值

类型: `number[]`

HSV 数组 [h, s, v]，其中 h 为色相（0-360），s 为饱和度（0-100），v 为明度（0-100）

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rgb2hsv } = utils;

rgb2hsv(255, 0, 0);   // [0, 100, 100]  红色
rgb2hsv(0, 255, 0);   // [120, 100, 100] 绿色
rgb2hsv(128, 128, 128); // [0, 0, 50]    灰色
```

---
name: "hex2hsv"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### hex2hsv

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将十六进制颜色值转换为 HSV 颜色模式

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `hex` | `string` | 是 | 十六进制颜色字符串，如 '#FF0000' 或 'FF0000' |

#### 返回值

类型: `number[]`

HSV 数组 [h, s, v]，其中 h 为色相（0-360），s 为饱和度（0-100），v 为明度（0-100）

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hex2hsv } = utils;

hex2hsv('#FF0000'); // [0, 100, 100]
hex2hsv('#00FF00'); // [120, 100, 100]
```

---
name: "hex2rgbString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### hex2rgbString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将十六进制颜色值转换为 CSS RGB/RGBA 颜色字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `hex` | `string` | 是 | 十六进制颜色字符串，如 '#FF0000' 或 'FF0000' |
| `a` | `number` | 否 | 可选的 alpha 透明度值（0-1） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hex2rgbString } = utils;

hex2rgbString('#FF0000');       // 'rgb(255, 0, 0)'
hex2rgbString('#FF0000', 0.5); // 'rgba(255, 0, 0, 0.5)'
```

---
name: "hsv2rgbString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### hsv2rgbString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将 HSV 颜色值转换为 CSS RGB/RGBA 颜色字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `h` | `number` | 是 | 色相值（0-360） |
| `s` | `number` | 是 | 饱和度（0-100） |
| `v` | `number` | 是 | 明度（0-100） |
| `a` | `number` | 否 | 可选的 alpha 透明度值（0-1） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hsv2rgbString } = utils;

hsv2rgbString(0, 100, 100);      // 'rgb(255, 0, 0)'
hsv2rgbString(120, 100, 100, 0.8); // 'rgba(0, 255, 0, 0.8)'
```

---
name: "brightKelvin2rgb"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### brightKelvin2rgb

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 常用于照明设备面板，将设备上报的亮度和色温 DP 值转换为可显示的颜色。

#### 描述

将亮度和色温值转换为 RGB 颜色字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bright` | `any` | 否 | 亮度值，范围 1-1000 |
| `temperature` | `any` | 否 | 色温值，范围 0-1000 |
| `kelvinRange` | `Object` | 否 | 可选色温范围配置，kelvinMin 默认 2200，kelvinMax 默认 6500 |

###### brightKelvin2rgb.kelvinRange 的属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `kelvinMin` | `number` | 否 | - |  |
| `kelvinMax` | `number` | 否 | - |  |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { brightKelvin2rgb } = utils;

const color = brightKelvin2rgb(1000, 1000); // 最高亮度、最高色温
const warm = brightKelvin2rgb(500, 0);      // 中等亮度、最低色温（暖光）
const custom = brightKelvin2rgb(800, 500, { kelvinMin: 2700, kelvinMax: 6500 });
```

---
name: "rgb2RgbString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### rgb2RgbString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 当传入 4 元素数组时自动使用 rgba 格式；当传入 3 元素数组并提供 a 参数时也使用 rgba 格式。

#### 描述

将 RGB 数值数组转换为 CSS 颜色字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `originRgb` | `number[]` | 是 | RGB �� RGBA 数值数组，如 [255, 0, 0] 或 [255, 0, 0, 0.5] |
| `a` | `number` | 否 | 可选的 alpha 透明度值（0-1），当数组为 3 元素时有效 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rgb2RgbString } = utils;

rgb2RgbString([255, 0, 0]);       // 'rgb(255, 0, 0)'
rgb2RgbString([255, 0, 0], 0.5);  // 'rgba(255, 0, 0, 0.5)'
rgb2RgbString([255, 0, 0, 0.8]);  // 'rgba(255, 0, 0, 0.8)'
```

---
name: "kelvin2rgb"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### kelvin2rgb

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 基于黑体辐射的曲线拟合算法，适用于照片处理等非高精度场景。精度在 1000K 到 40000K 之间最佳。

#### 描述

将开尔文色温值转换为 RGB 颜色数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `kelvin` | `number` | 是 | 开尔文色温值（建议范围 1000K - 40000K） |

#### 返回值

类型: `number[]`

RGB 颜色值数组 [r, g, b]，每个通道值范围 0-255

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { kelvin2rgb } = utils;

const rgb = kelvin2rgb(6500); // 日光色温，接近 [255, 249.574170569891, 254.30625501058964]
const warm = kelvin2rgb(2700); // 暖白色温
```

---
name: "rgb2kelvin"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### rgb2kelvin

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 通过二分查找法将 RGB 颜色映射回近似的开尔文色温。

#### 描述

将 RGB 颜色值转换为开尔文色温值

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `rgb` | `number[]` | 是 | RGB 颜色值数组 [r, g, b] |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rgb2kelvin } = utils;

const kelvin = rgb2kelvin([255, 255, 255]); // 约 6524
```

---
name: "rgb2hsb"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### rgb2hsb

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 HSB 与 HSV 是同一颜色模型的不同名称，功能完全相同。

#### 描述

将 RGB 颜色值转换为 HSB 颜色模式

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `r` | `number` | 是 | 红色通道值（0-255） |
| `g` | `number` | 是 | 绿色通道值（0-255） |
| `b` | `number` | 是 | 蓝色通道值（0-255） |

#### 返回值

类型: `number[]`

HSB 数组 [h, s, b]，等同于 HSV 模式

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rgb2hsb } = utils;

rgb2hsb(255, 0, 0); // [0, 100, 100]
```

---
name: "rgb2hex"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "颜色"
summary: "介绍 HSV、RGB、HEX、Kelvin 等颜色模式互转及亮度色温相关工具函数，适用于照明类面板开发。"
questions:
  - "hsv2rgb函数的参数h、s、v的取值范围分别是什么？与旧版hsvToRgb有什么区别？"
  - "rgb2hsv从旧版rgbToHsv迁移时返回值格式有什么变化？s和v的范围如何不同？"
  - "brightKelvin2rgb函数如何根据亮度和色温值生成RGB颜色？kelvinMin和kelvinMax参数的作用？"
  - "kelvin2rgb和rgb2kelvin函数如何实现Kelvin色温值与RGB颜色的互转？"
  - "hex2hsv函数如何将十六进制颜色值转换为HSV模式？hex2hsv('#FF00FF')的结果是什么？"
  - "hex2rgbString函数的alpha参数如何控制输出rgb还是rgba格式？"
  - "rgb2hex函数如何将RGB值转换为十六进制颜色字符串？rgb2hex(255,0,0)返回什么？"
  - "从@ray-js/ray-panel-utils的ColorUtils迁移到@ray-js/panel-sdk需要注意哪些参数和返回值变化？"
  - "hsv2rgbString函数如何将HSV颜色值直接转换为rgba字符串？"
  - "颜色转换工具在照明类面板开发中如何处理彩光和白光模式的颜色数据？"
---
### rgb2hex

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将 RGB 颜色值转换为十六进制颜色字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `r` | `number` | 是 | 红色通道值（0-255） |
| `g` | `number` | 是 | 绿色通道值（0-255） |
| `b` | `number` | 是 | 蓝色通道值（0-255） |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rgb2hex } = utils;

rgb2hex(255, 0, 0); // '#FF0000'
rgb2hex(0, 255, 0); // '#00FF00'
```
### f2c

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将华氏温度���换为摄氏温度

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `f` | `number` | 是 | 华氏温度值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { f2c } = utils;

f2c(32);  // 0
f2c(212); // 100
f2c(99);  // 37
```

---
name: "c2f"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "温度"
summary: "介绍华氏与摄氏温度互转工具 f2c 和 c2f，适用于温控类设备面板开发。"
questions:
  - "f2c函数如何将华氏温度转换为摄氏温度？转换后的结果是否取整？"
  - "c2f函数将100摄氏度转换为华氏度的结果是多少？"
  - "如何从@ray-js/panel-sdk的utils中引入f2c和c2f温度转换函数？"
  - "f2c(100)的返回值是38，其转换公式是什么？"
  - "温度转换工具在温控类设备面板开发中有哪些典型应用场景？"
  - "f2c和c2f函数的返回值精度如何？是浮点数还是取整后的整数？"
  - "温度工具函数在多国家地区的温度单位切换中如何使用？"
  - "c2f函数的参数cel是什么数据类型？是否支持负数温度转换？"
  - "温度转换工具适用于哪些品类的设备面板？如温湿度传感器、空调等"
  - "如何结合温度转换工具实现面板上摄氏和华氏温度的自动切换？"
---
### c2f

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将摄氏温度转换为华氏温度

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `c` | `number` | 是 | 摄氏温度值 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { c2f } = utils;

c2f(0);   // 32
c2f(100); // 212
c2f(37);  // 99
```
### parseSecond

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将秒数解析为 [时, 分, 秒] 的字符串数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `t` | `number` | 是 | 总秒数 |

#### 返回值

类型: `string[]`

包含三个两位字符串的数组，分别表示 [小时, 分钟, 秒]

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { parseSecond } = utils;

parseSecond(111);     // ['00', '01', '51']
parseSecond(3661);    // ['01', '01', '01']
parseSecond(3333333); // ['25', '55', '33']
```

---
name: "parseHour12"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "时间"
summary: "介绍秒数转换、时分秒解析、日期格式化及时区查询等时间处理工具。"
questions:
  - "parseSecond函数如何将秒数转化为时分秒的字符串数组？num参数有什么作用？"
  - "parseHour12函数如何将秒数转换为12小时制的时间字符串？返回格式是什么？"
  - "stringToSecond函数如何将"11:30"或"22:11:30"格式的时间字符串转换为秒数？"
  - "dateToTimer函数如何将"20110801"格式的日期字符串转换为Unix时间戳？"
  - "dateFormat函数支持哪些格式化占位符？如yyyy、MM、dd、hh、mm、ss等"
  - "timezone函数返回的时区格式是什么？例如"+08:00"代表什么时区？"
  - "如何从@ray-js/panel-sdk的utils中引入parseSecond等时间工具函数？"
  - "dateFormat函数中季度(q)和毫秒(S)的占位符分别支持几个字符？"
  - "parseSecond(111)的返回结果是什么？每个数组元素代表什么含义？"
  - "时间工具函数在面板定时功能开发中有哪些典型应用场景？"
---
### parseHour12

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将秒数格式化为 12 小时制时间字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `second` | `number` | 是 | 总秒数，超过一天（86400 秒）的部分会取余 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { parseHour12 } = utils;

parseHour12(111);     // '12:01 AM'
parseHour12(3333333); // '01:55 PM'
parseHour12(43200);   // '12:00 PM'
```

---
name: "stringToSecond"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "时间"
summary: "介绍秒数转换、时分秒解析、日期格式化及时区查询等时间处理工具。"
questions:
  - "parseSecond函数如何将秒数转化为时分秒的字符串数组？num参数有什么作用？"
  - "parseHour12函数如何将秒数转换为12小时制的时间字符串？返回格式是什么？"
  - "stringToSecond函数如何将"11:30"或"22:11:30"格式的时间字符串转换为秒数？"
  - "dateToTimer函数如何将"20110801"格式的日期字符串转换为Unix时间戳？"
  - "dateFormat函数支持哪些格式化占位符？如yyyy、MM、dd、hh、mm、ss等"
  - "timezone函数返回的时区格式是什么？例如"+08:00"代表什么时区？"
  - "如何从@ray-js/panel-sdk的utils中引入parseSecond等时间工具函数？"
  - "dateFormat函数中季度(q)和毫秒(S)的占位符分别支持几个字符？"
  - "parseSecond(111)的返回结果是什么？每个数组元素代表什么含义？"
  - "时间工具函数在面板定时功能开发中有哪些典型应用场景？"
---
### stringToSecond

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将时间字符串解析为总秒数

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeStr` | `string` | 是 | 冒号分隔的时间字符串，支持 'HH:MM' 或 'HH:MM:SS' 格式 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { stringToSecond } = utils;

stringToSecond('11:30');    // 690
stringToSecond('22:11:30'); // 79890
stringToSecond('01:00');    // 60
```

---
name: "dateToTimer"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "时间"
summary: "介绍秒数转换、时分秒解析、日期格式化及时区查询等时间处理工具。"
questions:
  - "parseSecond函数如何将秒数转化为时分秒的字符串数组？num参数有什么作用？"
  - "parseHour12函数如何将秒数转换为12小时制的时间字符串？返回格式是什么？"
  - "stringToSecond函数如何将"11:30"或"22:11:30"格式的时间字符串转换为秒数？"
  - "dateToTimer函数如何将"20110801"格式的日期字符串转换为Unix时间戳？"
  - "dateFormat函数支持哪些格式化占位符？如yyyy、MM、dd、hh、mm、ss等"
  - "timezone函数返回的时区格式是什么？例如"+08:00"代表什么时区？"
  - "如何从@ray-js/panel-sdk的utils中引入parseSecond等时间工具函数？"
  - "dateFormat函数中季度(q)和毫秒(S)的占位符分别支持几个字符？"
  - "parseSecond(111)的返回结果是什么？每个数组元素代表什么含义？"
  - "时间工具函数在面板定时功能开发中有哪些典型应用场景？"
---
### dateToTimer

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将日期字符串转换为 Unix 时间戳（秒）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dateString` | `string` | 是 | 日期字符串，格式为 'YYYYMMDD' 或 'YYYYMMDD HH:MM:SS' |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { dateToTimer } = utils;

dateToTimer('20110801');          // 1312128000（取决于时区）
dateToTimer('20110801 12:11:11'); // 1312171871（取决于时区）
```

---
name: "dateFormat"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "时间"
summary: "介绍秒数转换、时分秒解析、日期格式化及时区查询等时间处理工具。"
questions:
  - "parseSecond函数如何将秒数转化为时分秒的字符串数组？num参数有什么作用？"
  - "parseHour12函数如何将秒数转换为12小时制的时间字符串？返回格式是什么？"
  - "stringToSecond函数如何将"11:30"或"22:11:30"格式的时间字符串转换为秒数？"
  - "dateToTimer函数如何将"20110801"格式的日期字符串转换为Unix时间戳？"
  - "dateFormat函数支持哪些格式化占位符？如yyyy、MM、dd、hh、mm、ss等"
  - "timezone函数返回的时区格式是什么？例如"+08:00"代表什么时区？"
  - "如何从@ray-js/panel-sdk的utils中引入parseSecond等时间工具函数？"
  - "dateFormat函数中季度(q)和毫秒(S)的占位符分别支持几个字符？"
  - "parseSecond(111)的返回结果是什么？每个数组元素代表什么含义？"
  - "时间工具函数在面板定时功能开发中有哪些典型应用场景？"
---
### dateFormat

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可用 1-2 个占位符；年(y) 可用 1-4 个占位符；毫秒(S) 只能用 1 个占位符。

#### 描述

将 Date 对象格式化为指定格式的日期字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fmt` | `string` | 是 | 格式化模板字符串，支持 y(年)、M(月)、d(日)、h(时)、m(分)、s(秒)、q(季度)、S(毫秒) 占位符 |
| `date` | `Date` | 是 | 要格式化的 Date 对象 |

###### Date

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `toString` | `() => string` | 是 | - | Returns a string representation of a date. The format of the string depends on the locale. |
| `toDateString` | `() => string` | 是 | - | Returns a date as a string value. |
| `toTimeString` | `() => string` | 是 | - | Returns a time as a string value. |
| `toLocaleString` | `1. () => string<br>2. (locales: string \| string[], options: DateTimeFormatOptions) => string<br>3. (locales: string \| Locale \| ReadonlyArray \| undefined, options: DateTimeFormatOptions) => string` | 是 | - | Returns a value as a string value appropriate to the host environment's current locale. |
| `toLocaleDateString` | `1. () => string<br>2. (locales: string \| string[], options: DateTimeFormatOptions) => string<br>3. (locales: string \| Locale \| ReadonlyArray \| undefined, options: DateTimeFormatOptions) => string` | 是 | - | Returns a date as a string value appropriate to the host environment's current locale. |
| `toLocaleTimeString` | `1. () => string<br>2. (locales: string \| string[], options: DateTimeFormatOptions) => string<br>3. (locales: string \| Locale \| ReadonlyArray \| undefined, options: DateTimeFormatOptions) => string` | 是 | - | Returns a time as a string value appropriate to the host environment's current locale. |
| `valueOf` | `() => number` | 是 | - | Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. |
| `getTime` | `() => number` | 是 | - | Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. |
| `getFullYear` | `() => number` | 是 | - | Gets the year, using local time. |
| `getUTCFullYear` | `() => number` | 是 | - | Gets the year using Universal Coordinated Time (UTC). |
| `getMonth` | `() => number` | 是 | - | Gets the month, using local time. |
| `getUTCMonth` | `() => number` | 是 | - | Gets the month of a Date object using Universal Coordinated Time (UTC). |
| `getDate` | `() => number` | 是 | - | Gets the day-of-the-month, using local time. |
| `getUTCDate` | `() => number` | 是 | - | Gets the day-of-the-month, using Universal Coordinated Time (UTC). |
| `getDay` | `() => number` | 是 | - | Gets the day of the week, using local time. |
| `getUTCDay` | `() => number` | 是 | - | Gets the day of the week using Universal Coordinated Time (UTC). |
| `getHours` | `() => number` | 是 | - | Gets the hours in a date, using local time. |
| `getUTCHours` | `() => number` | 是 | - | Gets the hours value in a Date object using Universal Coordinated Time (UTC). |
| `getMinutes` | `() => number` | 是 | - | Gets the minutes of a Date object, using local time. |
| `getUTCMinutes` | `() => number` | 是 | - | Gets the minutes of a Date object using Universal Coordinated Time (UTC). |
| `getSeconds` | `() => number` | 是 | - | Gets the seconds of a Date object, using local time. |
| `getUTCSeconds` | `() => number` | 是 | - | Gets the seconds of a Date object using Universal Coordinated Time (UTC). |
| `getMilliseconds` | `() => number` | 是 | - | Gets the milliseconds of a Date, using local time. |
| `getUTCMilliseconds` | `() => number` | 是 | - | Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). |
| `getTimezoneOffset` | `() => number` | 是 | - | Gets the difference in minutes between Universal Coordinated Time (UTC) and the time on the local computer. |
| `setTime` | `(time: number) => number` | 是 | - | Sets the date and time value in the Date object. |
| `setMilliseconds` | `(ms: number) => number` | 是 | - | Sets the milliseconds value in the Date object using local time. |
| `setUTCMilliseconds` | `(ms: number) => number` | 是 | - | Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC). |
| `setSeconds` | `(sec: number, ms: number) => number` | 是 | - | Sets the seconds value in the Date object using local time. |
| `setUTCSeconds` | `(sec: number, ms: number) => number` | 是 | - | Sets the seconds value in the Date object using Universal Coordinated Time (UTC). |
| `setMinutes` | `(min: number, sec: number, ms: number) => number` | 是 | - | Sets the minutes value in the Date object using local time. |
| `setUTCMinutes` | `(min: number, sec: number, ms: number) => number` | 是 | - | Sets the minutes value in the Date object using Universal Coordinated Time (UTC). |
| `setHours` | `(hours: number, min: number, sec: number, ms: number) => number` | 是 | - | Sets the hour value in the Date object using local time. |
| `setUTCHours` | `(hours: number, min: number, sec: number, ms: number) => number` | 是 | - | Sets the hours value in the Date object using Universal Coordinated Time (UTC). |
| `setDate` | `(date: number) => number` | 是 | - | Sets the numeric day-of-the-month value of the Date object using local time. |
| `setUTCDate` | `(date: number) => number` | 是 | - | Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC). |
| `setMonth` | `(month: number, date: number) => number` | 是 | - | Sets the month value in the Date object using local time. |
| `setUTCMonth` | `(month: number, date: number) => number` | 是 | - | Sets the month value in the Date object using Universal Coordinated Time (UTC). |
| `setFullYear` | `(year: number, month: number, date: number) => number` | 是 | - | Sets the year of the Date object using local time. |
| `setUTCFullYear` | `(year: number, month: number, date: number) => number` | 是 | - | Sets the year value in the Date object using Universal Coordinated Time (UTC). |
| `toUTCString` | `() => string` | 是 | - | Returns a date converted to a string using Universal Coordinated Time (UTC). |
| `toISOString` | `() => string` | 是 | - | Returns a date as a string value in ISO format. |
| `toJSON` | `(key: any) => string` | 是 | - | Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. |
| `getVarDate` | `() => VarDate` | 是 | - |  |
| `__@toPrimitive@1072` | `1. (hint: "default") => string<br>2. (hint: "string") => string<br>3. (hint: "number") => number<br>4. (hint: string) => string \| number` | 是 | - | Converts a Date object to a string. |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { dateFormat } = utils;

const date = new Date('2026-07-02 08:09:04.423');
dateFormat('yyyy-MM-dd hh:mm:ss.S', date); // '2026-07-02 08:09:04.423'
dateFormat('yyyy-M-d h:m:s.S', date);      // '2026-7-2 8:9:4.423'
dateFormat('MM/dd/yyyy', date);             // '07/02/2026'
```

---
name: "timezone"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "时间"
summary: "介绍秒数转换、时分秒解析、日期格式化及时区查询等时间处理工具。"
questions:
  - "parseSecond函数如何将秒数转化为时分秒的字符串数组？num参数有什么作用？"
  - "parseHour12函数如何将秒数转换为12小时制的时间字符串？返回格式是什么？"
  - "stringToSecond函数如何将"11:30"或"22:11:30"格式的时间字符串转换为秒数？"
  - "dateToTimer函数如何将"20110801"格式的日期字符串转换为Unix时间戳？"
  - "dateFormat函数支持哪些格式化占位符？如yyyy、MM、dd、hh、mm、ss等"
  - "timezone函数返回的时区格式是什么？例如"+08:00"代表什么时区？"
  - "如何从@ray-js/panel-sdk的utils中引入parseSecond等时间工具函数？"
  - "dateFormat函数中季度(q)和毫秒(S)的占位符分别支持几个字符？"
  - "parseSecond(111)的返回结果是什么？每个数组元素代表什么含义？"
  - "时间工具函数在面板定时功能开发中有哪些典型应用场景？"
---
### timezone

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

获取当前系统时区偏移字符串

#### 参数

无

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { timezone } = utils;

const tz = timezone(); // 例如 '+08:00'（中国标准时间）
```
### hexStringToNumber

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 等同于原来的 hexToBytes，每两个十六进制字符作为一组转换为对应的十进制数字。

#### 描述

将十六进制字符串转换为数字数组

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bits` | `string` | 是 | 十六进制字符串，如 'AD03' |

#### 返回值

类型: `number[]`

每两位十六进制字符解析后的数字数组

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hexStringToNumber } = utils;

hexStringToNumber('AD03'); // [173, 3]
hexStringToNumber('FF00'); // [255, 0]
```

---
name: "hexStringToBinString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "字符串"
summary: "介绍十六进制与整型数组、二进制互转、驼峰命名及二进制转十六进制等字符串处理工具。"
questions:
  - "hexStringToNumber函数如何将十六进制字符串"AD03"转换为整型数组？"
  - "hexStringToBinString函数将"A7B9"转换为二进制字符串的结果是什么？"
  - "camelize函数如何将"abb_aa-cc"这类下划线和中划线格式转换为驼峰命名？"
  - "strToHexString函数如何从包含二进制字符的字符串中提取并转换为十六进制？"
  - "hexStringToNumber的返回结果是一个数组，每个元素代表什么含义？"
  - "如何从@ray-js/panel-sdk的utils中引入hexStringToNumber等字符串工具？"
  - "strToHexString函数中match(/[01]{4}/g)的正则匹配规则是什么？"
  - "hexStringToBinString在处理设备协议数据解析中有哪些典型应用场景？"
  - "camelize函数能否处理包含多个连续分隔符的字符串？"
  - "字符串工具函数在解析设备raw类型DP数据时如何使用？"
---
### hexStringToBinString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将十六进制字符串转换为二进制字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `hexString` | `string` | 是 | 十六进制字符串，如 'A7B9' |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hexStringToBinString } = utils;

hexStringToBinString('A7B9'); // '1010011110111001'
hexStringToBinString('0709'); // '0000011100001001'
```

---
name: "camelize"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "字符串"
summary: "介绍十六进制与整型数组、二进制互转、驼峰命名及二进制转十六进制等字符串处理工具。"
questions:
  - "hexStringToNumber函数如何将十六进制字符串"AD03"转换为整型数组？"
  - "hexStringToBinString函数将"A7B9"转换为二进制字符串的结果是什么？"
  - "camelize函数如何将"abb_aa-cc"这类下划线和中划线格式转换为驼峰命名？"
  - "strToHexString函数如何从包含二进制字符的字符串中提取并转换为十六进制？"
  - "hexStringToNumber的返回结果是一个数组，每个元素代表什么含义？"
  - "如何从@ray-js/panel-sdk的utils中引入hexStringToNumber等字符串工具？"
  - "strToHexString函数中match(/[01]{4}/g)的正则匹配规则是什么？"
  - "hexStringToBinString在处理设备协议数据解析中有哪些典型应用场景？"
  - "camelize函数能否处理包含多个连续分隔符的字符串？"
  - "字符串工具函数在解析设备raw类型DP数据时如何使用？"
---
### camelize

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 如果传入的是数字类型，会直接转为字符串返回。

#### 描述

将字符串转换为驼峰命名格式

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | 是 | 待转换的字符串，支持连字符、下划线或空格分隔 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { camelize } = utils;

camelize('background-color'); // 'backgroundColor'
camelize('font_size');        // 'fontSize'
camelize('hello world');      // 'helloWorld'
```

---
name: "strToHexString"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "字符串"
summary: "介绍十六进制与整型数组、二进制互转、驼峰命名及二进制转十六进制等字符串处理工具。"
questions:
  - "hexStringToNumber函数如何将十六进制字符串"AD03"转换为整型数组？"
  - "hexStringToBinString函数将"A7B9"转换为二进制字符串的结果是什么？"
  - "camelize函数如何将"abb_aa-cc"这类下划线和中划线格式转换为驼峰命名？"
  - "strToHexString函数如何从包含二进制字符的字符串中提取并转换为十六进制？"
  - "hexStringToNumber的返回结果是一个数组，每个元素代表什么含义？"
  - "如何从@ray-js/panel-sdk的utils中引入hexStringToNumber等字符串工具？"
  - "strToHexString函数中match(/[01]{4}/g)的正则匹配规则是什么？"
  - "hexStringToBinString在处理设备协议数据解析中有哪些典型应用场景？"
  - "camelize函数能否处理包含多个连续分隔符的字符串？"
  - "字符串工具函数在解析设备raw类型DP数据时如何使用？"
---
### strToHexString

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 该函数会从输入字符串中提取所有连续的 4 位二进制子串（仅由 0 和 1 组成），然后将每组转为一个十六进制字符。

#### 描述

从字符串中提取二进制片段并转换为十六进制字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | 是 | 包含 '0' 和 '1' 字符的字符串，可混合其他字符 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { strToHexString } = utils;

strToHexString('ababba0102hghg0011100'); // '3'
strToHexString('ababba0102hghg001110011000111'); // '398'
```
### base64ToRaw

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 常用于 DP 数据的解码转换，将 Base64 格式的 raw 型 DP 值还原为十六进制字符串。

#### 描述

将 Base64 编码字符串转换为十六进制原始字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | Base64 编码的字符串 |

#### 返回值

类型: `string`

对应的十六进制原始字符串，每字节两个字符

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { base64ToRaw } = utils;

base64ToRaw('SGVsbG8='); // '48656c6c6f'
base64ToRaw('/wA=');     // 'ff00'
```

---
name: "rawToBase64"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "转换"
summary: "介绍 base64、raw、十六进制、二进制等数据格式互转及 raw/string 型 DP 解析步进函数。"
questions:
  - "base64ToRaw函数如何将base64字符串转换为raw十六进制字符串？"
  - "rawToBase64函数将'6162636465'转换后的base64结果是什么？"
  - "hexToBinary函数如何将十六进制字符串转换为二进制字符串？"
  - "generateDpStrStep函数的步进机制是怎样的？如何使用step()逐步解析数据？"
  - "base64ToRaw('YWJjZGU=')的转换结果'6162636465'对应什么原始数据？"
  - "generateDpStrStep('3264')生成的步进函数首次调用step()返回什么值？"
  - "这些转换工具函数在处理设备raw类型或string类型DP数据时如何使用？"
  - "rawToBase64和base64ToRaw互为逆操作吗？数据是否能完全可逆转换？"
  - "hexToBinary('00F')的转换结果为什么是'1111'而不是'00001111'？"
  - "generateDpStrStep的step(2)参数2代表什么含义？如何控制每次读取的字节数？"
---
### rawToBase64

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 常用于 DP 数据的编码转换，将 raw 型 DP 值转为 Base64 格式进行传输。

#### 描述

将十六进制原始字符串转换为 Base64 编码字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 十六进制原始字符串，长度必须为偶数 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { rawToBase64 } = utils;

rawToBase64('48656c6c6f'); // 'SGVsbG8='
rawToBase64('ff00');       // '/wA='
rawToBase64('f');          // ''（奇数长度返回空字符串）
```

---
name: "hexToBinary"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "转换"
summary: "介绍 base64、raw、十六进制、二进制等数据格式互转及 raw/string 型 DP 解析步进函数。"
questions:
  - "base64ToRaw函数如何将base64字符串转换为raw十六进制字符串？"
  - "rawToBase64函数将'6162636465'转换后的base64结果是什么？"
  - "hexToBinary函数如何将十六进制字符串转换为二进制字符串？"
  - "generateDpStrStep函数的步进机制是怎样的？如何使用step()逐步解析数据？"
  - "base64ToRaw('YWJjZGU=')的转换结果'6162636465'对应什么原始数据？"
  - "generateDpStrStep('3264')生成的步进函数首次调用step()返回什么值？"
  - "这些转换工具函数在处理设备raw类型或string类型DP数据时如何使用？"
  - "rawToBase64和base64ToRaw互为逆操作吗？数据是否能完全可逆转换？"
  - "hexToBinary('00F')的转换结果为什么是'1111'而不是'00001111'？"
  - "generateDpStrStep的step(2)参数2代表什么含义？如何控制每次读取的字节数？"
---
### hexToBinary

> [VERSION] @ray-js/panel-sdk >= 1.0.0

#### 描述

将十六进制字符串转换为二进制字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 十六进制字符串 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { hexToBinary } = utils;

hexToBinary('ff'); // '11111111'
hexToBinary('0a'); // '1010'
hexToBinary('1');  // '1'
```

---
name: "generateDpStrStep"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "转换"
summary: "介绍 base64、raw、十六进制、二进制等数据格式互转及 raw/string 型 DP 解析步进函数。"
questions:
  - "base64ToRaw函数如何将base64字符串转换为raw十六进制字符串？"
  - "rawToBase64函数将'6162636465'转换后的base64结果是什么？"
  - "hexToBinary函数如何将十六进制字符串转换为二进制字符串？"
  - "generateDpStrStep函数的步进机制是怎样的？如何使用step()逐步解析数据？"
  - "base64ToRaw('YWJjZGU=')的转换结果'6162636465'对应什么原始数据？"
  - "generateDpStrStep('3264')生成的步进函数首次调用step()返回什么值？"
  - "这些转换工具函数在处理设备raw类型或string类型DP数据时如何使用？"
  - "rawToBase64和base64ToRaw互为逆操作吗？数据是否能完全可逆转换？"
  - "hexToBinary('00F')的转换结果为什么是'1111'而不是'00001111'？"
  - "generateDpStrStep的step(2)参数2代表什么含义？如何控制每次读取的字节数？"
---
### generateDpStrStep

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 内部使用生成器逐段读取十六进制字符串。默认每次读取 2 个字符（1 字节），可通过参数自定义。

#### 描述

创建 raw 型或 string 型 DP 的步进解析函数

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpStr` | `string` | 是 | 要解析的 DP 十六进制字符串 |

#### 返回值

类型: `(num: number, type: "string" \| "number") => __object`

步进解析函数，每次调用返回下一段解析结果 { value, done }

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { generateDpStrStep } = utils;

const step = generateDpStrStep('3264');
const val1 = step().value;  // 50  (0x32)
const val2 = step(2).value; // 100 (0x64)
```
### parseJSON

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 该函数不会抛出异常，解析失败时会静默返回原始字符串。适用于不确定输入是否为合法 JSON 的场景。

#### 描述

安全地将 JSON 字符串解析为对象

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | 是 | 需要解析的 JSON 字符串 |

#### 返回值

类型: `string \| Record<string, never>`

解析后的对象；若解析失败则返回原始字符串；若输入为 undefined 则返回空对象

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { parseJSON } = utils;

parseJSON('{"a":1}');  // { a: 1 }
parseJSON('not json'); // 'not json'
parseJSON(undefined);  // {}
```

---
name: "stringifyJSON"
mode: "api"
versionRequirements:
  - { name: "@ray-js/panel-sdk", version: "1.0.0" }
title: "JSON"
summary: "介绍 JSON 字符串解析与对象序列化工具 parseJSON 和 stringifyJSON 的用法。"
questions:
  - "parseJSON函数与原生JSON.parse有什么区别？解析失败时如何处理？"
  - "stringifyJSON函数如何将数据转换为JSON字符串？支持哪些数据类型？"
  - "如何从@ray-js/panel-sdk的utils中引入parseJSON和stringifyJSON？"
  - "parseJSON函数传入'{a:1, b:2}'格式的字符串能否正确解析？"
  - "stringifyJSON([1,2,3])的返回值是什么格式的字符串？"
  - "parseJSON在解析设备返回的JSON数据时相比原生方法有什么优势？"
  - "面板开发中哪些场景需要使用parseJSON解析设备数据？"
  - "stringifyJSON函数在存储设备配置数据时有哪些典型用法？"
  - "parseJSON函数是否能处理嵌套对象的JSON字符串？"
  - "JSON工具函数在处理raw类型DP数据转换中有什么作用？"
---
### stringifyJSON

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 该函数不会抛出异常，序列化失败时会返回原始数据的字符串形式。

#### 描述

将给定数据安全地序列化为 JSON 字符串

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `any` | 是 | 要序列化的数据，可以是任意类型 |

#### 返回值

无

#### 示例代码

##### 基础用法

```ts
import { utils } from '@ray-js/panel-sdk';

const { stringifyJSON } = utils;

stringifyJSON({ a: 1 }); // '{"a":1}'
stringifyJSON('hello');  // 'hello'
stringifyJSON(null);     // ''
stringifyJSON(undefined); // ''
```
