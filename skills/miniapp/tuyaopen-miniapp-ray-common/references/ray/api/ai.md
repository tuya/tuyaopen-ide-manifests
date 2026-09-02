# AI (ai)


## AI 基础包

#### backgroundMusicDownload

##### 功能描述

背景音乐下载

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { backgroundMusicDownload } = ai
backgroundMusicDownload({ ... })
```

**原生小程序中使用**

```javascript
const { backgroundMusicDownload } = ty.ai
backgroundMusicDownload({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| musicUrl  | string   |        | 是   | 音乐下载 URL 地址                                |
| musicPath | string   |        | 是   | 音乐本地路径地址                                 |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| musicPath | string | 音乐本地地址 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### backgroundMusicList

##### 功能描述

背景音乐列表查询

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { backgroundMusicList } = ai
backgroundMusicList({ ... })
```

**原生小程序中使用**

```javascript
const { backgroundMusicList } = ty.ai
backgroundMusicList({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型         | 说明     |
| --------- | ------------ | -------- |
| musicList | MusicModel[] | 音乐列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**MusicModel**

| 属性       | 类型   | 默认值 | 必填 | 说明              |
| ---------- | ------ | ------ | ---- | ----------------- |
| musicTitle | string |        | 是   | 音乐标题          |
| musicUrl   | string |        | 是   | 音乐下载 URL 地址 |
#### getTranslateRealTimeResult

##### 功能描述

获取翻译实时数据

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { getTranslateRealTimeResult } = ai
getTranslateRealTimeResult({ ... })
```

**原生小程序中使用**

```javascript
const { getTranslateRealTimeResult } = ty.ai
getTranslateRealTimeResult({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| translateId | string   |        | 是   | 翻译记录 id                                      |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型                      | 说明             |
| ---- | ------------------------- | ---------------- |
| list | TranslateRealTimeResult[] | 实时转写数据列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**TranslateRealTimeResult**

| 属性        | 类型   | 默认值 | 必填 | 说明                    |
| ----------- | ------ | ------ | ---- | ----------------------- |
| asrId       | number |        | 是   | asrId                   |
| translateId | number |        | 是   | 翻译记录 id             |
| requestId   | string |        | 是   | 本次录音唯一标识        |
| recordId    | string |        | 是   | 翻译 ai 识别唯一标识 id |
| beginTime   | number |        | 是   | 音频开始时间, 单位毫秒  |
| endTime     | number |        | 是   | 音频结束时间, 单位毫秒  |
| text        | string |        | 是   | 翻译文案                |
| asr         | string |        | 是   | 识别文案                |
| channel     | number |        | 是   | 通道                    |
#### getTranslateRecord

##### 功能描述

获取翻译详情

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { getTranslateRecord } = ai
getTranslateRecord({ ... })
```

**原生小程序中使用**

```javascript
const { getTranslateRecord } = ty.ai
getTranslateRecord({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| translateId | number   |        | 是   | 翻译记录 id                                      |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性             | 类型    | 说明                                               |
| ---------------- | ------- | -------------------------------------------------- |
| translateId      | number  | 翻译记录 id                                        |
| deviceId         | string  | 设备 id                                            |
| originalLanguage | string  | 起始语言                                           |
| targetLanguage   | string  | 目标语言                                           |
| recordId         | string  | 实时转写记录 id                                    |
| agentId          | string  | 实时转写智能体 id                                  |
| name             | string  | 文件名称                                           |
| beginAt          | number  | 开始录音时间 时间戳 单位秒                         |
| endAt            | number  | 结束录音时长 单位毫秒                              |
| duration         | number  | 录音时长                                           |
| visit            | boolean | 是否已经点击过                                     |
| remove           | boolean | 是否被移除，移到垃圾桶                             |
| wavFilePath      | string  | 录音 wav 文件路径                                  |
| summaryStatus    | number  | 总结状态，0 未总结、1 总结中、2 已总结、3 总结失败 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### getTranslateRecords

##### 功能描述

获取 ai 翻译列表

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { getTranslateRecords } = ai
getTranslateRecords({ ... })
```

**原生小程序中使用**

```javascript
const { getTranslateRecords } = ty.ai
getTranslateRecords({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 否   | 设备 id, 不传会查出所有设备                      |
| lastId   | number   |        | 否   | 最后一个记录 id，不传或 0 表示不做限制           |
| pageSize | number   |        | 否   | 分页大小，不传或 0 表示不分页（全部）            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型              | 说明 |
| ---- | ----------------- | ---- |
| list | TranslateRecord[] | 列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**TranslateRecord**

| 属性             | 类型    | 默认值 | 必填 | 说明                                               |
| ---------------- | ------- | ------ | ---- | -------------------------------------------------- |
| translateId      | number  |        | 是   | 翻译记录 id                                        |
| deviceId         | string  |        | 是   | 设备 id                                            |
| originalLanguage | string  |        | 否   | 起始语言                                           |
| targetLanguage   | string  |        | 否   | 目标语言                                           |
| recordId         | string  |        | 否   | 实时转写记录 id                                    |
| agentId          | string  |        | 否   | 实时转写智能体 id                                  |
| name             | string  |        | 是   | 文件名称                                           |
| beginAt          | number  |        | 是   | 开始录音时间 时间戳 单位秒                         |
| endAt            | number  |        | 是   | 结束录音时长 单位毫秒                              |
| duration         | number  |        | 是   | 录音时长                                           |
| visit            | boolean |        | 是   | 是否已经点击过                                     |
| remove           | boolean |        | 是   | 是否被移除，移到垃圾桶                             |
| wavFilePath      | string  |        | 否   | 录音 wav 文件路径                                  |
| summaryStatus    | number  |        | 是   | 总结状态，0 未总结、1 总结中、2 已总结、3 总结失败 |
#### getTranslateSummary

##### 功能描述

总结查询

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { getTranslateSummary } = ai
getTranslateSummary({ ... })
```

**原生小程序中使用**

```javascript
const { getTranslateSummary } = ty.ai
getTranslateSummary({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| translateId | number   |        | 是   | 翻译记录 id                                      |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型   | 说明     |
| ---- | ------ | -------- |
| text | string | 总结文案 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### getTranslateSummaryProcessStatus

##### 功能描述

总结状态查询

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { getTranslateSummaryProcessStatus } = ai
getTranslateSummaryProcessStatus({ ... })
```

**原生小程序中使用**

```javascript
const { getTranslateSummaryProcessStatus } = ty.ai
getTranslateSummaryProcessStatus({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId     | string   |        | 是   | 设备 id                                          |
| translateIds | string[] |        | 是   | 翻译记录 id 列表                                 |
| success      | function |        | 否   | 接口调用成功的回调函数                           |
| fail         | function |        | 否   | 接口调用失败的回调函数                           |
| complete     | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性    | 类型     | 说明                   |
| ------- | -------- | ---------------------- |
| success | string[] | 接口调用成功的回调函数 |
| fail    | string[] | 接口调用失败的回调函数 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### objectDetectCreate

##### 功能描述

对象识别模型初始化

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectCreate } = ai
objectDetectCreate({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectCreate } = ty.ai
objectDetectCreate({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### objectDetectDestroy

##### 功能描述

对象识别模型销毁

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectDestroy } = ai
objectDetectDestroy({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectDestroy } = ty.ai
objectDetectDestroy({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### objectDetectForImage

##### 功能描述

图片对象识别处理

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectForImage } = ai
objectDetectForImage({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectForImage } = ty.ai
objectDetectForImage({ ... })
```

##### 请求参数

**Object object**

| 属性          | 类型                 | 默认值                                  | 必填 | 说明                                             |
| ------------- | -------------------- | --------------------------------------- | ---- | ------------------------------------------------ |
| inputPath     | string               |                                         | 是   | 图片输入路径                                     |
| outputPath    | string               |                                         | 是   | 图片输出路径                                     |
| detectType    | `enum` DetectType    | `DetectType.VideoDetectMainBodyTypePet` | 否   | 识别类型                                         |
| imageEditType | `enum` ImageEditType | `ImageEditType.ImageEditTypeNoEffect`   | 否   | 图像处理类型                                     |
| success       | function             |                                         | 否   | 接口调用成功的回调函数                           |
| fail          | function             |                                         | 否   | 接口调用失败的回调函数                           |
| complete      | function             |                                         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型   | 说明     |
| ---- | ------ | -------- |
| path | string | 输出路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` DetectType**

| 枚举值 | 描述 |
| ------ | ---- |
| 1      | 宠物 |
| 2      | 人物 |

**`enum` ImageEditType**

| 枚举值 | 描述     |
| ------ | -------- |
| 1      | 没有效果 |
| 2      | 主体突出 |
#### objectDetectForImageCancel

##### 功能描述

取消图片对象识别处理

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectForImageCancel } = ai
objectDetectForImageCancel({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectForImageCancel } = ty.ai
objectDetectForImageCancel({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### objectDetectForVideo

##### 功能描述

视频对象识别处理

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectForVideo } = ai
objectDetectForVideo({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectForVideo } = ty.ai
objectDetectForVideo({ ... })
```

##### 请求参数

**Object object**

| 属性               | 类型                 | 默认值                                  | 必填 | 说明                                             |
| ------------------ | -------------------- | --------------------------------------- | ---- | ------------------------------------------------ |
| inputVideoPath     | string               |                                         | 是   | 视频输入路径                                     |
| outputVideoPath    | string               |                                         | 是   | 视频输出路径                                     |
| videoConfig        | `enum` VideoConfig   | `VideoConfig.Level_1080`                | 否   | 视频配置信息
-- 默认 1080                    |
| detectType         | `enum` DetectType    | `DetectType.VideoDetectMainBodyTypePet` | 否   | 识别类型                                         |
| imageEditType      | `enum` ImageEditType | `ImageEditType.ImageEditTypeNoEffect`   | 否   | 图像处理类型                                     |
| musicPath          | string               |                                         | 是   | 配乐本地地址                                     |
| audioEditType      | `enum` AudioEditType | `AudioEditType.audioEditTypeNULL`       | 否   | 音频处理类型                                     |
| originAudioVolume  | number               | `0.5`                                   | 否   | 原始音频音量                                     |
| overlayAudioVolume | number               | `0.5`                                   | 否   | 覆盖音频音量                                     |
| success            | function             |                                         | 否   | 接口调用成功的回调函数                           |
| fail               | function             |                                         | 否   | 接口调用失败的回调函数                           |
| complete           | function             |                                         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型   | 说明     |
| ---- | ------ | -------- |
| path | string | 输出路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` VideoConfig**

| 枚举值 | 描述         |
| ------ | ------------ |
| 1      | 480          |
| 2      | 540          |
| 3      | 720          |
| 4      | 1080（默认） |

**`enum` DetectType**

| 枚举值 | 描述 |
| ------ | ---- |
| 1      | 宠物 |
| 2      | 人物 |

**`enum` ImageEditType**

| 枚举值 | 描述     |
| ------ | -------- |
| 1      | 没有效果 |
| 2      | 主体突出 |

**`enum` AudioEditType**

| 枚举值 | 描述         |
| ------ | ------------ |
| 1      | 不处理       |
| 2      | 0.5 0.5 混音 |
| 3      | 视频静音     |
#### objectDetectForVideoCancel

##### 功能描述

取消视频对象识别处理

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { objectDetectForVideoCancel } = ai
objectDetectForVideoCancel({ ... })
```

**原生小程序中使用**

```javascript
const { objectDetectForVideoCancel } = ty.ai
objectDetectForVideoCancel({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### onVideoObjectDetectProgress

##### 功能描述

处理进度

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { onVideoObjectDetectProgress } = ai
onVideoObjectDetectProgress({ ... })
```

**原生小程序中使用**

```javascript
const { onVideoObjectDetectProgress } = ty.ai
onVideoObjectDetectProgress({ ... })
```

##### 参数

**function listener**
处理进度
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明           |
| -------- | ------ | ------ | ---- | -------------- |
| progress | number |        | 是   | 处理进度 1-100 |
#### offVideoObjectDetectProgress

##### 功能描述

移除监听：处理进度

> 需引入`AIKit`，且在`>=1.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { offVideoObjectDetectProgress } = ai
offVideoObjectDetectProgress({ ... })
```

**原生小程序中使用**

```javascript
const { offVideoObjectDetectProgress } = ty.ai
offVideoObjectDetectProgress({ ... })
```

##### 参数

**function listener**

onVideoObjectDetectProgress 传入的监听函数。不传此参数则移除所有监听函数。
#### processTranslateSummary

##### 功能描述

执行总结

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { processTranslateSummary } = ai
processTranslateSummary({ ... })
```

**原生小程序中使用**

```javascript
const { processTranslateSummary } = ty.ai
processTranslateSummary({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| translateId | number   |        | 是   | 翻译记录 id                                      |
| template    | string   |        | 是   | 模板                                             |
| language    | string   |        | 是   | 语言                                             |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### removeTranslateRecord

##### 功能描述

删除翻译记录

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { removeTranslateRecord } = ai
removeTranslateRecord({ ... })
```

**原生小程序中使用**

```javascript
const { removeTranslateRecord } = ty.ai
removeTranslateRecord({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| translateId | number   |        | 是   | 翻译记录 id                                      |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### updateTranslateRecord

##### 功能描述

更新翻译记录

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { updateTranslateRecord } = ai
updateTranslateRecord({ ... })
```

**原生小程序中使用**

```javascript
const { updateTranslateRecord } = ty.ai
updateTranslateRecord({ ... })
```

##### 请求参数

**Object object**

| 属性          | 类型     | 默认值 | 必填 | 说明                                                               |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------------ |
| translateId   | number   |        | 是   | 翻译记录 id                                                        |
| name          | string   |        | 否   | 文件名称, 不传表示不更新                                           |
| summaryStatus | string   |        | 否   | 总结状态，0 未总结、1 总结中、2 已总结、3 总结失败, 不传表示不更新 |
| visit         | string   |        | 否   | 是否已经点击过, 不传表示不更新                                     |
| remove        | string   |        | 否   | 是否被移除，移到垃圾桶, 不传表示不更新                             |
| success       | function |        | 否   | 接口调用成功的回调函数                                             |
| fail          | function |        | 否   | 接口调用失败的回调函数                                             |
| complete      | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                   |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### TranslateContext generateTranslateTask

##### 功能描述

创建内部 Translate 上下文

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { generateTranslateTask } = ai
const manager = generateTranslateTask({ ... })
```

**原生小程序中使用**

```javascript
const { generateTranslateTask } = ty.ai
const manager = generateTranslateTask({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                             |
| ---------------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId         | string   |        | 是   | 设备 id                                          |
| dataTimeout      | number   |        | 是   | 灌流超时时间 单位秒                              |
| originalLanguage | string   |        | 是   | 近端语言                                         |
| targetLanguage   | string   |        | 是   | 远端语言                                         |
| agentId          | string   |        | 是   | 智能体 id                                        |
| success          | function |        | 否   | 接口调用成功的回调函数                           |
| fail             | function |        | 否   | 接口调用失败的回调函数                           |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 返回值

`TranslateContext`
#### TranslateContext

##### 功能描述

Translate 上下文
#### privacyProtectDetectForVideo

##### 功能描述

视频隐私保护识别处理

> 需引入`AIKit`，且在`>=1.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { privacyProtectDetectForVideo } = ai
privacyProtectDetectForVideo({ ... })
```

**原生小程序中使用**

```javascript
const { privacyProtectDetectForVideo } = ty.ai
privacyProtectDetectForVideo({ ... })
```

##### 请求参数

**Object object**

| 属性               | 类型                 | 默认值                                  | 必填 | 说明                                             |
| ------------------ | -------------------- | --------------------------------------- | ---- | ------------------------------------------------ |
| inputVideoPath     | string               |                                         | 是   | 视频输入路径                                     |
| outputVideoPath    | string               |                                         | 是   | 视频输出路径                                     |
| videoConfig        | `enum` VideoConfig   | `VideoConfig.Level_1080`                | 否   | 视频配置信息
-- 默认 1080                    |
| detectType         | `enum` DetectType    | `DetectType.VideoDetectMainBodyTypePet` | 否   | 识别类型                                         |
| imageEditType      | `enum` ImageEditType | `ImageEditType.ImageEditTypeNoEffect`   | 否   | 图像处理类型                                     |
| musicPath          | string               |                                         | 是   | 配乐本地地址                                     |
| audioEditType      | `enum` AudioEditType | `AudioEditType.audioEditTypeNULL`       | 否   | 音频处理类型                                     |
| originAudioVolume  | number               | `0.5`                                   | 否   | 原始音频音量                                     |
| overlayAudioVolume | number               | `0.5`                                   | 否   | 覆盖音频音量                                     |
| success            | function             |                                         | 否   | 接口调用成功的回调函数                           |
| fail               | function             |                                         | 否   | 接口调用失败的回调函数                           |
| complete           | function             |                                         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性 | 类型   | 说明     |
| ---- | ------ | -------- |
| path | string | 输出路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` VideoConfig**

| 枚举值 | 描述         |
| ------ | ------------ |
| 1      | 480          |
| 2      | 540          |
| 3      | 720          |
| 4      | 1080（默认） |

**`enum` DetectType**

| 枚举值 | 描述 |
| ------ | ---- |
| 1      | 宠物 |
| 2      | 人物 |

**`enum` ImageEditType**

| 枚举值 | 描述     |
| ------ | -------- |
| 1      | 没有效果 |
| 2      | 主体突出 |

**`enum` AudioEditType**

| 枚举值 | 描述         |
| ------ | ------------ |
| 1      | 不处理       |
| 2      | 0.5 0.5 混音 |
| 3      | 视频静音     |
#### startDownloadMessageVideoForComposition

##### 功能描述

将IPC云端视频下载到 APP 本地

> 需引入`AIKit`，且在`>=0.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray >=1.6.29
import { ai } from '@ray-js/ray'
const { startDownloadMessageVideoForComposition } = ai
startDownloadMessageVideoForComposition({ ... })
```

**原生小程序中使用**

```javascript
const { startDownloadMessageVideoForComposition } = ty.ai
startDownloadMessageVideoForComposition({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型                    | 默认值 | 必填 | 说明                                                                                                                                                                                                                                                        |
| -------- | ----------------------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| deviceId | string                  |        | 是   | 设备 ID                                                                                                                                                                                                                                                     |
| fileInfo | string                  |        | 是   | 文件信息，json 字符串
 \{"fileInfo":\[
 \{
 "fileUrl": "xxx1",
 "key": "media key 1"
 \},
 \{
 "fileUrl": "xxx2",
 "key": "media key 2"
 \},
 \{
 "fileUrl": "xxx3",
 "key": "media key 3"
 \}\]
\} |
| savePath | number                  |        | 是   | 保存路径 0: 默认值，保存在手机相册。1: 保存在 App 相册。2: 同时保存到手机相册和 App 相册                                                                                                                                                                    |
| option   | MediaProcessOptionModel |        | 否   | 视频处理的的配置选项                                                                                                                                                                                                                                        |
| success  | function                |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                      |
| fail     | function                |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                      |
| complete | function                |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                            |

##### 返回结果

**success**

| 属性 | 类型   | 说明      |
| ---- | ------ | --------- |
| path | string | file path |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**MediaProcessOptionModel**

| 属性                    | 类型    | 默认值 | 必填 | 说明                                                                                                        |
| ----------------------- | ------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------- |
| targetWidth             | number  |        | 是   | 目标视频宽                                                                                                  |
| targetHeight            | number  |        | 是   | 目标视频高                                                                                                  |
| useFirstVideoResolution | boolean |        | 是   | 第一个视频的分辨率为主
默认值为 true                                                                    |
| rotation                | number  |        | 是   | 旋转角度 仅支持：0\(正常模式，不旋转\)、1\(顺时针旋转 90 度\)、2\(顺时针旋转 180 度\)、3\(顺时针旋转 270 度 |
#### petsDetectCreate

##### 功能描述

宠物图像质量检测初始化

> 需引入`AIKit`，且在`>=1.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { petsDetectCreate } = ai
petsDetectCreate({ ... })
```

**原生小程序中使用**

```javascript
const { petsDetectCreate } = ty.ai
petsDetectCreate({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### petsDetectDestory

##### 功能描述

宠物图像质量检测销毁

> 需引入`AIKit`，且在`>=1.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { petsDetectDestory } = ai
petsDetectDestory({ ... })
```

**原生小程序中使用**

```javascript
const { petsDetectDestory } = ty.ai
petsDetectDestory({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### createForegroundVideoService

##### 功能描述

创建前景视频处理服务

> 需引入`AIKit`，且在`>=1.4.4`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { createForegroundVideoService } = ai
createForegroundVideoService({ ... })
```

**原生小程序中使用**

```javascript
const { createForegroundVideoService } = ty.ai
createForegroundVideoService({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**
| 属性 | 类型 | 说明 |
| --------- | ------ | ------------ |
| errorMsg | string | 插件错误信息 |
| errorCode | string | 错误码 |
#### destroyForegroundVideoService

##### 功能描述

销毁前景视频服务

> 需引入`AIKit`，且在`>=1.4.4`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { destroyForegroundVideoService } = ai
destroyForegroundVideoService({ ... })
```

**原生小程序中使用**

```javascript
const { destroyForegroundVideoService } = ty.ai
destroyForegroundVideoService({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### processPetForegroundMediaByTemplate

##### 功能描述

通过模板进行媒体前景视频处理

> 需引入`AIKit`，且在`>=1.4.4`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { processPetForegroundMediaByTemplate } = ai
processPetForegroundMediaByTemplate({ ... })
```

**原生小程序中使用**

```javascript
const { processPetForegroundMediaByTemplate } = ty.ai
processPetForegroundMediaByTemplate({ ... })
```

##### 请求参数

**Object object**

| 属性           | 类型                          | 默认值 | 必填 | 说明                                             |
| -------------- | ----------------------------- | ------ | ---- | ------------------------------------------------ |
| templateObject | ForegroundMediaTemplateObject |        | 是   | 模板参数                                         |
| mediaSource    | string                        |        | 是   | 输入媒体数据                                     |
| outputConfig   | OutputConfig                  |        | 否   | 媒体输出配置                                     |
| extendParam    | Object                        |        | 否   | 额外参数                                         |
| success        | function                      |        | 否   | 接口调用成功的回调函数                           |
| fail           | function                      |        | 否   | 接口调用失败的回调函数                           |
| complete       | function                      |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**ForegroundMediaTemplateObject**

| 属性        | 类型                                | 默认值 | 必填 | 说明         |
| ----------- | ----------------------------------- | ------ | ---- | ------------ |
| type        | string                              |        | 是   | 云配配置Key  |
| effect      | ForegroundMediaTemplateEffectObject |        | 是   | 模板配置信息 |
| extendParam | Object                              |        | 否   | 额外参数     |

**ForegroundMediaTemplateEffectObject**

| 属性           | 类型   | 默认值 | 必填 | 说明                                         |
| -------------- | ------ | ------ | ---- | -------------------------------------------- |
| code           | string |        | 是   | 模板特效Key                                  |
| name           | string |        | 是   | 模板特效名称                                 |
| outputDuration | number |        | 是   | 特效的输出时长（单位：秒）                   |
| outputType     | string |        | 否   | 特效的输出类型（图片/音频/视频，默认为图片） |
| image          | string |        | 是   | 效果预览URL                                  |
| resource       | string |        | 是   | 效果资源URL                                  |
| extendParam    | Object |        | 否   | 额外参数                                     |

**ForegroundMediaTemplateEffectObject**

| 属性         | 类型   | 默认值 | 必填 | 说明                                       |
| ------------ | ------ | ------ | ---- | ------------------------------------------ |
| path         | string |        | 否   | 输出前景媒体路径                           |
| name         | string |        | 否   | 输出前景媒体名称                           |
| min_duration | number |        | 否   | 前景媒体最小输出时长（单位：秒）           |
| outputType   | string |        | 否   | 请选择输出类型：图片/音频/视频（默认图片） |
| extendParam  | Object |        | 否   | 额外参数                                   |
#### petsPictureQualityDetectForImage

##### 功能描述

宠物图像质量检测

> 需引入`AIKit`，且在`>=1.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { petsPictureQualityDetectForImage } = ai
petsPictureQualityDetectForImage({ ... })
```

**原生小程序中使用**

```javascript
const { petsPictureQualityDetectForImage } = ty.ai
petsPictureQualityDetectForImage({ ... })
```

##### 请求参数

**Object object**

| 属性                     | 类型     | 默认值                        | 必填 | 说明                                                        |
| ------------------------ | -------- | ----------------------------- | ---- | ----------------------------------------------------------- |
| inputImagePath           | string   |                               | 是   | 图片输入路径                                                |
| labelAllow               | any      | `LabelAllowEnum.labelTypeCat` | 否   | 识别类型枚举                                                |
| objectAreaPercent        | number   |                               | 是   | 识别对象大小占整个图片的比值，默认值 30，含义：小于 30%过滤 |
| objectFaceRotationAngle  | number   |                               | 是   | 识别对象脸部旋转角度，默认值 45，含义：超过 45%过滤         |
| objectFaceSideAngle      | number   |                               | 是   | 识别对象脸部侧脸角度，默认值 40，含义：超过 40%过滤         |
| maximumPictureBrightness | number   |                               | 是   | 最大亮度                                                    |
| minimumPictureBrightness | number   |                               | 是   | 最小亮度                                                    |
| success                  | function |                               | 否   | 接口调用成功的回调函数                                      |
| fail                     | function |                               | 否   | 接口调用失败的回调函数                                      |
| complete                 | function |                               | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）            |

##### 返回结果

**success**

| 属性             | 类型    | 说明             |
| ---------------- | ------- | ---------------- |
| imagePath        | string  | 图片地址         |
| lowQuality       | boolean | 是否是低质量图片 |
| lowQualityReason | number  | 低质量原因       |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### imageEnhanceCreate

##### 功能描述

图像增强实例初始化

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { imageEnhanceCreate } = ai
imageEnhanceCreate({ ... })
```

**原生小程序中使用**

```javascript
const { imageEnhanceCreate } = ty.ai
imageEnhanceCreate({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### imageEnhanceDestroy

##### 功能描述

图像增强实例销毁

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { imageEnhanceDestroy } = ai
imageEnhanceDestroy({ ... })
```

**原生小程序中使用**

```javascript
const { imageEnhanceDestroy } = ty.ai
imageEnhanceDestroy({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### enhanceClarityForImage

##### 功能描述

图像清晰度增强优化

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { enhanceClarityForImage } = ai
enhanceClarityForImage({
    inputImagePath: '',
    outputImagePath: '',
    enhanceType: 5,
    success: () => {},
    fail: (err)=> {},
    complete() => {},
})
```

**原生小程序中使用**

```javascript
const { enhanceClarityForImage } = ty.ai
enhanceClarityForImage({ 
    inputImagePath: '',
    outputImagePath: '',
    enhanceType: 5,
    success: () => {},
    fail: (err)=> {},
    complete() => {},
})
```

##### 请求参数

**Object object**

| 属性                    | 类型                    | 默认值 | 必填 | 说明                                                               |
| ----------------------- | ----------------------- | ------ | ---- | ------------------------------------------------------------------ |
| inputImagePath          | string                  |        | 是   | 图片文件的路径                                                     |
| outputImagePath         | string                  |        | 是   | 图片输出目录                                                       |
| enhanceOutputResolution | EnhanceOutputResolution | 1      | 否   | 期望输出图像分辨率 默认最大输出 1080p,低于 1080p，按照输入尺寸输出 |
| enhanceType             | EnhanceType             | 1      | 否   | 图像增强类型                                                       |
| success                 | function                |        | 否   | 接口调用成功的回调函数                                             |
| fail                    | function                |        | 否   | 接口调用失败的回调函数                                             |
| complete                | function                |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                   |

**EnhanceOutputResolution**
| 值 | 说明 |
| --| --|
|1 |原生尺寸|
|2 |640|
|3| 720|
|4| 1080|

**EnhanceType**
| 值 | 说明 |
| --| --|
|1 |没有操作,默认|
|2 |降噪|
|3| |暗光增强|
|4| 超分|
|5| 降噪+暗光增强|
|6| 降噪+超分|
|7| 暗光增强+超分|
|8| 降噪+暗光增强+超分|

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### enhanceCalibrationForImage

##### 功能描述

图像畸变校正

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { enhanceCalibrationForImage } = ai
enhanceCalibrationForImage({ ... })
```

**原生小程序中使用**

```javascript
const { enhanceCalibrationForImage } = ty.ai
enhanceCalibrationForImage({ ... })
```

##### 请求参数

**Object object**

| 属性              | 类型                     | 默认值 | 必填 | 说明                                             |
| ----------------- | ------------------------ | ------ | ---- | ------------------------------------------------ |
| inputImagePath    | string                   |        | 是   | 图片文件的路径                                   |
| outputImagePath   | string                   |        | 是   | 图片输出目录                                     |
| interpolationType | EnhanceInterpolationType | 1      | 否   | 插值类型                                         |
| ratio             | number                   |        | 是   | 比例                                             |
| fCx               | number                   |        | 是   | 相机内参 Cx                                      |
| fCy               | number                   |        | 是   | 相机内参 Cy                                      |
| fFx               | number                   |        | 是   | 相机内参 Fx                                      |
| fFy               | number                   |        | 是   | 相机内参 Fy                                      |
| fK1               | number                   |        | 是   | 相机径向畸变系数 K1                              |
| fK2               | number                   |        | 是   | 相机径向畸变系数 K2                              |
| fK3               | number                   |        | 是   | 相机径向畸变系数 K3                              |
| fP1               | number                   |        | 是   | 相机切向畸变系数 P1                              |
| fP2               | number                   |        | 是   | 相机切向畸变系数 P2                              |
| success           | function                 |        | 否   | 接口调用成功的回调函数                           |
| fail              | function                 |        | 否   | 接口调用失败的回调函数                           |
| complete          | function                 |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

**EnhanceInterpolationType**
| 值 | 说明 |
| --| --|
|1 |默认,BILINEAR|
|2 |BILINEAR|
|3 |BICUBIC|
|4 |LANZCOS|
|5 |EDGE|

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### enhanceClarityCancel

##### 功能描述

取消图像清晰度增强优化

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { enhanceClarityCancel } = ai
enhanceClarityCancel({ ... })
```

**原生小程序中使用**

```javascript
const { enhanceClarityCancel } = ty.ai
enhanceClarityCancel({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### onEnhanceClarityProgress

##### 功能描述

注册图像清晰度增强优化进度事件

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { onEnhanceClarityProgress } = ai
onEnhanceClarityProgress({ ... })
```

**原生小程序中使用**

```javascript
const { onEnhanceClarityProgress } = ty.ai
onEnhanceClarityProgress({ ... })
```

##### 请求参数

function listener 图像清晰优化进度 参数

**Object object**

| 属性     | 类型   | 默认值 | 必填     | 说明  |
| -------- | ------ | ------ | -------- | ----- |
| progress | number | 是     | 处理进度 | 1-100 |
#### offEnhanceClarityProgress

##### 功能描述

注销图像清晰度增强优化进度监听事件

> 需引入`AIKit`，且在`>=1.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { offEnhanceClarityProgress } = ai
offEnhanceClarityProgress({ ... })
```

**原生小程序中使用**

```javascript
const { offEnhanceClarityProgress } = ty.ai
offEnhanceClarityProgress({ ... })
```

##### 请求参数

function listener

onEnhanceClarityProgress 传入的监听函数。不传此参数则移除所有监听函数。
#### oralDiseaseInit

##### 功能描述

口腔疾病预测初始化

> 需引入`AIKit`，且在`>=1.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { oralDiseaseInit } = ai
oralDiseaseInit({ ... })
```

**原生小程序中使用**

```javascript
const { oralDiseaseInit } = ty.ai
oralDiseaseInit({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### onOralModelDownProgress

##### 功能描述

口腔模型初始化进度

> 需引入`AIKit`，且在`>=1.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { onOralModelDownProgress } = ai
onOralModelDownProgress({ ... })
```

**原生小程序中使用**

```javascript
const { onOralModelDownProgress } = ty.ai
onOralModelDownProgress({ ... })
```

##### 参数

**function listener**
口腔模型下载进度
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明           |
| -------- | ------ | ------ | ---- | -------------- |
| progress | number |        | 是   | 处理进度 1-100 |
#### offOralModelDownProgress

##### 功能描述

移除监听：口腔模型初始化进度

> 需引入`AIKit`，且在`>=1.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { offOralModelDownProgress } = ai
offOralModelDownProgress({ ... })
```

**原生小程序中使用**

```javascript
const { offOralModelDownProgress } = ty.ai
offOralModelDownProgress({ ... })
```

##### 参数

**function listener**

onOralModelDownProgress 传入的监听函数。不传此参数则移除所有监听函数。
#### oralDiseasePredictionRun

##### 功能描述

口腔疾病预测分析

> 需引入`AIKit`，且在`>=1.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { oralDiseasePredictionRun } = ai
oralDiseasePredictionRun({ ... })
```

**原生小程序中使用**

```javascript
const { oralDiseasePredictionRun } = ty.ai
oralDiseasePredictionRun({ ... })
```

##### 请求参数

**Object object**

| 属性           | 类型     | 默认值 | 必填 | 说明                                             |
| -------------- | -------- | ------ | ---- | ------------------------------------------------ |
| inputImagePath | string   |        | 是   | 图片输入路径                                     |
| outImagePath   | string   |        | 是   | 图片输出目录                                     |
| success        | function |        | 否   | 接口调用成功的回调函数                           |
| fail           | function |        | 否   | 接口调用失败的回调函数                           |
| complete       | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性          | 类型     | 说明                                                                                                                                                    |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nonOral       | boolean  | 是否非口腔图片                                                                                                                                          |
| diseaseType   | string[] | 预测结果
Normal 正常
Calculus 结石
Caries 龋齿
Gingivitis 牙龈炎
Ulcers 溃疡
Discoloration 牙齿变色
Hypodontia 牙齿发育不全 |
| heatMapPath   | string   | 模型热力图                                                                                                                                              |
| sunlightPath  | string   | 日光模式滤镜                                                                                                                                            |
| chromaPath    | string   | 牙周模式滤镜图                                                                                                                                          |
| grayscalePath | string   | 龋齿模式滤镜图                                                                                                                                          |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### pixelImageInit

##### 功能描述

图像生成初始化

> 需引入`AIKit`，且在`>=1.8.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { pixelImageInit } = ai
pixelImageInit({ ... })
```

**原生小程序中使用**

```javascript
const { pixelImageInit } = ty.ai
pixelImageInit({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### fetchPixelImageCategoryInfo

##### 功能描述

图像生成标签列表

> 需引入`AIKit`，且在`>=1.8.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { fetchPixelImageCategoryInfo } = ai
fetchPixelImageCategoryInfo({ ... })
```

**原生小程序中使用**

```javascript
const { fetchPixelImageCategoryInfo } = ty.ai
fetchPixelImageCategoryInfo({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| imageCategory  | PixelImageCategoryBean[]	 | 类目信息 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**PixelImageCategoryBean**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| categoryName   | string |        | 是   | 类目名称                           |
| categoryLabel      | string[] |        | 是   | 类目标签                           |
#### generationPixelImage

##### 功能描述

图像生成

> 需引入`AIKit`，且在`>=1.8.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { generationPixelImage } = ai
generationPixelImage({ ... })
```

**原生小程序中使用**

```javascript
const { generationPixelImage } = ty.ai
generationPixelImage({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId     | string   |        | 是   | 设备 ID                                          |
| label        | string   |        | 是   | 标签                                             |
| imageWidth   | number   |        | 是   | 生成图片的宽度                                   |
| imageHeight  | number   |        | 是   | 生成图片的高度                                   |
| outImagePath | string   |        | 是   | 图片输出目录                                     |
| success      | function |        | 否   | 接口调用成功的回调函数                           |
| fail         | function |        | 否   | 接口调用失败的回调函数                           |
| complete     | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型    | 说明                   |
| --------- | ------- | ---------------------- |
| success   | boolean | 接口调用成功的回调函数 |
| imagePath | string  | 生成的图像路径         |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### onPixelImageInitProgressEvent

##### 功能描述

初始化进度

> 需引入`AIKit`，且在`>=1.8.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { onPixelImageInitProgressEvent } = ai
onPixelImageInitProgressEvent({ ... })
```

**原生小程序中使用**

```javascript
const { onPixelImageInitProgressEvent } = ty.ai
onPixelImageInitProgressEvent({ ... })
```

##### 请求参数

**function listener** 初始化进度 **参数**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| progress   | number |        | 否   | 初始化进度                           |
#### offPixelImageInitProgressEvent

##### 功能描述

移除监听：初始化进度

> 需引入`AIKit`，且在`>=1.8.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { offPixelImageInitProgressEvent } = ai
offPixelImageInitProgressEvent({ ... })
```

**原生小程序中使用**

```javascript
const { offPixelImageInitProgressEvent } = ty.ai
offPixelImageInitProgressEvent({ ... })
```

##### 请求参数

**function listener**

onPixelImageInitProgressEvent 传入的监听函数。不传此参数则移除所有监听函数。
#### predictLightScenes

##### 功能描述

预测灯光场景

> 需引入`AIKit`，且在`>=1.9.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { ai } from '@ray-js/ray'
const { predictLightScenes } = ai
predictLightScenes({ ... })
```

**原生小程序中使用**

```javascript
const { predictLightScenes } = ty.ai
predictLightScenes({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| roomId     | number   |        | 是   | 房间 ID                                          |
| generateSceneStyles   | `SceneStyleInfo[]`   |        | 是   | 场景风格列表,开灯比例百分比    |
| sceneType  | number   |        | 是   | 场景类型                                 |
| success      | function |        | 否   | 接口调用成功的回调函数                           |
| fail         | function |        | 否   | 接口调用失败的回调函数                           |
| complete     | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`Array<LightSceneInfo>`

**LightSceneInfo**

| 属性 | 类型 | 说明 |
|------|------|------|
| parentRegionId | string | 房间 ID |
| sceneType | number | 场景类型 |
| name | string | 场景名称 |
| icon | string | 场景图标 |
| matchType | number | 匹配类型 |
| actions | `Array<LightSceneAction>` | 场景动作列表 |

**LightSceneAction**

| 属性 | 类型 | 说明 |
|------|------|------|
| actionExecutor | string | 动作执行类型 |
| entityId | string | 设备 ID |
| entityName | string | 设备名称 |
| executorProperty | object| 执行属性 |
| extraProperty | object | 额外属性 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**SceneStyleInfo**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| name | string | | 是 | 风格名称 |
| turnOnPercent | number | | 否 | 开灯比例百分比 |
| sceneDataList | `SceneData[]` | | 否 | 情景库数据列表,以此参数是否存在数据区分是情景库还是生成式风格 |
| nameRosettaKey | string | | 否 | 生成风格名称 key,唯一标识 |

**SceneData**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| productId | string | | 是 | 产品 id |
| sceneData | string | | 是 | 情景库数据 |
| sceneCellBackground | string | | 是 | 情景图 |
| sceneId | string | | 是 | 情景 id |
| dpCode | string | | 是 | 情景 dpCode |

## AI 音频


### 音频操作

###### wear.startRecordTransfer

开始录音转写任务

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { startRecordTransfer } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型                              | 默认值 | 必填 | 说明                                             |
| -------- | --------------------------------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `number`                          |        | 是   | 设备id                                           |
| config   | `StartRecordTransferConfig`        |        | 是   | 录音配置参数，详见下表                           |
| success  | `function`          |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function`       |        | 否   | 接口调用失败的回调函数                           |

**StartRecordTransferConfig 配置参数**

| 属性           | 类型      | 必填 | 说明                                                                 |
| -------------- | --------- | ---- | -------------------------------------------------------------------- |
| recordType     | `number`  | 是   | 录音类型，0呼叫，1会议，2同声传译，3:面对面翻译                         |
| controlTimeout | `number`  | 是   | dp控制超时时间，单位秒                                               |
| recordChannel  | `number`  | 是   | 录音通道 0 ble(opus) 1 Bt 2 micro，默认0                             |
| f2fChannel     | `number`  | 是   | 面对面翻译数据来源方向，仅recordType==3时有效，0:default 1:left 2:right|
| dataTimeout    | `number`  | 是   | 灌流超时时间，单位秒                                                 |
| transferType   | `number`  | 是   | 转写模式 0文件转写，1实时转写                                         |
| needTranslate  | `boolean` | 是   | 是否需要翻译                                                         |
| originalLanguage | `string` | 否  | 起始语言（会议/电话模式为起始语言，同声传译为左耳语言）               |
| targetLanguage | `string`  | 否   | 目标语言（会议/电话模式为目标语言，同声传译为右耳语言）               |
| agentId        | `string`  | 否   | 智能体id                                                             |
| ttsEncode      | `number`  | 否   | TTS流编码方式 0: opus_silk 1: opus_celt                              |
| needTts        | `boolean` | 是   | 是否需要TTS  true：需要  false ：不需要                                                     |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                               |

###### 请求示例

```js
startRecordTransfer({
  deviceId: 123456,
  config: {
    recordType: 1,
    controlTimeout: 30,
    recordChannel: 0,
    f2fChannel: 0,
    dataTimeout: 60,
    transferType: 1,
    needTranslate: true,
    originalLanguage: 'zh',
    targetLanguage: 'en',
    needTts: false,
  },
  success: () => {
    console.log('start success');
  },
  fail: (err) => {
    console.log('start fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "xxxx",
  "errorCode": 1001,
}
```
###### wear.pauseRecordTransfer

暂停录音

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { pauseRecordTransfer } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `number`   |        | 是   | 设备id                                           |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
pauseRecordTransfer({
  deviceId: 123456,
  success: () => {
    console.log('pause success');
  },
  fail: (err) => {
    console.log('pause fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "xxx",
  "errorCode": 1001,
}
```
###### wear.resumeRecordTransfer

恢复录音

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { resumeRecordTransfer } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `number`   |        | 是   | 设备id                                           |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
resumeRecordTransfer({
  deviceId: 123456,
  success: () => {
    console.log('resume success');
  },
  fail: (err) => {
    console.log('resume fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "xx",
  "errorCode": 1001,
}
```
###### wear.stopRecordTransfer

结束录音

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { stopRecordTransfer } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `number`   |        | 是   | 设备id                                           |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
stopRecordTransfer({
  deviceId: 123456,
  success: () => {
    console.log('stop success');
  },
  fail: (err) => {
    console.log('stop fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "xxx",
  "errorCode": 1001,
}
```

### 音频文件操作

###### wear.getRecordTransferResultList

获取录音转写列表

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferResultList } = wear;
```

###### 请求参数

**Object object**

| 属性                | 类型        | 默认值 | 必填 | 说明                                                         |
| ------------------- | ----------- | ------ | ---- | ------------------------------------------------------------ |
| directoryId         | `string`    |        | 否   | 目录id, 不传查所有目录                                        |
| recordType          | `string`    |        | 否   | 音频类型, 0呼叫、1会议、2同声传译, 不传查所有类型             |
| deviceId            | `string`    |        | 否   | 设备id, 不传查所有设备                                        |
| remove              | `string`    |        | 否   | 0未删除、1已删除, 不传查所有                      |
| transfer            | `string`    |        | 否   | 转写状态, 0未转写、1转写中、2转写成功、3转写失败, 不传查所有   |
| source              | `string`    |        | 否   | 音频文件来源，0表示app，1表示设备, 不传查所有                  |
| orderBy             | `string`    |        | 否   | 排序规则 0-fileId、1-recordTime、2-updateAt, 不传默认fileId    |
| asc                 | `string`    |        | 否   | 排序 0降序 1升序, 不传默认降序                                |
| lastRecordTransferId| `string`    |        | 否   | 最后一个记录id, 不传或0不做限制                               |
| pageSize            | `number`    |        | 否   | 分页大小, 不传或0表示全部                                     |
| success             | `function`  |        | 否   | 接口调用成功的回调函数                                       |
| fail                | `function`  |        | 否   | 接口调用失败的回调函数                                       |

###### 返回结果

- **success**

返回 `RecordTransferResultListRes[]`，每项结构如下：

| 属性             | 类型      | 必有 | 说明                       |
| ---------------- | --------- | ---- | -------------------------- |
| recordTransferId | `number`  | 是   | 录音转写id                 |
| directoryId      | `number`  | 是   | 目录id                     |
| deviceUniqueId   | `string`  | 是   | 设备生成的录音文件唯一标识符|
| name             | `string`  | 是   | 文件名称                   |
| recordTime       | `number`  | 是   | 录音时间 时间戳 单位秒     |
| duration         | `number`  | 是   | 录音时长 单位毫秒          |
| recordType       | `number`  | 是   | 音频类型 0呼叫、1会议、2同声传译 |
| audioFormat      | `number`  | 是   | 音频格式                   |
| deviceId         | `string`  | 是   | 设备id                     |
| filePath         | `string`  | 否   | 录音文件路径               |
| wavFilePath      | `string`  | 否   | 录音wav文件路径            |
| amplitudes       | `string`  | 否   | 振幅字符串，以`,`分隔      |
| status           | `number`  | 是   | 文件同步状态 0未上传、1上传中、2已上传、3上传失败 |
| visit            | `boolean` | 是   | 是否已经点击过             |
| remove           | `boolean` | 是   | 是否被移除，移到垃圾桶     |
| storageKey       | `string`  | 否   | 云端存储的key              |
| transfer         | `number`  | 是   | 转录状态 0未转录、1转录中、2已转录、3转录失败 |
| source           | `number`  | 是   | 音频文件来源，0表示app，1表示设备 |
| transferType     | `number`  | 是   | 转写模式 0文件转写，1实时转写 |
| needTranslate    | `boolean` | 是   | 是否需要翻译               |
| originalLanguage | `string`  | 否   | 起始语言                   |
| targetLanguage   | `string`  | 否   | 目标语言                   |
| recordId         | `string`  | 否   | 实时转写记录id             |
| agentId          | `string`  | 否   | 实时转写智能体id           |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferResultList({
  success: (list) => {
    console.log('result list', list);
  },
  fail: (err) => {
    console.log('get list fail', err);
  }
});
```

###### 返回示例

```js
[
  {
    "recordTransferId": 1001,
    "directoryId": 1,
    "deviceUniqueId": "abc123",
    "name": "会议录音1",
    "recordTime": 1710000000,
    "duration": 60000,
    "recordType": 1,
    "audioFormat": 0,
    "deviceId": "123456",
    "filePath": "/path/to/file.wav",
    "wavFilePath": "/path/to/file.wav",
    "amplitudes": "0.1,0.2,0.3",
    "status": 2,
    "visit": false,
    "remove": false,
    "storageKey": "cloudkey",
    "transfer": 2,
    "source": 0,
    "transferType": 1,
    "needTranslate": true,
    "originalLanguage": "zh",
    "targetLanguage": "en",
    "recordId": "recid001",
    "agentId": "agent001"
  }
]
```
###### wear.updateRecordTransferResult

更新录音文件信息

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { updateRecordTransferResult } = wear;
```

###### 请求参数

**Object object**

| 属性            | 类型        | 默认值 | 必填 | 说明                                         |
| --------------- | ----------- | ------ | ---- | -------------------------------------------- |
| recordTransferId| `number`    |        | 是   | 录音转写id                                   |
| directoryId     | `string`    |        | 否   | 目录id, 不传表示不更新                       |
| name            | `string`    |        | 否   | 文件名称, 不传表示不更新                     |
| fileName        | `string`    |        | 否   | 录音文件名称, 不传表示不更新                 |
| wavFileName     | `string`    |        | 否   | 录音wav文件名称, 不传表示不更新              |
| amplitudes      | `string`    |        | 否   | 振幅字符串，以`,`分隔, 不传表示不更新        |
| status          | `string`    |        | 否   | 文件同步状态，0未上传、1上传中、2已上传、3上传失败, 不传表示不更新 |
| visit           | `string`    |        | 否   | 是否已经点击过, 不传表示不更新               |
| remove          | `string`    |        | 否   | 是否被移除，移到垃圾桶, 不传表示不更新       |
| storageKey      | `string`    |        | 否   | 云端存储的key, 不传表示不更新                |
| transfer        | `string`    |        | 否   | 转录状态，0未转录、1转录中、2已转录、3转录失败, 不传表示不更新 |
| success         | `function`  |        | 否   | 接口调用成功的回调函数                       |
| fail            | `function`  |        | 否   | 接口调用失败的回调函数                       |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
updateRecordTransferResult({
  recordTransferId: 1001,
  name: '新文件名',
  success: () => {
    console.log('update success');
  },
  fail: (err) => {
    console.log('update fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "更新失败",
  "errorCode": 1001,

}
```
###### wear.removeFileList

批量删除录音文件

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { removeFileList } = wear;
```

###### 请求参数

**Object object**

| 属性    | 类型         | 默认值 | 必填 | 说明                                             |
| ------- | ------------ | ------ | ---- | ------------------------------------------------ |
| fileIds | `number[]`   |        | 否   | 要删除的文件id数组                               |
| success | `function`   |        | 否   | 接口调用成功的回调函数                           |
| fail    | `function`   |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
removeFileList({
  fileIds: [123, 456, 789],
  success: () => {
    console.log('remove success');
  },
  fail: (err) => {
    console.log('remove fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "删除失败",
  "errorCode": 1001,
}
```

### 音频转写&总结

###### wear.getRecordTransferRealTimeResult

获取实时转写数据

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferRealTimeResult } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| fileId   | `string`   |        | 否   | 文件id                                           |
| recordId | `string`   |        | 否   | 实时转写记录id                                   |
| asrId    | `string`   |        | 否   | 查询小于等于asrId的数据                          |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

返回对象：

| 属性  | 类型                                   | 必有 | 说明           |
| ----- | -------------------------------------- | ---- | -------------- |
| list  | `RecordTransferRealTimeItem[]`         | 否   | 实时转写数据列表|

**RecordTransferRealTimeItem 结构**

| 属性            | 类型      | 必有 | 说明                                                         |
| --------------- | --------- | ---- | ------------------------------------------------------------ |
| asrId           | `number`  | 是   | asrId                                                        |
| recordTransferId| `number`  | 是   | 录音转写id                                                   |
| beginOffset     | `number`  | 是   | 开始偏移时间                                                 |
| endOffset       | `number`  | 是   | 结束偏移时间                                                 |
| text            | `string`  | 否   | 文案                                                         |
| requestId       | `string`  | 是   | 请求id                                                       |
| recordId        | `string`  | 是   | 实时转写记录id                                               |
| channel         | `number`  | 是   | 声道。会议模式只有0声道，电话/同传模式有0、1声道             |
| status          | `number`  | 是   | 转录状态，0未转录或转写中、1转录成功、2转录失败              |
| asr             | `string`  | 否   | asr文案                                                      |
| translate       | `string`  | 否   | translate文案                                                |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferRealTimeResult({
  recordId: 'recid001',
  asrId: '10',
  success: (res) => {
    console.log('real time result', res);
  },
  fail: (err) => {
    console.log('get real time result fail', err);
  }
});
```

###### 返回示例

```js
{
  "list": [
    {
      "asrId": 1,
      "recordTransferId": 1001,
      "beginOffset": 0,
      "endOffset": 2000,
      "text": "你好，世界",
      "requestId": "req001",
      "recordId": "recid001",
      "channel": 0,
      "status": 1,
      "asr": "你好，世界",
      "translate": "Hello, world"
    }
  ]
}
```
###### wear.saveRecordTransferRecognizeResult

保存转写结果

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { saveRecordTransferRecognizeResult } = wear;
```

###### 请求参数

**Object object**

| 属性             | 类型       | 默认值 | 必填 | 说明                   |
| ---------------- | ---------- | ------ | ---- | ---------------------- |
| recordTransferId | `number`   |        | 是   | 录音转写id             |
| text             | `string`   |        | 是   | 转写结果               |
| success          | `function` |        | 否   | 接口调用成功的回调函数 |
| fail             | `function` |        | 否   | 接口调用失败的回调函数 |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
saveRecordTransferRecognizeResult({
  recordTransferId: 1001,
  text: '你好，世界',
  success: () => {
    console.log('save success');
  },
  fail: (err) => {
    console.log('save fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "保存失败",
  "errorCode": 1001,
}
```
###### wear.saveRecordTransferSummaryResult

保存转写总结结果

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { saveRecordTransferSummaryResult } = wear;
```

###### 请求参数

**Object object**

| 属性             | 类型       | 默认值 | 必填 | 说明                   |
| ---------------- | ---------- | ------ | ---- | ---------------------- |
| recordTransferId | `number`   |        | 是   | 录音转写id             |
| text             | `string`   |        | 是   | 转写总结结果           |
| success          | `function` |        | 否   | 接口调用成功的回调函数 |
| fail             | `function` |        | 否   | 接口调用失败的回调函数 |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
saveRecordTransferSummaryResult({
  recordTransferId: 1001,
  text: '会议总结：本次会议讨论了项目进展和下阶段计划。',
  success: () => {
    console.log('save summary success');
  },
  fail: (err) => {
    console.log('save summary fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "保存失败",
  "errorCode": 1001,

}
```
###### wear.saveRecordTransferRealTimeRecognizeResult

更新实时转写结果

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { saveRecordTransferRealTimeRecognizeResult } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                   |
| -------- | ---------- | ------ | ---- | ---------------------- |
| asrId    | `number`   |        | 是   | 请求id                 |
| text     | `string`   |        | 否   | 文案                   |
| asr      | `string`   |        | 否   | asr文案                |
| translate| `string`   |        | 否   | translate文案          |
| success  | `function` |        | 否   | 接口调用成功的回调函数 |
| fail     | `function` |        | 否   | 接口调用失败的回调函数 |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
saveRecordTransferRealTimeRecognizeResult({
  asrId: 1,
  asr: '你好，世界',
  translate: 'Hello, world',
  success: () => {
    console.log('save success');
  },
  fail: (err) => {
    console.log('save fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "保存失败",
  "errorCode": 1001,
}
```
###### wear.getRecordTransferProcessStatus

查询录音转写文件的转写状态

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferProcessStatus } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型         | 默认值 | 必填 | 说明                                             |
| -------- | ------------ | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`     |        | 是   | 设备id                                           |
| fileIds  | `string[]`   |        | 是   | 文件id列表                                       |
| success  | `function`   |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function`   |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

返回对象：

| 属性    | 类型         | 必有 | 说明               |
| ------- | ------------ | ---- | ------------------ |
| success | `string[]`   | 是   | 转写成功的文件id列表 |
| fail    | `string[]`   | 是   | 转写失败的文件id列表 |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferProcessStatus({
  deviceId: '123456',
  fileIds: ['fileid1', 'fileid2'],
  success: (res) => {
    console.log('process status', res);
  },
  fail: (err) => {
    console.log('get status fail', err);
  }
});
```

###### 返回示例

```js
{
  "success": ["fileid1"],
  "fail": ["fileid2"]
}
```
###### wear.getRecordTransferRecognizeResult

查询录音转写结果

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferRecognizeResult } = wear;
```

###### 请求参数

**Object object**

| 属性             | 类型       | 默认值 | 必填 | 说明                       |
| ---------------- | ---------- | ------ | ---- | -------------------------- |
| recordTransferId | `number`   |        | 是   | 录音转写id                 |
| from             | `number`   |        | 是   | 来源：0本地 1云端           |
| success          | `function` |        | 否   | 接口调用成功的回调函数     |
| fail             | `function` |        | 否   | 接口调用失败的回调函数     |

###### 返回结果

- **success**

返回对象：

| 属性   | 类型     | 必有 | 说明         |
| ------ | -------- | ---- | ------------ |
| text   | `string` | 是   | JSON格式的转写结果文本数据 |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferRecognizeResult({
  recordTransferId: 1001,
  from: 1,
  success: (res) => {
    console.log('recognize result', res);
  },
  fail: (err) => {
    console.log('get recognize result fail', err);
  }
});
```

###### 返回示例

```js
{
  "text": "[{\"transcript\":\"你好，世界\",\"timeOffset\":\"3.11s\"},{\"transcript\":\"欢迎，使用\",\"timeOffset\":\"6.35s\"}]"
}
```
###### wear.processRecordTransferResult

对录音转写记录进行转写操作

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { processRecordTransferResult } = wear;
```

###### 请求参数

**Object object**

| 属性             | 类型       | 默认值 | 必填 | 说明                   |
| ---------------- | ---------- | ------ | ---- | ---------------------- |
| recordTransferId | `number`   |        | 是   | 录音转写id             |
| template         | `string`   |        | 是   | 模板                   |
| language         | `string`   |        | 是   | 语言                   |
| success          | `function` |        | 否   | 接口调用成功的回调函数 |
| fail             | `function` |        | 否   | 接口调用失败的回调函数 |

###### 返回结果

- **success**

无返回参数（`null`）

- **fail**

| 属性      | 类型     | 说明         |
| --------- | -------- | ------------ |
| errorMsg  | `string` | 插件错误信息 |
| errorCode | `string` | 错误码       |

###### 请求示例

```js
processRecordTransferResult({
  recordTransferId: 1001,
  template: 'summary',
  language: 'zh',
  success: () => {
    console.log('process success');
  },
  fail: (err) => {
    console.log('process fail', err);
  }
});
```

###### 返回示例

无（成功时无返回参数）

失败示例：

```js
{
  "errorMsg": "处理失败",
  "errorCode": 1001,
}
```
###### wear.getRecordTransferResultDetail

获取录音转写详情

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferResultDetail } = wear;
```

###### 请求参数

**Object object**

| 属性              | 类型       | 默认值 | 必填 | 说明                           |
| ----------------- | ---------- | ------ | ---- | ------------------------------ |
| recordTransferId  | `number`   |        | 是   | 录音转写id                     |
| amplitudeMaxCount | `string`   |        | 否   | 振幅最大个数                   |
| success           | `function` |        | 否   | 接口调用成功的回调函数         |
| fail              | `function` |        | 否   | 接口调用失败的回调函数         |

###### 返回结果

- **success**

返回 `RecordTransferResultListRes` 对象，结构如下：

| 属性             | 类型      | 必有 | 说明                       |
| ---------------- | --------- | ---- | -------------------------- |
| recordTransferId | `number`  | 是   | 录音转写id                 |
| directoryId      | `number`  | 是   | 目录id                     |
| deviceUniqueId   | `string`  | 是   | 设备生成的录音文件唯一标识符|
| name             | `string`  | 是   | 文件名称                   |
| recordTime       | `number`  | 是   | 录音时间 时间戳 单位秒     |
| duration         | `number`  | 是   | 录音时长 单位毫秒          |
| recordType       | `number`  | 是   | 音频类型 0呼叫、1会议、2同声传译 |
| audioFormat      | `number`  | 是   | 音频格式                   |
| deviceId         | `string`  | 是   | 设备id                     |
| filePath         | `string`  | 否   | 录音文件路径               |
| wavFilePath      | `string`  | 否   | 录音wav文件路径            |
| amplitudes       | `string`  | 否   | 振幅字符串，以`,`分隔      |
| status           | `number`  | 是   | 文件同步状态 0未上传、1上传中、2已上传、3上传失败 |
| visit            | `boolean` | 是   | 是否已经点击过             |
| remove           | `boolean` | 是   | 是否被移除，移到垃圾桶     |
| storageKey       | `string`  | 否   | 云端存储的key              |
| transfer         | `number`  | 是   | 转录状态 0未转录、1转录中、2已转录、3转录失败 |
| source           | `number`  | 是   | 音频文件来源，0表示app，1表示设备 |
| transferType     | `number`  | 是   | 转写模式 0文件转写，1实时转写 |
| needTranslate    | `boolean` | 是   | 是否需要翻译               |
| originalLanguage | `string`  | 否   | 起始语言                   |
| targetLanguage   | `string`  | 否   | 目标语言                   |
| recordId         | `string`  | 否   | 实时转写记录id             |
| agentId          | `string`  | 否   | 实时转写智能体id           |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferResultDetail({
  recordTransferId: 1001,
  success: (res) => {
    console.log('detail', res);
  },
  fail: (err) => {
    console.log('get detail fail', err);
  }
});
```

###### 返回示例

```js
{
  "recordTransferId": 1001,
  "directoryId": 1,
  "deviceUniqueId": "abc123",
  "name": "会议录音1",
  "recordTime": 1710000000,
  "duration": 60000,
  "recordType": 1,
  "audioFormat": 0,
  "deviceId": "123456",
  "filePath": "/path/to/file.wav",
  "wavFilePath": "/path/to/file.wav",
  "amplitudes": "0.1,0.2,0.3",
  "status": 2,
  "visit": false,
  "remove": false,
  "storageKey": "cloudkey",
  "transfer": 2,
  "source": 0,
  "transferType": 1,
  "needTranslate": true,
  "originalLanguage": "zh",
  "targetLanguage": "en",
  "recordId": "recid001",
  "agentId": "agent001"
}
```
###### wear.getRecordTransferSummaryResult

查询录音转写总结

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { getRecordTransferSummaryResult } = wear;
```

###### 请求参数

**Object object**

| 属性             | 类型       | 默认值 | 必填 | 说明                       |
| ---------------- | ---------- | ------ | ---- | -------------------------- |
| recordTransferId | `number`   |        | 是   | 录音转写id                 |
| from             | `number`   |        | 是   | 来源：0本地 1云端           |
| success          | `function` |        | 否   | 接口调用成功的回调函数     |
| fail             | `function` |        | 否   | 接口调用失败的回调函数     |

###### 返回结果

- **success**

返回对象：

| 属性   | 类型     | 必有 | 说明         |
| ------ | -------- | ---- | ------------ |
| text   | `string` | 是   | JSON格式的总结文案     |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
getRecordTransferSummaryResult({
  recordTransferId: 1001,
  from: 1,
  success: (res) => {
    console.log('summary result', res);
  },
  fail: (err) => {
    console.log('get summary result fail', err);
  }
});
```

###### 返回示例

```js
{
  "text": "{\"summary\":\"你好，世界\"}"
}
```
###### wear.recordTransferTask

获取录音转写任务信息

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { recordTransferTask } = wear;
```

###### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `number`   |        | 是   | 设备id                                           |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 返回结果

- **success**

返回 `task` 对象，结构如下：

| 属性                | 类型      | 必有 | 说明                                         |
| ------------------- | --------- | ---- | -------------------------------------------- |
| state               | `number`  | 是   | 状态，0未知，1录音中，2暂停，3结束           |
| userRecordDuration  | `number`  | 是   | 用户录音时间，单位毫秒                       |
| recordType          | `number`  | 是   | 音频类型 0呼叫 1会议 2同声传译               |
| transferType        | `number`  | 是   | 转写模式 0文件转写，1实时转写                 |
| needTranslate       | `boolean` | 是   | 是否需要翻译                                 |
| originalLanguage    | `string`  | 否   | 起始语言/左耳语言                            |
| targetLanguage      | `string`  | 否   | 目标语言/右耳语言                            |
| isStarting          | `boolean` | 是   | 是否正在开始中                               |
| isPausing           | `boolean` | 是   | 是否正在暂停中                               |
| isResuming          | `boolean` | 是   | 是否正在恢复中                               |
| isStoping           | `boolean` | 是   | 是否正在结束中                               |
| currentRealTimeAsrId| `string`  | 否   | 当前正在实时转写的asrId                      |
| recordId            | `string`  | 否   | 实时转写记录id                               |

- **fail**

| 属性       | 类型                | 说明                                                          |
| ---------- | ------------------- | ------------------------------------------------------------- |
| errorMsg   | `string`            | 插件错误信息                                                  |
| errorCode  | `string`   | 错误码                                                        |

###### 请求示例

```js
recordTransferTask({
  deviceId: 123456,
  success: (res) => {
    console.log('task info', res);
  },
  fail: (err) => {
    console.log('get task fail', err);
  }
});
```

###### 返回示例

```js
{
  "task": {
    "state": 1,
    "userRecordDuration": 60000,
    "recordType": 1,
    "transferType": 1,
    "needTranslate": true,
    "originalLanguage": "zh",
    "targetLanguage": "en",
    "isStarting": false,
    "isPausing": false,
    "isResuming": false,
    "isStoping": false,
    "currentRealTimeAsrId": "asr123",
    "recordId": "recid001"
  }
}
```

### 音频相关事件

###### wear.onRecordTransferRealTimeRecognizeStatusUpdateEvent

实时翻译录音事件通知监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { onRecordTransferRealTimeRecognizeStatusUpdateEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 传入监听的回调函数 |

**Params 结构**

| 属性         | 类型      | 说明                       |
| ------------ | --------- | -------------------------- |
| deviceId     | `string`  | 设备id                     |
| recordId     | `string`  | 实时转写记录id             |
| requestId    | `string`  | 实时转写请求id             |
| asrId        | `number`  | 实时转写asrId              |
| channel      | `number`  | 声道                       |
| phase        | `number`  | 阶段 0任务 1收音 2发数据... |
| status       | `number`  | 阶段状态 0未开启 1进行中... |
| text         | `string`  | 文本                       |
| beginOffset  | `number`  | 开始时间，单位毫秒         |
| endOffset    | `number`  | 结束时间，单位毫秒         |
| errorCode    | `number`  | 错误码                     |
| errorMessage | `string`  | 错误消息（可选）           |

###### 返回结果

- 无

###### 示例代码

```js
onRecordTransferRealTimeRecognizeStatusUpdateEvent((params) => {
  console.log('实时转写状态变更', params);
  /*
  params: {
    deviceId: "123456",
    recordId: "abc123",
    requestId: "req789",
    asrId: 1,
    channel: 0,
    phase: 1,
    status: 1,
    text: "你好",
    beginOffset: 0,
    endOffset: 1000,
    errorCode: 0,
    errorMessage: ""
  }
  */
});
```

###### 返回示例

- 无
###### wear.onRecordTransferStatusUpdateEvent

录音状态变更事件监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { onRecordTransferStatusUpdateEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 传入监听的回调函数 |

**Params 结构**

| 属性        | 类型      | 说明           |
| ----------- | --------- | -------------- |
| deviceId    | `string`  | 设备id         |
| state       | `number`  | 状态，0未知，1录音中，2暂停，3结束 |
| isStarting  | `boolean` | 是否正在开始中 |
| isPausing   | `boolean` | 是否正在暂停中 |
| isResuming  | `boolean` | 是否正在恢复中 |
| isStoping   | `boolean` | 是否正在结束中 |

###### 返回结果

- 无

###### 示例代码

```js
onRecordTransferStatusUpdateEvent((params) => {
  console.log('录音状态变更', params);
  /*
  params: {
    "deviceId": "123456",
    "state": 1,
    "isStarting": true,
    "isPausing": false,
    "isResuming": false,
    "isStoping": false
  }
  */
});
```

###### 返回示例

- 无
###### wear.onRecordTransferFinishEvent

录音结束的通知事件监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { onRecordTransferFinishEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 传入监听的回调函数 |

**Params 结构**

| 属性      | 类型      | 说明         |
| --------- | --------- | ------------ |
| deviceId  | `string`  | 设备id       |
| code      | `number`  | 错误码       |
| message   | `string`  | 错误消息，可选 |

###### 返回结果

- 无

###### 示例代码

```js
onRecordTransferFinishEvent((params) => {
  console.log('录音结束', params);
  /*
  params: {
    "deviceId": "123456",
    "code": 0,
    "message": "录音正常结束"
  }
  */
});
```

###### 返回示例

- 无
###### wear.offRecordTransferRealTimeRecognizeStatusUpdateEvent

移除实时翻译录音事件通知监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { offRecordTransferRealTimeRecognizeStatusUpdateEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 需要移除的监听回调函数 |

**Params 结构**

| 属性         | 类型      | 说明                       |
| ------------ | --------- | -------------------------- |
| deviceId     | `string`  | 设备id                     |
| recordId     | `string`  | 实时转写记录id             |
| requestId    | `string`  | 实时转写请求id             |
| asrId        | `number`  | 实时转写asrId              |
| channel      | `number`  | 声道                       |
| phase        | `number`  | 阶段 0任务 1收音 2发数据... |
| status       | `number`  | 阶段状态 0未开启 1进行中... |
| text         | `string`  | 文本                       |
| beginOffset  | `number`  | 开始时间，单位毫秒         |
| endOffset    | `number`  | 结束时间，单位毫秒         |
| errorCode    | `number`  | 错误码                     |
| errorMessage | `string`  | 错误消息（可选）           |

###### 返回结果

- 无

###### 示例代码

```js
const listener = (params) => {
  console.log('实时转写状态变更', params);
};
wear.onRecordTransferRealTimeRecognizeStatusUpdateEvent(listener);

// ...后续需要移除监听时
wear.offRecordTransferRealTimeRecognizeStatusUpdateEvent(listener);
```

###### 返回示例

- 无
###### wear.offRecordTransferStatusUpdateEvent

移除录音状态变更事件监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { offRecordTransferStatusUpdateEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 需要移除的监听回调函数 |

**Params 结构**

| 属性        | 类型      | 说明           |
| ----------- | --------- | -------------- |
| deviceId    | `string`  | 设备id         |
| state       | `number`  | 状态，0未知，1录音中，2暂停，3结束 |
| isStarting  | `boolean` | 是否正在开始中 |
| isPausing   | `boolean` | 是否正在暂停中 |
| isResuming  | `boolean` | 是否正在恢复中 |
| isStoping   | `boolean` | 是否正在结束中 |

###### 返回结果

- 无

###### 示例代码

```js
const listener = (params) => {
  console.log('录音状态变更', params);
};
wear.onRecordTransferStatusUpdateEvent(listener);

// ...后续需要移除监听时
wear.offRecordTransferStatusUpdateEvent(listener);
```

###### 返回示例

- 无
###### wear.offRecordTransferFinishEvent

移除录音结束的通知事件监听

> 需引入`WearKit`，且在`>=1.1.6`版本才可使用

###### 引入

```js
// @ray-js/ray >=1.7.14
import { wear } from '@ray-js/ray';
const { offRecordTransferFinishEvent } = wear;
```

###### 请求参数

**Function listener**

| 属性    | 类型     | 说明         |
| ------- | -------- | ------------ |
| callBack  | (params: Params)=>void | 需要移除的监听回调函数 |

**Params 结构**

| 属性      | 类型      | 说明         |
| --------- | --------- | ------------ |
| deviceId  | `string`  | 设备id       |
| code      | `number`  | 错误码       |
| message   | `string`  | 错误消息，可选 |

###### 返回结果

- 无

###### 示例代码

```js
const listener = (params) => {
  console.log('录音结束', params);
};
wear.onRecordTransferFinishEvent(listener);

// ...后续需要移除监听时
wear.offRecordTransferFinishEvent(listener);
```

###### 返回示例

- 无

## AI 宠物


### 宠物媒体文件编辑

###### fetchPetAudios

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

###### 描述

获取宠物媒体文件

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |

###### 返回值

类型: `Promise<Object>`

返回 Promise，resolve 值为Audio数组
| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `Audio[]` | 是 | 音频 |

###### 引用对象

###### `type` Audio

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileNo` | `string` | 是 | 云存文件 id（与上传、下载、删除等接口中的 fileNo 一致） |
| `fileName` | `string` | 是 | 展示用文件名 |
| `publicUrl` | `string` | 否 | 可公开访问��云存文件地址（若有） |

###### 示例代码

###### 请求示例

```typescript
import { fetchPetAudios } from '@tuya-miniapp/cloud-api';

fetchPetAudios('vdevo167504******003')
  .then((res) => {
    console.log(res.data);
  })
  .catch();
```

###### 返回示例

```json
{
  "data": [
    {
      "fileNo": "file-no-1",
      "fileName": "bark.wav",
      "publicUrl": "https://example.com/storage/bark.wav"
    }
  ]
}
```
###### fileRelationSave

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

###### 描述

保存宠物媒体文件

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileInfo` | `FileInfo` | 是 | 文件信息：objectKey、fileName |
| `devId` | `string` | 是 | 设备 id |

###### FileInfo

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `objectKey` | `string` | 是 | - | 对象存储 objectKey（上传完成后由存储侧返回） |
| `fileName` | `string` | 是 | - | 文件名（含扩展名，如 `clip.wav`） |

###### 返回值

类型: `Promise<boolean>`

boolean

###### 示例代码

###### 请求示例

```typescript
import { fileRelationSave } from '@tuya-miniapp/cloud-api';

fileRelationSave(
  { objectKey: 'your-object-key', fileName: 'clip.wav' },
  'vdevo167504******003'
)
  .then((res) => {
    console.log(res.token, res.action);
  })
  .catch();
```

###### 返回示例

```json
true
```
###### notifyDownload

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

###### 描述

宠物媒体文件下载

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileNo` | `string` | 是 | 云存文件 id |
| `devId` | `string` | 是 | 设备 id |

###### 返回值

类型: `Promise<boolean>`

boolean

###### 示例代码

###### 请求示例

```typescript
import { notifyDownload } from '@tuya-miniapp/cloud-api';

notifyDownload('cloud-file-id', 'vdevo167504******003')
  .then((ok) => {
    console.log(ok);
  })
  .catch();
```

###### 返回示例

```json
true
```
###### deleteDeviceFile

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

###### 描述

删除宠物媒体文件

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileNos` | `string[]` | 是 | 需删除云存文件 id 列表 |
| `devId` | `string` | 是 | 设备 id |

###### 返回值

类型: `Promise<boolean>`

删除结果（boolean）

###### 示例代码

###### 请求示例

```typescript
import { deleteDeviceFile } from '@tuya-miniapp/cloud-api';

deleteDeviceFile(['cloud-file-id-1', 'cloud-file-id-2'], 'vdevo167504******003')
  .then((ok) => {
    console.log(ok);
  })
  .catch();
```

###### 返回示例

```json
true
```
#### getPetList

获取宠物列表

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getPetList } from '@ray-js/ray';
```

**参数**

**GetPetList**

| 属性          | 类型      | 必填 | 说明         |
| ------------ | -------- | ---- | ------------ |
| ownerId      | `string` | 是   | 家庭 ID      |
| bizTypes     | `number[]` | 否   | 业务类型，1-宠物中心，2-宠物AI，默认为2    |

**返回**

**GetPetListResult**

|  属性     |  类型     | 说明     |
| -------- | -------- | -------- |
| result   | `Pet[]`  | 宠物信息 |

**Pet 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| id              | `number`   | 宠物 ID                   |
| ownerId         | `string`   | 家庭 ID                   |
| petType         | `string`   | 宠物类型：cat-猫，dog-狗    |
| name            | `string`   | 宠物名字，不能超过40个字符    |
| avatar          | `string`   | 宠物头像路径，以 "smart/" 开头  |
| avatarDisplay   | `string`   | 宠物头像可访问路径            |
| sex             | `number`   | 性别. 0-雌性, 1-雄性, 2-绝育雌性, 3-绝育雄性    |
| activeness      | `number`   | 活跃度，0-不活跃，1-正常，2-非常活跃            |
| birth           | `number`   | 生日, 单位: 毫秒            |
| weight          | `number`   | 体重，单位为g               |
| breedCode       | `string`   | 品种code                   |
| breedName       | `string`   | 品种名称                    |
| rfid            | `string`   | rfid                       |
| extInfo         | `string`   | 额外信息，不要放敏感信息       |
| bindFood        | `boolean`  | 是否绑定宠物粮食              |
| gmtCreate       | `number`   | 创建时间戳，单位毫秒           |
| gmtModified     | `number`   | 修改时间戳，单位毫秒           |

**函数定义**

```typescript
function getPetList(data: GetPetList): Promise<GetPetListResult>;
```

**请求示例**

```jsx
import { getPetList } from '@ray-js/ray';

getPetList({
  ownerId: 'xxxx',
  bizTypes: [2],
});
```

**成功示例**

```json
[
  {
    "id": 1,
    "ownerId": "xxxx",
    "petType": "cat",
    "name": "福宝",
    "avatar": "smart/xxxx/xxxx/xxxx",
    "avatarDisplay": "https://xxx/xxx",
    "sex": 1,
    "activeness": 1,
    "birth": 1614528000000,
    "weight": 5000,
    "breedCode": "xxx",
    "breedName": "金吉拉",
    "rfid": "xxxxx",
    "extInfo": "",
    "bindFood": false,
    "gmtCreate": 1740792022716,
    "gmtModified": 1741785184589,
  }
]
```
#### getPetDetail

获取宠物详情

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getPetDetail } from '@ray-js/ray';
```

**参数**

**GetPetDetail**

| 属性          | 类型      | 必填 | 说明         |
| ------------ | -------- | ---- | ------------ |
| ownerId      | `string` | 是   | 家庭 ID      |
| id           | `number` | 是   | 宠物 ID      |

**返回**

**PetDetail**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| id              | `number`   | 宠物 ID                   |
| ownerId         | `string`   | 家庭 ID                   |
| petType         | `string`   | 宠物类型：cat-猫，dog-狗    |
| name            | `string`   | 宠物名字，不能超过40个字符    |
| avatar          | `string`   | 宠物头像路径，以 "smart/" 开头  |
| avatarDisplay   | `string`   | 宠物头像可访问路径            |
| sex             | `number`   | 性别. 0-雌性, 1-雄性, 2-绝育雌性, 3-绝育雄性    |
| activeness      | `number`   | 活跃度，0-不活跃，1-正常，2-非常活跃   |
| birth           | `number`   | 生日, 单位: 毫秒            |
| weight          | `number`   | 体重，单位为g               |
| breedCode       | `string`   | 品种code                   |
| breedName       | `string`   | 品种名称                    |
| rfid            | `string`   | rfid                       |
| extInfo         | `string`   | 额外信息，不要放敏感信息       |
| idPhotos        | `IdPhotos[]` | 宠物正面照                  |
| features        | `Feature[]` | 宠物特征code                |
| personalities   | `string[]`  | 宠物性格code                  |
| devIds          | `string[]`  | 关联的设备IDs               |
| relationFood    | `Food`      | 关联的主粮信息                |
| weightType      | `number`    | 体型，0-偏轻，1-正常，2-偏重（需关联主粮、品种等信息）  |
| dailyCalorie    | `number`    | 日推荐卡路里，单位：Kcal（需关联主粮、品种等信息）      |
| dailyFeeding    | `number`    | 日推荐喂食量，单位：g（需关联主粮、品种等信息）         |
| gmtCreate       | `number`   | 创建时间戳，单位毫秒           |
| gmtModified     | `number`   | 修改时间戳，单位毫秒           |

**IdPhotos 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| objectKey       | `string`   | 图片objectKey             |
| display         | `string`   | 图片访问链接               |
| angle           | `string`   | 角度code                  |

**Feature 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| category        | `string`   | 特征类别                  |
| details         | `string[]` | 特征详情                  |

**Food 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| id              | `number`   | 主粮 ID                   |
| name            | `string`   | 主粮名称                  |

**函数定义**

```typescript
function getPetDetail(data: GetPetDetail): Promise<PetDetail>;
```

**请求示例**

```jsx
import { getPetDetail } from '@ray-js/ray';

getPetDetail({
  ownerId: 'xxxx',
  id: 1,
});
```

**成功示例**

```json
{
  "id": 1,
  "ownerId": "xxxx",
  "petType": "cat",
  "name": "福宝",
  "avatar": "smart/xxxx/xxxx/xxxx",
  "avatarDisplay": "https://xxx/xxx",
  "sex": 1,
  "activeness": 1,
  "birth": 1614528000000,
  "weight": 5000,
  "breedCode": "xxx",
  "breedName": "金吉拉",
  "rfid": "xxxxx",
  "extInfo": "",
  "idPhotos": [
    {
      "angle": "firstFront",
      "display": "https://xxx/xxx",
      "objectKey": "xxxx",
    }
  ],
  "features": [
    {
      "category": "eyeColor",
      "details": ["棕色"],
    }
  ],
  "personalities": ["independent"],
  "relationFood": {
    "id": 22,
    "name": "xxx",
  },
  "weightType": 1,
  "dailyCalorie": 62.7,
  "dailyFeeding": 191,
  "gmtCreate": 1740792022716,
  "gmtModified": 1741785184589,
}
```
#### addPet

新增宠物

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { addPet } from '@ray-js/ray';
```

**参数**

**PetAdd**

| 属性          | 类型         | 必填 | 说明                                         |
| ------------- | ------------ | ---- | -------------------------------------------- |
| bizType       | `number`     | 否   | 业务类型，1-宠物中心，2-宠物助手，默认为2    |
| ownerId       | `string`     | 是   | 家庭 ID                                      |
| petType       | `string`     | 是   | 宠物类型：cat-猫，dog-狗                     |
| name          | `string`     | 是   | 宠物名字，不能超过40个字符                   |
| avatar        | `string`     | 否   | 宠物头像路径，以 "smart/" 开头               |
| sex           | `number`     | 是   | 性别. 0-雌性, 1-雄性, 2-绝育雌性, 3-绝育雄性 |
| activeness    | `number`     | 是   | 活跃度，0-不活跃，1-正常，2-非常活跃         |
| birth         | `number`     | 否   | 生日, 单位: 毫秒                             |
| weight        | `number`     | 是   | 体重，单位为g                                |
| breedCode     | `string`     | 是   | 品种code(从宠物品种列表接口获取)             |
| rfid          | `string`     | 否   | rfid                                         |
| foodId        | `number`     | 否   | 关联主粮 ID                                  |
| extInfo       | `string`     | 否   | 额外信息，不要放敏感信息                     |
| idPhotos      | `IdPhotos[]` | 否   | 宠物正面照                                   |
| features      | `Feature[]`  | 否   | 宠物特征code                                 |
| personalities | `string[]`   | 否   | 宠物性格code                                 |
| timeZone      | `string`     | 是   | 时区                                         |
| dataType      | `string`     | 是   | 业务数据类型                                 |

**IdPhotos 说明**

| 属性      | 类型     | 说明          |
| --------- | -------- | ------------- |
| objectKey | `string` | 图片objectKey |
| angle     | `string` | 角度code      |

**Feature 说明**

| 属性     | 类型       | 说明     |
| -------- | ---------- | -------- |
| category | `string`   | 特征类别 |
| details  | `string[]` | 特征详情 |

**返回**

**AddPetResult**

| 属性   | 类型     | 说明    |
| ------ | -------- | ------- |
| result | `number` | 宠物 ID |

**函数定义**

```typescript
function addPet(data: PetAdd): Promise<AddPetResult>;
```

**请求示例**

```jsx
import { addPet } from '@ray-js/ray';

addPet({
  bizType: 1,
  ownerId: "xxxx",
  petType: "cat",
  name: "福宝",
  avatar: "smart/xxxx/xxxx/xxxx",
  sex: 1,
  activeness: 1,
  birth: 1614528000000,
  weight: 5000,
  breedCode: "xxx",
  idPhotos: [
    {
      angle: "firstFront",
      objectKey: "xxxx",
    }
  ],
  features: [
    {
      category: "eyeColor",
      details: ["棕色"],
    }
  ],
});
```

**成功示例**

```json
2
```
#### updatePet

更新宠物

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { updatePet } from '@ray-js/ray';
```

**参数**

**PetUpdate**

| 属性          | 类型         | 必填 | 说明                                         |
| ------------- | ------------ | ---- | -------------------------------------------- |
| id            | `number`     | 是   | 宠物 ID                                      |
| ownerId       | `string`     | 是   | 家庭 ID                                      |
| petType       | `string`     | 否   | 宠物类型：cat-猫，dog-狗                     |
| name          | `string`     | 否   | 宠物名字，不能超过40个字符                   |
| avatar        | `string`     | 否   | 宠物头像路径，以 "smart/" 开头               |
| sex           | `number`     | 否   | 性别. 0-雌性, 1-雄性, 2-绝育雌性, 3-绝育雄性 |
| activeness    | `number`     | 否   | 活跃度，0-不活跃，1-正常，2-非常活跃         |
| birth         | `number`     | 否   | 生日, 单位: 毫秒                             |
| weight        | `number`     | 否   | 体重，单位为g                                |
| breedCode     | `string`     | 否   | 品种code(从宠物品种列表接口获取)             |
| rfid          | `string`     | 否   | rfid                                         |
| foodId        | `number`     | 否   | 关联主粮 ID                                  |
| extInfo       | `string`     | 否   | 额外信息，不要放敏感信息                     |
| idPhotos      | `IdPhotos[]` | 否   | 宠物正面照                                   |
| features      | `Feature[]`  | 否   | 宠物特征code                                 |
| personalities | `string[]`   | 否   | 宠物性格code                                 |
| timeZone      | `string`     | 是   | 时区                                         |
| dataType      | `string`     | 是   | 业务数据类型                                 |

**IdPhotos 说明**

| 属性      | 类型     | 说明          |
| --------- | -------- | ------------- |
| objectKey | `string` | 图片objectKey |
| angle     | `string` | 角度code      |

**Feature 说明**

| 属性     | 类型       | 说明     |
| -------- | ---------- | -------- |
| category | `string`   | 特征类别 |
| details  | `string[]` | 特征详情 |

**返回**

**UpdatePetResult**

| 属性   | 类型      | 说明     |
| ------ | --------- | -------- |
| result | `boolean` | 处理结果 |

**函数定义**

```typescript
function updatePet(data: PetUpdate): Promise<UpdatePetResult>;
```

**请求示例**

```jsx
import { updatePet } from '@ray-js/ray';

updatePet({
  id: 1,
  ownerId: "xxxx",
  petType: "cat",
  name: "福宝",
  avatar: "smart/xxxx/xxxx/xxxx",
  sex: 1,
  activeness: 1,
  birth: 1614528000000,
  weight: 5000,
  breedCode: "xxx",
  idPhotos: [
    {
      angle: "firstFront",
      objectKey: "xxxx",
    }
  ],
  features: [
    {
      category: "eyeColor",
      details: ["棕色"],
    }
  ],
});
```

**成功示例**

```json
true
```
#### deletePet

删除宠物

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { deletePet } from '@ray-js/ray';
```

**参数**

**PetDelete**

| 属性     | 类型     | 必填 | 说明         |
| -------- | -------- | ---- | ------------ |
| id       | `number` | 是   | 宠物 ID      |
| ownerId  | `string` | 是   | 家庭 ID      |
| dataType | `string` | 是   | 业务数据类型 |

**返回**

**DeletePetResult**

| 属性   | 类型      | 说明     |
| ------ | --------- | -------- |
| result | `boolean` | 处理结果 |

**函数定义**

```typescript
function deletePet(data: PetDelete): Promise<DeletePetResult>;
```

**请求示例**

```jsx
import { deletePet } from '@ray-js/ray';

deletePet({
  id: 1,
  ownerId: "xxxx",
});
```

**成功示例**

```json
true
```
#### analyzePetFeature

宠物特征分析

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { analyzePetFeature } from '@ray-js/ray';
```

**参数**

**PetFeatureAnalyze**

| 属性               | 类型      | 必填 | 说明                                   |
| ----------------- | --------  | ---- | ------------------------------------- |
| miniAppId         | `string`  | 是   | 涂鸦小程序 ID                           |
| agentId           | `string`  | 是   | 智能体 ID                              |
| ownerId           | `string`  | 是   | 家庭 ID                                |
| images            | `Image[]` | 是   | 图片信息                                |

**Image 说明**

| 属性               | 类型      | 必填 | 说明                                   |
| ----------------- | --------  | ---- | ------------------------------------- |
| objectKey         | `string`  | 是   | 图片objectKey                          |

**返回**

**PetFeatureAnalyzeTask**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| result          | `string`   | 任务Id                   |

**函数定义**

```typescript
function analyzePetFeature(data: PetFeatureAnalyze): Promise<PetFeatureAnalyzeTask>;
```

**请求示例**

```jsx
import { analyzePetFeature } from '@ray-js/ray';

analyzePetFeature({
  miniAppId: "xxxx",
  agentId: "xxxx",
  ownerId: "xxxx",
  images: [
    {
      objectKey: 'xxxx',
    }
  ]
});
```

**成功示例**

```json
"xxxxxxx"
```
#### getAnalyzePetFeatureResult

获取宠物特征分析结果

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getAnalyzePetFeatureResult } from '@ray-js/ray';
```

**参数**

**getAnalyzePetFeatureResultParam**

| 属性               | 类型      | 必填 | 说明                                   |
| ----------------- | --------  | ---- | ------------------------------------- |
| taskId            | `string`  | 是   | 任务id                                  |
| type              | `string`  | 是   | 类型，0-宠物特征，1-食物成分，2-相似度检测   |

**返回**

**PetFeatureAnalyzeResult**

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| analysisResult  | `number`   | 分析结果，0-加载中，1-失败，2-成功        |
| ...             | `...`      | 宠物特征/食物成分其他字段/相似度检测结果    |

**宠物特征相关字段说明**

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| images          | `Images[]` | 图片分析结果                           |
| feature         | `Feature[]`| 特征code                              |
| petType         | `string`   | 宠物类型：cat-猫，dog-狗                |

Images 说明

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| objectKey       | `string`   | 图片objectKey                        |
| angle           | `string`   | 图片角度code                          |
| desc            | `string`   | 图片分析描述                           |

Feature 说明

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| category        | `string`   | 特征类别                  |
| details         | `string[]` | 特征详情                  |

**食物成分相关字段说明**

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| name            | `string`   | 品牌名称                               |
| protein         | `string`   | 粗蛋白含量                              |
| fat             | `string`   | 粗脂肪含量                             |
| fiber           | `string`   | 粗纤维含量                             |

**宠物相似度检测相关字段说明**

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| hasMatch        | `boolean`  | 是否有相似的                           |
| matchedPet      | `Pet[]`    | 相似的宠物                              |

Pet 说明

|  属性            |  类型      | 说明                                  |
| --------------- | ---------- | ------------------------------------ |
| petId           | `number`   | 宠物Id                                |
| petName         | `string`   | 宠物名称                              |
| similarity      | `number`   | 相似度                                |

**函数定义**

```typescript
function getAnalyzePetFeatureResult(data: getAnalyzePetFeatureResultParam): Promise<PetFeatureAnalyzeResult>;
```

**请求示例**

```jsx
import { getAnalyzePetFeatureResult } from '@ray-js/ray';

getAnalyzePetFeatureResult({
  taskId: 'xxxx',
  type: '0',
});
```

**成功示例**

```json
{
  "analysisResult": 2,
  "features": [
    {
      "category": "eyeColor",
      "details": ["深棕色"],
    }
  ], 
  "images": [
    {
      "angle": "firstFront",
      "desc": "xxxxx",
      "objectKey": "xxx"
    }
  ]
}
```
#### getPetBreedList

获取宠物品种

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getPetBreedList } from '@ray-js/ray';
```

**参数**

**GetPetBreedList**

| 属性               | 类型      | 必填 | 说明                                     |
| ----------------- | --------  | ---- | -------------------------------------   |
| petType           | `string`  | 是   | 宠物品种类型，cat-猫，dog-狗                |

**返回**

**PetBreedListResult**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| result          | `Breed[]`  | 品种信息列表               |

**Breed 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| breedCode       | `string`   | 品种code                  |
| name            | `string`   | 品种多语言名称              |
| headerChar      | `string`   | 宠物名称首字母，中英文才有    |

**函数定义**

```typescript
function getPetBreedList(data: GetPetBreedList): Promise<PetBreedListResult>;
```

**请求示例**

```jsx
import { getPetBreedList } from '@ray-js/ray';

getPetBreedList({
  petType: 'dog',
});
```

**成功示例**

```json
[
  {
    "breedCode": "xxx",
    "name": "阿根廷杜高犬",
    "headerChar": "A",
  }
]
```
#### getPetUploadSign

获取宠物文件上传签名

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getPetUploadSign } from '@ray-js/ray';
```

**参数**

**GetPetUploadSign**

| 属性               | 类型      | 必填 | 说明                                     |
| ----------------- | --------  | ---- | -------------------------------------   |
| bizType           | `string`  | 是   | 业务类型，pet-宠物头像，petFeature-宠物特征，temp-临时文件，分析食物成分               |
| fileName          | `string`  | 是   | 文件名称，带扩展名，如xxx.png              |

**返回**

**GetPetUploadSignResult**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| objectKey       | `string`   | 文件objectKey             |
| url             | `string`   | 待上传url                 |
| headers         | `Object`   | 上传headers            |

**函数定义**

```typescript
function getPetUploadSign(data: GetPetUploadSign): Promise<GetPetUploadSignResult>;
```

**请求示例**

```jsx
import { getPetUploadSign } from '@ray-js/ray';

getPetUploadSign({
  bizType: 'pet',
  fileName: 'test.png',
});
```

**成功示例**

```json
{
  "objectKey": "xxx",
  "url": "xxxx",
  "headers": {},
}
```
#### getPetEatingList

获取宠物进食记录

**引入**

> `@ray-js/ray^1.6.27` 且基础库版本 `2.27.0` 以上版本可使用

```js
import { getPetEatingList } from '@ray-js/ray';
```

**参数**

**GetPetEatingList**

| 属性          | 类型     | 必填  | 说明                       |
| ------------ | -------- | ---- | ------------              |
| ownerId      | `string` | 是   | 家庭 ID                    |
| devId        | `string` | 否   | 设备id（按设备的uuid查询）    |
| petId        | `number` | 否   | 宠物id                     |
| startTime    | `number` | 否   | 查询开始时间，单位：毫秒       |
| endTime      | `number` | 否   | 查询结束时间，单位：毫秒       |
| pageNo       | `number` | 是   | 页码，从1开始                |
| pageSize     | `number` | 是   | 每页大小                    |

**返回**

**PetEatingResult**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| totalCount      | `number`   | 总记录条数                 |
| pageNo          | `number`   | 分页页号                  |
| pageSize        | `number`   | 分页大小                  |
| hasNext         | `boolean`  | 是否还有下一页             |
| data            | `EatingItem[]`  | 进食信息             |

**EatingItem 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| recordNo        | `string`   | 记录no                    |
| devId           | `string`   | 设备id                    |
| deviceName      | `string`   | 设备名称（快照）            |
| ownerId         | `string`   | 家庭id                    |
| roomId          | `string`   | 房间id（快照）             |
| roomName        | `string`   | 房间名称（快照）            |
| recordTime      | `number`   | 记录时间，单位：毫秒         |
| isEncrypted     | `number`   | 文件是否加密，0-否，1-是      |
| videoCoverDisplay  | `string`  | 视频封面可访问地址，有效期：30-60min         |
| videoDisplay    | `string`   | 视频可访问地址，有效期：30-60min          |
| petAction       | `string`   | 行为                     |
| pets            | `Pet[]`   | 关联的宠物信息               |

**Pet 说明**

|  属性            |  类型      | 说明                      |
| --------------- | ---------- | ------------------------ |
| petId           | `number`   | 宠物id                    |
| petName         | `string`   | 宠物名称                   |

**函数定义**

```typescript
function getPetEatingList(data: GetPetEatingList): Promise<PetEatingResult>;
```

**请求示例**

```jsx
import { getPetEatingList } from '@ray-js/ray';

getPetEatingList({
  ownerId: 'xxxx',
  pageNo: 1,
  pageSize: 10,
});
```

**成功示例**

```json
{
  "totalCount": 100,
  "pageNo": 1,
  "pageSize": 10,
  "hasNext": true,
  "data": [
    {
      "recordNo": "22",
      "devId": "vdevo123456",
      "ownerId": "xxxx",
      "isEncrypted": 0,
      "videoCoverDisplay": "https://xxxx/xxxx",
      "videoDisplay": "https://xxxx/xxxx",
      "petAction": "eating",
      "pets": [
        {
          "petId": 2,
          "petName": "福宝",
        }
      ]
    }
  ]
}
```
#### getAiFilterTemplates

获取宠物写真 AI 模板

**引入**

> `@ray-js/ray^1.7.30` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getAiFilterTemplates } from '@ray-js/ray';
```

**返回**

**GetAiFilterTemplatesResult**

| 属性      | 类型     | 说明     |
| --------- | -------- | -------- |
| templates | `any`    | 模板数据 |
| type      | `string` | 模板类型 |
| style     | `string` | 模板样式 |

**函数定义**

```typescript
function getAiFilterTemplates(): Promise<GetAiFilterTemplatesResult>;
```

**请求示例**

```jsx
import { getAiFilterTemplates } from '@ray-js/ray';

getAiFilterTemplates();
```

**成功示例**

```json
{
        "name": "Ai特效",
        "sort": 2,
        "style": "smartEffects",
        "templates": [
          {
            "code": "pipe",
            "from": "APP",
            "image": "",
            "media_type": "PIC",
            "name": "Pipe",
            "ouput_duration": 5,
            "resource": "",
            "sort": 1
          }
        ]
      },
```
#### getPetBehavior

获取宠物行为

**引入**

> `@ray-js/ray^1.7.30` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getPetBehavior } from '@ray-js/ray';
```

**参数**

**GetPetBehavior**

| 属性       | 类型     | 必填 | 说明                       |
| ---------- | -------- | ---- | -------------------------- |
| devId      | `string` | 否   | 设备id（按设备的uuid查询） |
| actionType | `number` | 否   | 行为类型                   |
| startTime  | `number` | 否   | 查询开始时间，单位：毫秒   |
| endTime    | `number` | 否   | 查询结束时间，单位：毫秒   |
| pageNo     | `number` | 是   | 页码，从1开始              |
| pageSize   | `number` | 是   | 每页大小                   |

**返回**

**PetBehaviorResult**

| 属性   | 类型          | 说明         |
| ------ | ------------- | ------------ |
| result | `PetBehavior` | 宠物行为信息 |

**PetBehavior 说明**

| 属性       | 类型                     | 说明             |
| ---------- | ------------------------ | ---------------- |
| totalCount | `number`                 | 总记录条数       |
| pageNo     | `number`                 | 分页页号         |
| pageSize   | `number`                 | 分页大小         |
| hasNext    | `boolean`                | 是否还有下一页   |
| data       | `Array<PetBehaviorData>` | 进食信息（数组） |

**PetBehaviorData 说明**

| 属性                | 类型             | 说明                                     |
| ------------------- | ---------------- | ---------------------------------------- |
| recordNo            | `string`         | 记录no                                   |
| devId               | `string?`        | 设备id（可选）                           |
| deviceName          | `string?`        | 设备名称（快照，可选）                   |
| actionType          | `number`         | 行为类型：`1`-检测到宠物，`2`-进食       |
| recordTime          | `number`         | 记录时间（毫秒）                         |
| isEncrypted         | `number`         | 文件是否加密：`0`-否，`1`-是             |
| bucketName          | `string`         | 云存储文件桶                             |
| fileType            | `string`         | 文件类型：`image`/`media`                |
| fileDisplay         | `string`         | 文件可访问url（未解密）                  |
| fileObjectKey       | `string`         | 云存文件对象（`fileType=image`时存在）   |
| videoCoverObjectKey | `string`         | 视频封面可访问地址（有效期30-60分钟）    |
| videoDisplay        | `string`         | 视频可访问地址（有效期30-60分钟）        |
| videoPrefix         | `string`         | 视频文件前缀（用户开通云存时存在）       |
| videoType           | `string`         | 视频文件类型：云存/视频消息              |
| pets                | `Array<PetInfo>` | 关联的宠物信息（可选数组）               |
| extInfo             | `string`         | 扩展信息（按宠物类型存储，如进食时间等） |

**PetInfo 说明**

| 属性    | 类型     | 说明     |
| ------- | -------- | -------- |
| petId   | `number` | 宠物id   |
| petName | `string` | 宠物名称 |

**函数定义**

```typescript
function getPetBehavior(data: GetPetBehavior): Promise<GetPetBehaviorResult>;
```

**请求示例**

```jsx
import { getPetBehavior } from '@ray-js/ray';

getPetBehavior({...});
```
#### getPetBehaviorStatistics

获取宠物行为统计

**引入**

> `@ray-js/ray^1.7.30` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getPetBehaviorStatistics } from '@ray-js/ray';
```

**参数**

**GetPetBehaviorStatistics**

| 属性          | 类型     | 必填 | 说明                                       |
| ------------- | -------- | ---- | ------------------------------------------ |
| devId         | `string` | 否   | 设备id（按设备的uuid查询）                 |
| petId         | `string` | 是   | 宠物id                                     |
| beginDate     | `string` | 否   | 查询开始时间，格式如 `'2025072500'`        |
| endDate       | `number` | 否   | 查询结束时间，格式如 `'2025072523'`        |
| dateType      | `string` | 是   | 聚合时间：`hour`-小时，`day`-日，`week`-月 |
| timeAggrType  | `string` | 是   | 聚合类型：`SUM`-和，`AVG`-平均，`NUM`-次数 |
| indicatorCode | `string` | 是   | 指标（如 `defecation`-如厕）               |

**返回**

**PetBehaviorStatisticsResult**

| 属性   | 类型                    | 说明         |
| ------ | ----------------------- | ------------ |
| result | `PetBehaviorStatistics` | 宠物行为信息 |

**PetBehaviorStatistics 说明**

| 属性     | 类型     | 说明     |
| -------- | -------- | -------- |
| datetime | `string` | 统计日期 |
| value    | `number` | 指标值   |

**函数定义**

```typescript
function getPetBehaviorStatistics(data: GetPetBehaviorStatistics): Promise<PetBehaviorStatisticsResult>;
```

**请求示例**

```jsx
import { getPetBehaviorStatistics } from '@ray-js/ray';

getPetBehaviorStatistics({...});
```

## 面板智能体

#### getPanelAgentConfigLanguageList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取支持的语言列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<Object[]>`

GetPanelAgentConfigLanguageListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentConfigLanguageList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentConfigLanguageList(params)
  .then(result => {
    console.log('支持的语言列表:', result);
  })
  .catch(error => {
    console.error('获取语言列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    langCode: 'zh-CN',
    langName: '中文（简体）',
    hasDefault: true,
  },
  {
    langCode: 'en-US',
    langName: 'English',
    hasDefault: false,
  },
];
```
#### getPanelAgentConfigLlmList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取支持的大语言模型列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<Object[]>`

GetPanelAgentConfigLlmListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentConfigLlmList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentConfigLlmList(params)
  .then(result => {
    console.log('支持的大模型列表:', result);
  })
  .catch(error => {
    console.error('获取大模型列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    llmId: 1001,
    llmName: 'GPT-3.5-turbo',
  },
  {
    llmId: 1002,
    llmName: 'Claude-3',
  },
];
```
#### getPanelAgentConfigAvatarList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取支持的头像列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bizCode` | `string` | 否 | 业务编码 |

##### 返回值

类型: `Promise<Object[]>`

GetPanelAgentConfigAvatarListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentConfigAvatarList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bizCode: 'optional_biz_code',
};

getPanelAgentConfigAvatarList(params)
  .then(result => {
    console.log('头像列表:', result);
  })
  .catch(error => {
    console.error('获取头像列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    avatarId: 'avatar_001',
    url: 'https://example.com/avatar1.png',
  },
  {
    avatarId: 'avatar_002',
    url: 'https://example.com/avatar2.png',
  },
];
```
#### getPanelAgentConfigRoleVariableList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取角色变量配置列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<Object[]>`

GetPanelAgentConfigRoleVariableListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentConfigRoleVariableList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentConfigRoleVariableList(params)
  .then(result => {
    console.log('角色变量配置列表:', result);
  })
  .catch(error => {
    console.error('获取角色变量配置列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    variableKey: 1001,
    variableDesc: '设备名称',
  },
  {
    variableKey: 1002,
    variableDesc: '用户昵称',
  },
];
```
#### getPanelAgentConfigWakeUpWord

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取唤醒词。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<string>`

GetPanelAgentConfigWakeUpWordResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentConfigWakeUpWord } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentConfigWakeUpWord(params)
  .then(result => {
    console.log('唤醒词:', result);
  })
  .catch(error => {
    console.error('获取唤醒词失败:', error);
  });
```

###### 返回示例

```javascript
'小美小美';
```
#### getPanelAgentProjectInfo

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询智能体项目信息。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<GetPanelAgentProjectInfoResult>`

GetPanelAgentProjectInfoResult（字段含义见类型定义与 minituya 返回参数）

###### GetPanelAgentProjectInfoResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `projectCode` | `string` | 是 | 智能体code |
| `supportMultiRole` | `boolean` | 是 | 是否为多角色（为多角色，为单角色） |
| `llmSupportFuncTagList` | `string[]` | 是 | 单角色时返回的多模态功能标签 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentProjectInfo } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentProjectInfo(params)
  .then(result => {
    console.log('项目信息:', result);
  })
  .catch(error => {
    console.error('获取项目信息失败:', error);
  });
```

###### 返回示例

```javascript
{
  "projectCode": "agent_project_001",
  "supportMultiRole": true,
  "llmSupportFuncTagList": ["text", "image", "voice"]
}
```
#### addPanelAgentCustomRole

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

创建自定义角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleName` | `string` | 是 | 角色名称 |
| `roleDesc` | `string` | 否 | 角色描述 |
| `roleIntroduce` | `string` | 是 | 角色介绍 |
| `roleVariables` | `Record<string, any>` | 否 | 角色变量 |
| `roleImgUrl` | `string` | 是 | 角色图像 |
| `useLangCode` | `string` | 是 | 角色使用语言 |
| `useTimbreId` | `string` | 否 | 角色使用音色 |
| `useLlmId` | `string` | 否 | 角色使用语言模型 |
| `speed` | `string` | 否 | 角色使用音色速度 |
| `tone` | `string` | 否 | 角色使用语气 |

##### 返回值

类型: `Promise<string>`

AddPanelAgentCustomRoleResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { addPanelAgentCustomRole } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleName: '智能助手小美',
  roleDesc: '温柔贴心的智能助手',
  roleIntroduce: '我是小美，您的专属智能助手，很高兴为您服务！',
  roleVariables: {
    personality: 'friendly',
    expertise: 'general',
  },
  roleImgUrl: 'https://example.com/avatar.jpg',
  useLangCode: 'zh-CN',
  useTimbreId: 'timbre_001',
  useLlmId: '1001',
  speed: '1.0',
  tone: 'gentle',
};

addPanelAgentCustomRole(params)
  .then(result => {
    console.log('创建成功，角色ID:', result);
  })
  .catch(error => {
    console.error('创建自定义角色失败:', error);
  });
```

###### 返回示例

```javascript
'role_custom_12345';
```
#### getPanelAgentCustomRoleDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询自定义角色详情。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleId` | `string` | 是 | 角色ID |

##### 返回值

类型: `Promise<PanelAgentRoleDetail>`

GetPanelAgentCustomRoleDetailResult（字段含义见类型定义与 minituya 返回参数）

###### PanelAgentRoleDetail

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `roleId` | `string` | 是 | 角色id |
| `roleName` | `string` | 是 | 角色名称 |
| `roleDesc` | `string` | 是 | 角色描述 |
| `roleIntroduce` | `string` | 是 | 角色介绍 |
| `roleImgUrl` | `string` | 是 | 角色图像 |
| `useLangCode` | `string` | 是 | 角色使用语言code |
| `useLangName` | `string` | 是 | 角色使用语言名称 |
| `useTimbreId` | `string` | 是 | 角色使用音色 |
| `isUserCloneTimbre` | `boolean` | 是 | 是否是自定义克隆音色 |
| `useTimbreName` | `string` | 是 | 角色使用音色名称 |
| `useTimbreSupportLangs` | `string` | 是 | 角色支持的音色语言,多个用逗号分隔 |
| `useTimbreSupportLangList` | `string[]` | 否 | 角色支持的音色语言列表 |
| `useTimbreTags` | `string[]` | 是 | 角色标签 |
| `useLlmId` | `string` | 是 | 角色使用语言模型 |
| `useLlmName` | `string` | 是 | 角色使用语言模型名称 |
| `inBind` | `boolean` | 是 | 是否绑定 |
| `memoryInfo` | `string` | 是 | 记忆体 |
| `speed` | `number` | 是 | 音色速度 |
| `tone` | `number` | 是 | 音色语气 |
| `templateId` | `string` | 是 | 模板id |
| `bindRoleType` | `number` | 是 | 绑定角色类型 |
| `lastTextAnswer` | `string` | 是 | 最近的一次回复文本 |
| `llmSupportFuncTags` | `string` | 是 | 语言模型支持的函数标签，多个用逗号分隔 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentCustomRoleDetail } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleId: 'role_custom_12345',
};

getPanelAgentCustomRoleDetail(params)
  .then(result => {
    console.log('自定义角色详情:', result);
  })
  .catch(error => {
    console.error('获取自定义角色详情失败:', error);
  });
```

###### 返回示例

```javascript
{
  "roleId": "role_custom_001",
  "roleName": "智能助手小美",
  "roleDesc": "温柔贴心的智能助手",
  "roleIntroduce": "我是小美，您的专属智能助手",
  "roleImgUrl": "https://example.com/role_avatar.jpg",
  "useLangCode": "zh-CN",
  "useLangName": "中文（简体）",
  "useTimbreId": "timbre_001",
  "isUserCloneTimbre": false,
  "useTimbreName": "温柔女声",
  "useTimbreSupportLangs": "zh-CN,en-US",
  "useTimbreSupportLangList": ["zh-CN", "en-US"],
  "useTimbreTags": ["温柔", "甜美"],
  "useLlmId": "1001",
  "useLlmName": "GPT-3.5-turbo",
  "inBind": true,
  "memoryInfo": "用户喜欢温柔的语调",
  "speed": 1.0,
  "tone": 0.8,
  "templateId": "template_001",
  "bindRoleType": 0,
  "lastTextAnswer": "您好，有什么可以帮助您的吗？",
  "llmSupportFuncTags": "text,voice,image"
}
```
#### updatePanelAgentCustomRole

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

修改自定义角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleId` | `string` | 是 | 角色ID |
| `roleName` | `string` | 否 | 角色名称 |
| `roleDesc` | `string` | 否 | 角色描述 |
| `roleIntroduce` | `string` | 否 | 角色介绍 |
| `roleVariables` | `Record<string, any>` | 否 | 角色变量 |
| `roleImgUrl` | `string` | 否 | 角色图像 |
| `useLangCode` | `string` | 否 | 角色使用语言 |
| `useTimbreId` | `string` | 否 | 角色使用音色 |
| `useLlmId` | `string` | 否 | 角色使用语言模型 |
| `memoryInfo` | `string` | 否 | 记忆体 |
| `speed` | `string` | 否 | 音色速度 |
| `tone` | `string` | 否 | 音色语气 |
| `needBind` | `string` | 否 | 是否需要绑定 |

##### 返回值

类型: `Promise<boolean>`

UpdatePanelAgentCustomRoleResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { updatePanelAgentCustomRole } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleId: 'role_custom_12345',
  roleName: '智能助手小美v2',
  roleDesc: '更加温柔贴心的智能助手',
  roleIntroduce: '我是小美，您的专属智能助手，现在更加贴心了！',
  roleVariables: {
    personality: 'very_friendly',
    expertise: 'advanced',
  },
  roleImgUrl: 'https://example.com/new_avatar.jpg',
  useLangCode: 'zh-CN',
  useTimbreId: 'timbre_002',
  useLlmId: '1002',
  memoryInfo: '用户喜欢详细的解答',
  speed: '0.9',
  tone: '0.7',
  needBind: 'true',
};

updatePanelAgentCustomRole(params)
  .then(result => {
    console.log('更新结果:', result);
  })
  .catch(error => {
    console.error('更新自定义角色失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### deletePanelAgentCustomRole

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

删除自定义角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleId` | `string` | 是 | 角色ID |

##### 返回值

类型: `Promise<boolean>`

DeletePanelAgentCustomRoleResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { deletePanelAgentCustomRole } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleId: 'role_custom_12345',
};

deletePanelAgentCustomRole(params)
  .then(result => {
    console.log('删除结果:', result);
  })
  .catch(error => {
    console.error('删除自定义角色失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentCustomRolePage

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询自定义角色列表（分页）。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `pageNo` | `number` | 是 | 页码 |
| `pageSize` | `number` | 是 | 每页条数 |
| `roleCategory` | `string` | 否 | 角色分类 |

##### 返回值

类型: `Promise<PanelAgentCustomRoleListItem[]>`

GetPanelAgentCustomRolePageResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentCustomRolePage } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  pageNo: 1,
  pageSize: 10,
  roleCategory: 'assistant',
};

getPanelAgentCustomRolePage(params)
  .then(result => {
    console.log('自定义角色列表:', result);
  })
  .catch(error => {
    console.error('获取自定义角色列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    roleId: 'role_custom_001',
    roleName: '智能助手小美',
    roleDesc: '温柔贴心的智能助手',
    roleIntroduce: '我是小美，您的专属智能助手',
    roleImgUrl: 'https://example.com/role_avatar.jpg',
    useLangCode: 'zh-CN',
    useLangName: '中文（简体）',
    useTimbreId: 'timbre_001',
    useTimbreName: '温柔女声',
    useLlmId: '1001',
    useLlmName: 'GPT-3.5-turbo',
    inBind: true,
    templateId: 'template_001',
    inConversation: false,
    lastTextAnswer: '您好，有什么可以帮助您的吗？',
  },
];
```
#### initializePanelAgentRoleBinding

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

初始化角色和智能体绑定关系。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<PanelAgentRoleDetail>`

InitializePanelAgentRoleBindingResult（字段含义见类型定义与 minituya 返回参数）

###### PanelAgentRoleDetail

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `roleId` | `string` | 是 | 角色id |
| `roleName` | `string` | 是 | 角色名称 |
| `roleDesc` | `string` | 是 | 角色描述 |
| `roleIntroduce` | `string` | 是 | 角色介绍 |
| `roleImgUrl` | `string` | 是 | 角色图像 |
| `useLangCode` | `string` | 是 | 角色使用语言code |
| `useLangName` | `string` | 是 | 角色使用语言名称 |
| `useTimbreId` | `string` | 是 | 角色使用音色 |
| `isUserCloneTimbre` | `boolean` | 是 | 是否是自定义克隆音色 |
| `useTimbreName` | `string` | 是 | 角色使用音色名称 |
| `useTimbreSupportLangs` | `string` | 是 | 角色支持的音色语言,多个用逗号分隔 |
| `useTimbreSupportLangList` | `string[]` | 否 | 角色支持的音色语言列表 |
| `useTimbreTags` | `string[]` | 是 | 角色标签 |
| `useLlmId` | `string` | 是 | 角色使用语言模型 |
| `useLlmName` | `string` | 是 | 角色使用语言模型名称 |
| `inBind` | `boolean` | 是 | 是否绑定 |
| `memoryInfo` | `string` | 是 | 记忆体 |
| `speed` | `number` | 是 | 音色速度 |
| `tone` | `number` | 是 | 音色语气 |
| `templateId` | `string` | 是 | 模板id |
| `bindRoleType` | `number` | 是 | 绑定角色类型 |
| `lastTextAnswer` | `string` | 是 | 最近的一次回复文本 |
| `llmSupportFuncTags` | `string` | 是 | 语言模型支持的函数标签，多个用逗号分隔 |

##### 示例代码

###### 请求示例

```typescript
import { initializePanelAgentRoleBinding } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

initializePanelAgentRoleBinding(params)
  .then(result => {
    console.log('初始化绑定关系结果:', result);
  })
  .catch(error => {
    console.error('初始化绑定关系失败:', error);
  });
```

###### 返回示例

```javascript
{
  "roleId": "role_initialized_001",
  "roleName": "初始化智能助手",
  "roleDesc": "系统初始化的默认智能助手",
  "roleIntroduce": "我是系统为您初始化的智能助手",
  "roleImgUrl": "https://example.com/default_avatar.jpg",
  "useLangCode": "zh-CN",
  "useLangName": "中文（简体）",
  "useTimbreId": "timbre_default_001",
  "isUserCloneTimbre": false,
  "useTimbreName": "默认音色",
  "useTimbreSupportLangs": "zh-CN",
  "useTimbreSupportLangList": ["zh-CN"],
  "useTimbreTags": ["默认", "初始"],
  "useLlmId": "1001",
  "useLlmName": "GPT-3.5-turbo",
  "inBind": true,
  "memoryInfo": "初始化记忆信息",
  "speed": 1.0,
  "tone": 0.5,
  "templateId": "default_template",
  "bindRoleType": 2,
  "lastTextAnswer": "您好，我是您的智能助手，很高兴为您服务！",
  "llmSupportFuncTags": "text"
}
```
#### bindPanelAgentWithRole

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

绑定角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |

##### 返回值

类型: `Promise<boolean>`

BindPanelAgentWithRoleResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { bindPanelAgentWithRole } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_custom_12345',
};

bindPanelAgentWithRole(params)
  .then(result => {
    console.log('绑定结果:', result);
  })
  .catch(error => {
    console.error('绑定角色失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentBoundRole

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询绑定的角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<PanelAgentRoleDetail>`

GetPanelAgentBoundRoleResult（字段含义见类型定义与 minituya 返回参数）

###### PanelAgentRoleDetail

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `roleId` | `string` | 是 | 角色id |
| `roleName` | `string` | 是 | 角色名称 |
| `roleDesc` | `string` | 是 | 角色描述 |
| `roleIntroduce` | `string` | 是 | 角色介绍 |
| `roleImgUrl` | `string` | 是 | 角色图像 |
| `useLangCode` | `string` | 是 | 角色使用语言code |
| `useLangName` | `string` | 是 | 角色使用语言名称 |
| `useTimbreId` | `string` | 是 | 角色使用音色 |
| `isUserCloneTimbre` | `boolean` | 是 | 是否是自定义克隆音色 |
| `useTimbreName` | `string` | 是 | 角色使用音色名称 |
| `useTimbreSupportLangs` | `string` | 是 | 角色支持的音色语言,多个用逗号分隔 |
| `useTimbreSupportLangList` | `string[]` | 否 | 角色支持的音色语言列表 |
| `useTimbreTags` | `string[]` | 是 | 角色标签 |
| `useLlmId` | `string` | 是 | 角色使用语言模型 |
| `useLlmName` | `string` | 是 | 角色使用语言模型名称 |
| `inBind` | `boolean` | 是 | 是否绑定 |
| `memoryInfo` | `string` | 是 | 记忆体 |
| `speed` | `number` | 是 | 音色速度 |
| `tone` | `number` | 是 | 音色语气 |
| `templateId` | `string` | 是 | 模板id |
| `bindRoleType` | `number` | 是 | 绑定角色类型 |
| `lastTextAnswer` | `string` | 是 | 最近的一次回复文本 |
| `llmSupportFuncTags` | `string` | 是 | 语言模型支持的函数标签，多个用逗号分隔 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentBoundRole } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentBoundRole(params)
  .then(result => {
    console.log('绑定的角色信息:', result);
  })
  .catch(error => {
    console.error('获取绑定角色失败:', error);
  });
```

###### 返回示例

```javascript
{
  "roleId": "role_bound_001",
  "roleName": "当前绑定的智能助手",
  "roleDesc": "已绑定的智能助手角色",
  "roleIntroduce": "我是当前绑定的智能助手",
  "roleImgUrl": "https://example.com/bound_avatar.jpg",
  "useLangCode": "zh-CN",
  "useLangName": "中文（简体）",
  "useTimbreId": "timbre_bound_001",
  "isUserCloneTimbre": false,
  "useTimbreName": "绑定音色",
  "useTimbreSupportLangs": "zh-CN,en-US",
  "useTimbreSupportLangList": ["zh-CN", "en-US"],
  "useTimbreTags": ["友好", "专业"],
  "useLlmId": "1001",
  "useLlmName": "GPT-3.5-turbo",
  "inBind": true,
  "memoryInfo": "绑定角色的记忆信息",
  "speed": 1.0,
  "tone": 0.8,
  "templateId": "template_001",
  "bindRoleType": 0,
  "lastTextAnswer": "您好，我是您的智能助手",
  "llmSupportFuncTags": "text,voice,image"
}
```
#### getPanelAgentRoleTemplateList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询角色模板列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `tagCode` | `string` | 否 | 标签 |

##### 返回值

类型: `Promise<PanelAgentRoleTemplateListItem[]>`

GetPanelAgentRoleTemplateListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentRoleTemplateList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  tagCode: 'assistant',
};

getPanelAgentRoleTemplateList(params)
  .then(result => {
    console.log('角色模板列表:', result);
  })
  .catch(error => {
    console.error('获取角色模板列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    templateId: 'template_001',
    roleId: 'role_001',
    roleName: '智能助手',
    roleDesc: '专业的智能助手',
    roleImgUrl: 'https://example.com/role_avatar.jpg',
    roleIntroduce: '我是您的专属智能助手',
    useLangCode: 'zh-CN',
    useLangName: '中文（简体）',
    useTimbreId: 'timbre_001',
    useTimbreName: '温柔女声',
    useTimbreSupportLangs: 'zh-CN,en-US',
    useTimbreSupportLangNames: '中文（简体）,English',
    useLlmId: '1001',
    useLlmName: 'GPT-3.5-turbo',
    inConversation: false,
    lastTextAnswer: '',
    bindStatus: false,
  },
];
```
#### getPanelAgentRoleTemplateDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询角色模板详情。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleId` | `string` | 是 | 角色ID |

##### 返回值

类型: `Promise<PanelAgentRoleDetail>`

GetPanelAgentRoleTemplateDetailResult（字段含义见类型定义与 minituya 返回参数）

###### PanelAgentRoleDetail

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `roleId` | `string` | 是 | 角色id |
| `roleName` | `string` | 是 | 角色名称 |
| `roleDesc` | `string` | 是 | 角色描述 |
| `roleIntroduce` | `string` | 是 | 角色介绍 |
| `roleImgUrl` | `string` | 是 | 角色图像 |
| `useLangCode` | `string` | 是 | 角色使用语言code |
| `useLangName` | `string` | 是 | 角色使用语言名称 |
| `useTimbreId` | `string` | 是 | 角色使用音色 |
| `isUserCloneTimbre` | `boolean` | 是 | 是否是自定义克隆音色 |
| `useTimbreName` | `string` | 是 | 角色使用音色名称 |
| `useTimbreSupportLangs` | `string` | 是 | 角色支持的音色语言,多个用逗号分隔 |
| `useTimbreSupportLangList` | `string[]` | 否 | 角色支持的音色语言列表 |
| `useTimbreTags` | `string[]` | 是 | 角色标签 |
| `useLlmId` | `string` | 是 | 角色使用语言模型 |
| `useLlmName` | `string` | 是 | 角色使用语言模型名称 |
| `inBind` | `boolean` | 是 | 是否绑定 |
| `memoryInfo` | `string` | 是 | 记忆体 |
| `speed` | `number` | 是 | 音色速度 |
| `tone` | `number` | 是 | 音色语气 |
| `templateId` | `string` | 是 | 模板id |
| `bindRoleType` | `number` | 是 | 绑定角色类型 |
| `lastTextAnswer` | `string` | 是 | 最近的一次回复文本 |
| `llmSupportFuncTags` | `string` | 是 | 语言模型支持的函数标签，多个用逗号分隔 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentRoleTemplateDetail } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleId: 'template_role_001',
};

getPanelAgentRoleTemplateDetail(params)
  .then(result => {
    console.log('角色模板详情:', result);
  })
  .catch(error => {
    console.error('获取角色模板详情失败:', error);
  });
```

###### 返回示例

```javascript
{
  "roleId": "template_role_001",
  "roleName": "智能助手模板",
  "roleDesc": "标准的智能助手模板",
  "roleIntroduce": "我是一个通用的智能助手模板",
  "roleImgUrl": "https://example.com/template_avatar.jpg",
  "useLangCode": "zh-CN",
  "useLangName": "中文（简体）",
  "useTimbreId": "timbre_template_001",
  "isUserCloneTimbre": false,
  "useTimbreName": "标准女声",
  "useTimbreSupportLangs": "zh-CN,en-US",
  "useTimbreSupportLangList": ["zh-CN", "en-US"],
  "useTimbreTags": ["标准", "通用"],
  "useLlmId": "1001",
  "useLlmName": "GPT-3.5-turbo",
  "inBind": false,
  "memoryInfo": "模板默认记忆",
  "speed": 1.0,
  "tone": 0.5,
  "templateId": "template_001",
  "bindRoleType": 1,
  "lastTextAnswer": "",
  "llmSupportFuncTags": "text,voice"
}
```
#### createPanelAgentRoleFromTemplate

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

根据角色模板创建自定义角色。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `roleId` | `string` | 是 | 角色模板/角色ID（根据场景） |
| `roleName` | `string` | 否 | 角色名称 |
| `roleDesc` | `string` | 否 | 角色描述 |
| `roleIntroduce` | `string` | 否 | 角色介绍 |
| `roleVariables` | `Record<string, any>` | 否 | 角色变量 |
| `roleImgUrl` | `string` | 否 | 角色图像 |
| `useLangCode` | `string` | 否 | 角色使用语言 |
| `useTimbreId` | `string` | 否 | 角色使用音色 |
| `useLlmId` | `string` | 否 | 角色使用语言模型 |
| `memoryInfo` | `string` | 否 | 记忆体 |
| `speed` | `string` | 否 | 音色速度 |
| `tone` | `string` | 否 | 音色语气 |
| `needBind` | `string` | 否 | 是否需要绑定 |

##### 返回值

类型: `Promise<string>`

CreatePanelAgentRoleFromTemplateResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { createPanelAgentRoleFromTemplate } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  roleId: 'template_role_001',
  roleName: '基于模板的智能助手',
  roleDesc: '从模板创建的定制助手',
  roleIntroduce: '我是基于模板创建的智能助手',
  roleVariables: {
    customization: 'template_based',
    features: ['smart', 'helpful'],
  },
  roleImgUrl: 'https://example.com/template_avatar.jpg',
  useLangCode: 'zh-CN',
  useTimbreId: 'timbre_001',
  useLlmId: '1001',
  memoryInfo: '从模板继承的记忆信息',
  speed: '1.0',
  tone: '0.8',
  needBind: 'true',
};

createPanelAgentRoleFromTemplate(params)
  .then(result => {
    console.log('创建成功，新角色ID:', result);
  })
  .catch(error => {
    console.error('从模板创建角色失败:', error);
  });
```

###### 返回示例

```javascript
'role_custom_from_template_12345';
```
#### fetchPanelAgentChatHistory

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询历史会话记录（支持游标分页）。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |
| `gmtStart` | `number` | 否 | 起始时间戳（13位，不能和结束时间戳同时为空） |
| `gmtEnd` | `number` | 否 | 结束时间戳（13位，不能和起始时间戳同时为空） |
| `fetchSize` | `number` | 是 | 所需条数 |
| `timeAsc` | `boolean` | 否 | 是否按时间升序（默认倒序） |

##### 返回值

类型: `Promise<FetchPanelAgentChatHistoryItem[]>`

FetchPanelAgentChatHistoryResult（字段含义见类型定义与 minituya 返回参数）

###### 引用对象

###### `interface` ChatMessageFragment

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | id |
| `context` | `string` | 是 | 会话内容 |
| `type` | `string` | 是 | 类型 |

##### 示例代码

###### 请求示例

```typescript
import { fetchPanelAgentChatHistory } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  gmtStart: 1699200000000,
  gmtEnd: 1699286400000,
  fetchSize: 20,
  timeAsc: false,
};

fetchPanelAgentChatHistory(params)
  .then(result => {
    console.log('历史会话记录:', result);
  })
  .catch(error => {
    console.error('获取历史会话记录失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    docId: 'doc_001',
    createTime: '2023-11-06 10:30:00',
    requestId: 'req_12345',
    question: [
      {
        id: 'q_001',
        context: '今天天气怎么样？',
        type: 'text',
      },
    ],
    answer: [
      {
        id: 'a_001',
        context: '今天是晴天，气温22度。',
        type: 'text',
      },
    ],
    gmtCreate: 1699200000000,
  },
];
```
#### deletePanelAgentChatHistory

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

删除角色历史会话记录。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |
| `clearAllHistory` | `boolean` | 是 | 是否清除全部历史记录 |
| `requestIds` | `string` | 否 | 待删除历史记录的requestId（多个用逗号隔开） |

##### 返回值

类型: `Promise<boolean>`

DeletePanelAgentChatHistoryResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { deletePanelAgentChatHistory } from '@tuya-miniapp/cloud-api';

// 删除指定记录
const params1 = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  clearAllHistory: false,
  requestIds: 'req_001,req_002,req_003',
};

// 清除全部历史记录
const params2 = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  clearAllHistory: true,
};

deletePanelAgentChatHistory(params1)
  .then(result => {
    console.log('删除结果:', result);
  })
  .catch(error => {
    console.error('删除历史记录失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentChatSummary

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询角色对话总结。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |

##### 返回值

类型: `Promise<string>`

GetPanelAgentChatSummaryResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentChatSummary } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
};

getPanelAgentChatSummary(params)
  .then(result => {
    console.log('对话总结:', result);
  })
  .catch(error => {
    console.error('获取对话总结失败:', error);
  });
```

###### 返回示例

```javascript
'用户询问了天气信息，智能体提供了准确的天气预报。用户对服务表示满意。';
```
#### updatePanelAgentChatSummary

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

更新角色对话总结。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |
| `summaryItems` | `string[]` | 是 | 对话总结 |

##### 返回值

类型: `Promise<boolean>`

UpdatePanelAgentChatSummaryResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { updatePanelAgentChatSummary } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  summaryItems: ['用户询问了天气信息', '智能体提供了准确的天气预报', '用户对服务表示满意'],
};

updatePanelAgentChatSummary(params)
  .then(result => {
    console.log('更新结果:', result);
  })
  .catch(error => {
    console.error('更新对话总结失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentCurrentChatEmotion

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取当前聊天心情。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<GetPanelAgentCurrentChatEmotionResult>`

GetPanelAgentCurrentChatEmotionResult（字段含义见类型定义与 minituya 返回参数）

###### GetPanelAgentCurrentChatEmotionResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `emotionOpen` | `boolean` | 是 | 是否开启了心情 |
| `emotion` | `string` | 是 | 心情 |
| `text` | `string` | 是 | 文本 |
| `url` | `string` | 是 | 图片链接 |
| `gmtCreate` | `number` | 是 | 创建时间 |
| `gmtModified` | `number` | 是 | 修改时间 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentCurrentChatEmotion } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentCurrentChatEmotion(params)
  .then(result => {
    console.log('当前聊天心情:', result);
  })
  .catch(error => {
    console.error('获取聊天心情失败:', error);
  });
```

###### 返回示例

```javascript
{
  "emotionOpen": true,
  "emotion": "happy",
  "text": "我现在心情很好！",
  "url": "https://example.com/happy_emoji.png",
  "gmtCreate": 1699200000000,
  "gmtModified": 1699200300000
}
```
#### clearPanelAgentContext

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

清除角色上下文。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |

##### 返回值

类型: `Promise<boolean>`

ClearPanelAgentContextResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { clearPanelAgentContext } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
};

clearPanelAgentContext(params)
  .then(result => {
    console.log('清除结果:', result);
  })
  .catch(error => {
    console.error('清除上下文失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentMemoryList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询角色记忆列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |

##### 返回值

类型: `Promise<PanelAgentMemoryGroup[]>`

GetPanelAgentMemoryListResult（字段含义见类型定义与 minituya 返回参数）

###### 引用对象

###### `type` PanelAgentMemoryItem

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `memoryKey` | `string` | 是 | 记忆key |
| `memoryValue` | `string` | 是 | 记忆值 |
| `memoryName` | `string` | 是 | 记忆名称 |
| `effectiveScope` | `number` | 是 | 记忆作用域 |
| `effectiveScopeName` | `string` | 是 | 记忆作用域名称 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentMemoryList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
};

getPanelAgentMemoryList(params)
  .then(result => {
    console.log('记忆列表:', result);
  })
  .catch(error => {
    console.error('获取记忆列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    effectiveScope: 1,
    effectiveScopeName: '全局记忆',
    memoryList: [
      {
        memoryKey: 'user_preference',
        memoryValue: '喜欢蓝色',
        memoryName: '用户偏好',
        effectiveScope: 1,
        effectiveScopeName: '全局记忆',
      },
    ],
  },
];
```
#### deletePanelAgentMemory

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

删除角色记忆。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `bindRoleType` | `0 \| 1 \| 2` | 是 | 0-自定义智能体角色,1-智能体角色模板,2-单角色场景默认角色 |
| `roleId` | `string` | 是 | 角色ID（会根据bindRoleType决定具体含义） |
| `clearAllMemory` | `boolean` | 是 | 是否清除全部记忆 |
| `memoryKeys` | `string` | 否 | 待删除记忆的memoryKey（多个用逗号隔开） |

##### 返回值

类型: `Promise<boolean>`

DeletePanelAgentMemoryResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { deletePanelAgentMemory } from '@tuya-miniapp/cloud-api';

// 删除指定记忆
const params1 = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  clearAllMemory: false,
  memoryKeys: 'memory_001,memory_002',
};

// 清除全部记忆
const params2 = {
  devId: 'your_device_id',
  bindRoleType: 0,
  roleId: 'role_12345',
  clearAllMemory: true,
};

deletePanelAgentMemory(params1)
  .then(result => {
    console.log('删除结果:', result);
  })
  .catch(error => {
    console.error('删除记忆失败:', error);
  });
```

###### 返回示例

```javascript
true;
```
#### getPanelAgentMemorySwitch

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

查询记忆开关状态。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |

##### 返回值

类型: `Promise<GetPanelAgentMemorySwitchResult>`

GetPanelAgentMemorySwitchResult（字段含义见类型定义与 minituya 返回参数）

###### GetPanelAgentMemorySwitchResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `summaryOpen` | `boolean` | 是 | 总结开关 |
| `memoryOpen` | `boolean` | 是 | 记忆开关 |

##### 示例代码

###### 请求示例

```typescript
import { getPanelAgentMemorySwitch } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
};

getPanelAgentMemorySwitch(params)
  .then(result => {
    console.log('记忆开关状态:', result);
  })
  .catch(error => {
    console.error('获取记忆开关状态失败:', error);
  });
```

###### 返回示例

```javascript
{
  "summaryOpen": true,
  "memoryOpen": true
}
```
#### getTimbreMarketList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.6

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力 进行授权配置。

##### 描述

获取标准音色分页列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备ID |
| `tag` | `string` | 否 | 音色标签 |
| `keyWord` | `string` | 是 | 音色名称 |
| `lang` | `string` | 否 | 语言 |
| `pageNo` | `number` | 是 | pageN0 |
| `pageSize` | `number` | 是 | pageSize |

##### 返回值

类型: `Promise<GetTimbreMarketListItem[]>`

GetTimbreMarketListResult（字段含义见类型定义与 minituya 返回参数）

##### 示例代码

###### 请求示例

```typescript
import { getTimbreMarketList } from '@tuya-miniapp/cloud-api';

const params = {
  devId: 'your_device_id',
  tag: 'gentle',
  keyWord: '温柔',
  lang: 'zh-CN',
  pageNo: 1,
  pageSize: 10,
};

getTimbreMarketList(params)
  .then(result => {
    console.log('音色列表:', result);
  })
  .catch(error => {
    console.error('获取音色列表失败:', error);
  });
```

###### 返回示例

```javascript
[
  {
    voiceId: 'voice_001',
    voiceName: '温柔女声',
    descTags: ['温柔', '甜美', '专业'],
    supportLangs: ['zh-CN', 'en-US'],
    speedAdjustable: true,
    speed: 1.0,
    toneAdjustable: true,
    tone: 0.8,
    demoUrl: 'https://example.com/demo_voice.mp3',
  },
];
```
