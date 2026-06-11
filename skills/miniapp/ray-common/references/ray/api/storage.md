# 数据缓存 (storage)

### setStorage

#### 功能描述

将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { setStorage } from '@ray-js/ray'
setStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.setStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                         |
| -------- | -------- | ------ | ---- | ---------------------------------------------------------------------------- |
| key      | string   |        | 是   | 本地缓存中指定的 key                                                         |
| data     | any      |        | 是   | 需要存储的内容。只支持原生类型、Date、及能够通过JSON.stringify序列化的对象。 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                       |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                       |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                             |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { setStorage } from '@ray-js/ray';
// 原生调用方式
const { setStorage } = ty;

// 存储字符串
setStorage({
  key: 'test',
  data: 'test',
  success: (res) => {
    console.log(res.data);
  },
  fail: (err) => {
    console.log(err);
  }
});

// 存储对象
setStorage({
  key: 'test',
  data: {
    name: 'test',
    age: 18
  },
  success: (res) => {
    console.log(res.data);
  },
  fail: (err) => {
    console.log(err);
  }
});
```

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10010  | storage json syntax error         |
### setStorageSync

#### 功能描述

将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。的同步版本

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { setStorageSync } from '@ray-js/ray'
setStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.setStorageSync({ ... })
```

#### 请求参数

**Object object**

| 属性 | 类型   | 默认值 | 必填 | 说明                                                                         |
| ---- | ------ | ------ | ---- | ---------------------------------------------------------------------------- |
| key  | string |        | 是   | 本地缓存中指定的 key                                                         |
| data | any    |        | 是   | 需要存储的内容。只支持原生类型、Date、及能够通过JSON.stringify序列化的对象。 |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { setStorageSync } from '@ray-js/ray';
// 原生调用方式
const { setStorageSync } = ty;

// 存储字符串
setStorageSync({
  key: 'test',
  data: 'test',
});

// 存储对象
setStorageSync({
  key: 'test',
  data: {
    name: 'test',
    age: 18
  },
});
```

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10010  | storage json syntax error         |
### getStorage

#### 功能描述

从本地缓存中异步获取指定 key 的内容

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getStorage } from '@ray-js/ray'
getStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.getStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| key      | string   |        | 是   | 本地缓存中指定的 key                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性 | 类型 | 说明           |
| ---- | ---- | -------------- |
| data | any  | key 对应的内容 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { getStorage } from '@ray-js/ray';
// 原生调用方式
const { getStorage } = ty;

getStorage({
  key: 'test',
  success: (res) => {
    console.log(res.data);
  },
  fail: (err) => {
    console.log(err);
  }
});
```

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
### getStorageSync

#### 功能描述

从本地缓存中异步获取指定 key 的内容的同步版本

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getStorageSync } from '@ray-js/ray'
getStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getStorageSync({ ... })
```

#### 请求参数

**Object object**

| 属性 | 类型   | 默认值 | 必填 | 说明                 |
| ---- | ------ | ------ | ---- | -------------------- |
| key  | string |        | 是   | 本地缓存中指定的 key |

#### 返回值

any：返回指定 key 对应的内容

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { getStorageSync } from '@ray-js/ray';
// 原生调用方式
const { getStorageSync } = ty;

const data = getStorageSync({
  key: 'test',
});
console.log(data);
```

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
### clearStorage

#### 功能描述

清理本地数据缓存

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { clearStorage } from '@ray-js/ray'
clearStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.clearStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
### clearStorageSync

#### 功能描述

清理本地数据缓存的同步版本

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { clearStorageSync } from '@ray-js/ray'
clearStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.clearStorageSync({ ... })
```
### removeStorage

#### 功能描述

清理本地数据缓存

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { removeStorage } from '@ray-js/ray'
removeStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.removeStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| key      | string   |        | 是   | 本地缓存中指定的 key                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
### removeStorageSync

#### 功能描述

清理本地数据缓存的同步版本

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { removeStorageSync } from '@ray-js/ray'
removeStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.removeStorageSync({ ... })
```

#### 请求参数

**Object object**

