# 媒体 (media)

### 图片

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayPicApi" 
  qrCodeUrl="/images/qrCode/rayPicApi.png" 
  lang="zh">
</DemoBlock>

## 视频

#### getVideoInfo

##### 功能描述

获取视频信息

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getVideoInfo } from '@ray-js/ray'
getVideoInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getVideoInfo({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                 |
| -------- | -------- | ------ | ---- | ---------------------------------------------------- |
| src      | string   |        | 是   | 视频文件路径，可以是临时文件路径也可以是永久文件路径 |
| success  | function |        | 否   | 接口调用成功的回调函数                               |
| fail     | function |        | 否   | 接口调用失败的回调函数                               |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）     |

##### 返回结果

**success**

| 属性        | 类型   | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width       | number | 图片原始宽度，单位 px。不考虑旋转。                                                                                                                                                                                                                                                                                                                                                                                                                               |
| height      | number | 图片原始高度，单位 px。不考虑旋转。                                                                                                                                                                                                                                                                                                                                                                                                                               |
| orientation | string | 画面方向
合法值 说明
up 默认方向（手机横持拍照），对应 Exif 中的 1。或无 orientation 信息。
up-mirrored 同 up，但镜像翻转，对应 Exif 中的 2
down 旋转 180 度，对应 Exif 中的 3
down-mirrored 同 down，但镜像翻转，对应 Exif 中的 4
left-mirrored 同 left，但镜像翻转，对应 Exif 中的 5
right 顺时针旋转 90 度，对应 Exif 中的 6
right-mirrored 同 right，但镜像翻转，对应 Exif 中的 7
left 逆时针旋转 90 度，对应 Exif 中的 8 |
| type        | string | 视频格式                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| duration    | number | 视频时长                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| size        | number | 视频大小，单位 kB                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| fps         | number | 视频帧率                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| bitrate     | number | 视频码率，单位 kbps                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx
import { getVideoInfo } from '@ray-js/ray';

getVideoInfo({
  src: 'thingfile//tmp/VID20240923140949.mp4',
  success: (res) => {
    console.log('getImageInfo success', res);
  },
  fail: (res) => {
    console.log('getImageInfo fail', res);
  },
  complete: () => {
    console.log('getImageInfo complete');
  }
});
```

###### 成功示例

```json
{
  "bitrate": 30,
  "duration": 5.038,
  "fps": 120,
  "height": 720,
  "orientation": "up",
  "size": 1575,
  "type": "mp4",
  "width": 1280
}
```

###### 失败示例

```json
{
  "errorCode": 10022,
  "errorMsg": "media info parse error"
}
```

##### 错误码

| 错误码 | 错误描述                            |
| ------ | ----------------------------------- |
| 6      | The parameter format is incorrect   |
| 10022  | media info parse error              |
| 10023  | nvalid params when parse media info |
#### saveVideoToPhotosAlbum

##### 功能描述

保存视频到系统相册，支持 mp4 视频格式，需要相册权限

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { saveVideoToPhotosAlbum } from '@ray-js/ray'
saveVideoToPhotosAlbum({ ... })
```

**原生小程序中使用**

```javascript
ty.saveVideoToPhotosAlbum({ ... })
```

##### 请求参数

**Object object**

| 属性               | 类型     | 默认值  | 必填 | 说明                                                                                                |
| ------------------ | -------- | ------- | ---- | --------------------------------------------------------------------------------------------------- |
| filePath           | string   |         | 是   | 视频文件路径，可以是临时文件路径也可以是永久文件路径 \(本地路径\)                                   |
| modifyCreationDate | boolean  | `false` | 否   | 是否修改视频的创建日期
默认 false，不修改视频的创建日期。ture，修改视频的创建日期为当前保存时间 |
| success            | function |         | 否   | 接口调用成功的回调函数                                                                              |
| fail               | function |         | 否   | 接口调用失败的回调函数                                                                              |
| complete           | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                    |

##### 返回结果

**success**

| 属性            | 类型   | 说明           |
| --------------- | ------ | -------------- |
| localIdentifier | string | 相册视频标识符 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                            |
| ------ | ----------------------------------- |
| 8      | Method Unauthorized access          |
| 10023  | nvalid params when parse media info |
| 10024  | invalid params when save video      |
| 10025  | save video error                    |
#### clipVideo

##### 功能描述

裁剪视频

> 需引入`BaseKit`，且在`>=3.14.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
// @ray-js/ray>=1.6.0
import { clipVideo } from '@ray-js/ray'
clipVideo({ ... })
```

**原生小程序中使用**

```javascript
ty.clipVideo({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                                                                                                                                |
| --------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| filePath  | string   |        | 是   | 视频文件路径，可以是临时文件路径也可以是永久文件路径 \(本地路径\)                                                                                   |
| startTime | number   |        | 是   | 开始时间，毫秒                                                                                                                                      |
| endTime   | number   |        | 是   | 结束时间，毫秒                                                                                                                                      |
| level     | number   |        | 是   | 目标压缩的分辨率
1 - 480*854 码率：1572*1000
2 - 540*960 码率：2128*1000
3 - 720*1280 码率：3145*1000
4 - 1080*1920 码率：3500*1000 |
| success   | function |        | 否   | 接口调用成功的回调函数                                                                                                                              |
| fail      | function |        | 否   | 接口调用失败的回调函数                                                                                                                              |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                    |

##### 返回结果

**success**

| 属性          | 类型   | 说明         |
| ------------- | ------ | ------------ |
| videoClipPath | string | 裁剪视频路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
### 录音

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/map" 
  qrCodeUrl="/images/qrCode/map.png" 
  lang="zh">
</DemoBlock>
### 音频

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayAudio" 
  qrCodeUrl="/images/qrCode/rayAudio.png" 
  lang="zh">
</DemoBlock>