| 属性 | 类型   | 默认值 | 必填 | 说明                 |
| ---- | ------ | ------ | ---- | -------------------- |
| key  | string |        | 是   | 本地缓存中指定的 key |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
### getStorageInfo

#### 功能描述

异步获取当前 storage 的相关信息

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getStorageInfo } from '@ray-js/ray'
getStorageInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getStorageInfo({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性        | 类型     | 说明                        |
| ----------- | -------- | --------------------------- |
| keys        | string[] | 当前 storage 中所有的 key   |
| currentSize | number   | 当前占用的空间大小, 单位 kb |
| limitSize   | number   | 限制的空间大小，单位 kb     |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
### getStorageInfoSync

#### 功能描述

异步获取当前 storage 的相关信息的同步版本

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getStorageInfoSync } from '@ray-js/ray'
getStorageInfoSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getStorageInfoSync({ ... })
```

#### 返回值

| 属性        | 类型     | 说明                        |
| ----------- | -------- | --------------------------- |
| keys        | string[] | 当前 storage 中所有的 key   |
| currentSize | number   | 当前占用的空间大小, 单位 kb |
| limitSize   | number   | 限制的空间大小，单位 kb     |
### batchSetStorage

#### 功能描述

将数据批量存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { batchSetStorage } from '@ray-js/ray'
batchSetStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.batchSetStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型              | 默认值 | 必填 | 说明                                             |
| -------- | ----------------- | ------ | ---- | ------------------------------------------------ |
| kvList   | StorageDataBean[] |        | 是   | 批量存储的 key-value 列表                        |
| success  | function          |        | 否   | 接口调用成功的回调函数                           |
| fail     | function          |        | 否   | 接口调用失败的回调函数                           |
| complete | function          |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 引用对象

**StorageDataBean**

| 属性 | 类型   | 默认值 | 必填 | 说明                 |
| ---- | ------ | ------ | ---- | -------------------- |
| key  | string |        | 是   | 本地缓存中指定的 key |
| data | string |        | 是   | key 对应的内容       |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10010  | storage json syntax error         |
### batchSetStorageSync

#### 功能描述

将数据批量存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容。除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。的同步版本

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { batchSetStorageSync } from '@ray-js/ray'
batchSetStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.batchSetStorageSync({ ... })
```

#### 请求参数

**Object object**

| 属性   | 类型              | 默认值 | 必填 | 说明                      |
| ------ | ----------------- | ------ | ---- | ------------------------- |
| kvList | StorageDataBean[] |        | 是   | 批量存储的 key-value 列表 |

#### 引用对象

**StorageDataBean**

| 属性 | 类型   | 默认值 | 必填 | 说明                 |
| ---- | ------ | ------ | ---- | -------------------- |
| key  | string |        | 是   | 本地缓存中指定的 key |
| data | string |        | 是   | key 对应的内容       |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10010  | storage json syntax error         |
### batchGetStorage

#### 功能描述

从本地缓存中异步批量获取指定 key 的内容

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { batchGetStorage } from '@ray-js/ray'
batchGetStorage({ ... })
```

**原生小程序中使用**

```javascript
ty.batchGetStorage({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| keyList  | string[] |        | 是   | 批量获取的 key 列表                              |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性     | 类型     | 说明                      |
| -------- | -------- | ------------------------- |
| dataList | string[] | 批量获取的 key-value 列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
### batchGetStorageSync

#### 功能描述

从本地缓存中异步批量获取指定 key 的内容的同步版本

> 需引入`BaseKit`，且在`>=3.31.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { batchGetStorageSync } from '@ray-js/ray'
batchGetStorageSync({ ... })
```

**原生小程序中使用**

```javascript
ty.batchGetStorageSync({ ... })
```

#### 请求参数

**Object object**

| 属性    | 类型     | 默认值 | 必填 | 说明                |
| ------- | -------- | ------ | ---- | ------------------- |
| keyList | string[] |        | 是   | 批量获取的 key 列表 |

#### 返回值

| 属性     | 类型     | 说明                      |
| -------- | -------- | ------------------------- |
| dataList | string[] | 批量获取的 key-value 列表 |

#### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
