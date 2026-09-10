# 网络 (network)


## 网络请求

#### RequestTask request

##### 功能描述

发起 HTTPS 网络请求

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { request } from '@ray-js/ray'
const manager = request({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.request({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型              | 默认值           | 必填 | 说明                                                                               |
| ------------ | ----------------- | ---------------- | ---- | ---------------------------------------------------------------------------------- |
| url          | string            |                  | 是   | 开发者服务器接口地址                                                               |
| data         | string            |                  | 否   | 请求的参数                                                                         |
| header       | any               |                  | 否   | 设置请求的 header，header 中不能设置 Referer。content-type 默认为 application/json |
| timeout      | number            |                  | 否   | 超时时间，单位为毫秒                                                               |
| method       | `enum` HTTPMethod | `HTTPMethod.GET` | 否   | HTTP 请求方法                                                                      |
| dataType     | string            | `"json"`         | 否   | 请求体里的数据类型（仅 Android，且请求方式不为 GET 时生效）                        |
| responseType | string            | `"text"`         | 否   | 返回的数据类型                                                                     |
| enableHttp2  | boolean           | `false`          | 否   | enableHttp2                                                                        |
| enableQuic   | boolean           | `false`          | 否   | enableQuic                                                                         |
| enableCache  | boolean           | `false`          | 否   | enableCache                                                                        |
| success      | function          |                  | 否   | 接口调用成功的回调函数                                                             |
| fail         | function          |                  | 否   | 接口调用失败的回调函数                                                             |
| complete     | function          |                  | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                   |

##### 返回结果

**success**

| 属性       | 类型     | 说明                                         |
| ---------- | -------- | -------------------------------------------- |
| data       | string   | 开发者服务器返回的数据                       |
| statusCode | number   | 开发者服务器返回的 HTTP 状态码               |
| header     | any      | 开发者服务器返回的 HTTP Response Header      |
| cookies    | string[] | 开发者服务器返回的 cookies，格式为字符串数组 |
| profile    | Profile  | 网络请求过程中一些调试信息                   |
| taskId     | string   | 网络请求 id，用户取消、监听等操作            |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` HTTPMethod**

| 枚举值  | 描述              |
| ------- | ----------------- |
| OPTIONS | HTTP 请求 OPTIONS |
| GET     | HTTP 请求 GET     |
| HEAD    | HTTP 请求 HEAD    |
| POST    | HTTP 请求 POST    |
| PUT     | HTTP 请求 PUT     |
| DELETE  | HTTP 请求 DELETE  |
| TRACE   | HTTP 请求 TRACE   |
| CONNECT | HTTP 请求 CONNECT |

**Profile**

| 属性                             | 类型    | 默认值 | 必填 | 说明                                                                                                                                                                                                                       |
| -------------------------------- | ------- | ------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| redirectStart                    | number  |        | 是   | 第一个 HTTP 重定向发生时的时间。有跳转且是同域名内的重定向才算，否则值为 0                                                                                                                                                 |
| redirectEnd                      | number  |        | 是   | 最后一个 HTTP 重定向完成时的时间。有跳转且是同域名内部的重定向才算，否则值为 0                                                                                                                                             |
| fetchStart                       | number  |        | 是   | 组件准备好使用 HTTP 请求抓取资源的时间，这发生在检查本地缓存之前                                                                                                                                                           |
| domainLookupStart                | number  |        | 是   | DNS 域名查询开始的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等                                                                                                                              |
| domainLookupEnd                  | number  |        | 是   | DNS 域名查询完成的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等                                                                                                                              |
| connectStart                     | number  |        | 是   | HTTP（TCP） 开始建立连接的时间，如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接开始的时间                                                                     |
| connectEnd                       | number  |        | 是   | HTTP（TCP） 完成建立连接的时间（完成握手），如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接完成的时间。注意这里握手结束，包括安全连接建立完成、SOCKS 授权通过 |
| SSLconnectionStart               | number  |        | 是   | SSL 建立连接的时间,如果不是安全连接,则值为 0                                                                                                                                                                               |
| SSLconnectionEnd                 | number  |        | 是   | SSL 建立完成的时间,如果不是安全连接,则值为 0                                                                                                                                                                               |
| requestStart                     | number  |        | 是   | HTTP 请求读取真实文档开始的时间（完成建立连接），包括从本地读取缓存。连接错误重连时，这里显示的也是新建立连接的时间                                                                                                        |
| requestEnd                       | number  |        | 是   | HTTP 请求读取真实文档结束的时间                                                                                                                                                                                            |
| responseStart                    | number  |        | 是   | HTTP 开始接收响应的时间（获取到第一个字节），包括从本地读取缓存                                                                                                                                                            |
| responseEnd                      | number  |        | 是   | HTTP 响应全部接收完成的时间（获取到最后一个字节），包括从本地读取缓存                                                                                                                                                      |
| rtt                              | number  |        | 是   | 当次请求连接过程中实时 rtt                                                                                                                                                                                                 |
| estimate_nettype                 | string  |        | 是   | 评估的网络状态 slow 2g/2g/3g/4g                                                                                                                                                                                            |
| httpRttEstimate                  | number  |        | 是   | 协议层根据多个请求评估当前网络的 rtt（仅供参考）                                                                                                                                                                           |
| transportRttEstimate             | number  |        | 是   | 传输层根据多个请求评估的当前网络的 rtt（仅供参考）                                                                                                                                                                         |
| downstreamThroughputKbpsEstimate | number  |        | 是   | 评估当前网络下载的 kbps                                                                                                                                                                                                    |
| throughputKbps                   | number  |        | 是   | 当前网络的实际下载 kbps                                                                                                                                                                                                    |
| peerIP                           | string  |        | 是   | 当前请求的 IP                                                                                                                                                                                                              |
| port                             | number  |        | 是   | 当前请求的端口                                                                                                                                                                                                             |
| socketReused                     | boolean |        | 是   | 是否复用连接                                                                                                                                                                                                               |
| sendBytesCount                   | number  |        | 是   | 发送的字节数                                                                                                                                                                                                               |
| receivedBytedCount               | number  |        | 是   | 收到字节数                                                                                                                                                                                                                 |

##### 返回值

`RequestTask`

##### 错误码

| 错误码 | 错误描述              |
| ------ | --------------------- |
| 10003  | network request error |
#### RequestTask

##### 功能描述

获取网络请求任务对象 RequestTask

## 上传文件

#### UploadTask uploadFile

##### 功能描述

将本地资源上传到服务器。客户端发起一个 HTTPS POST 请求，其中 content-type 为 multipart/form-data

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { uploadFile } from '@ray-js/ray'
const manager = uploadFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.uploadFile({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                |
| -------- | -------- | ------ | ---- | ------------------------------------------------------------------- |
| url      | string   |        | 是   | 开发者服务器地址                                                    |
| filePath | string   |        | 是   | 要上传文件资源的路径 \(本地路径\)                                   |
| name     | string   |        | 是   | 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容 |
| header   | any      |        | 否   | HTTP 请求的 Header，Header 中不能设置 Referer                       |
| formData | any      |        | 否   | HTTP 请求中其他额外的 form data                                     |
| timeout  | number   |        | 否   | 超时时间，单位为毫秒                                                |
| success  | function |        | 否   | 接口调用成功的回调函数                                              |
| fail     | function |        | 否   | 接口调用失败的回调函数                                              |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                    |

##### 返回结果

**success**

| 属性       | 类型   | 说明                           |
| ---------- | ------ | ------------------------------ |
| data       | string | 开发者服务器返回的数据         |
| statusCode | number | 开发者服务器返回的 HTTP 状态码 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 返回值

`UploadTask`

##### 代码示例

###### 请求示例

```jsx
import { uploadFile } from '@ray-js/ray';

uploadFile({
  url: 'https://******',
  filePath: 'thingfile://tmp/F7D6DC55-1677-46E1-B6B7-C47FB08BE7DD.jpg',
  name: 'test',
  success: (res) => {
    console.log('~ 🚀 uploadFile success', res);
  },
  fail: (err) => {
    console.log('~ 🚀 uploadFile fail', err);
  },
  complete: () => {
    console.log('~ 🚀 uploadFile complete');
  }
});
```

###### 成功示例

```json
{
  "statusCode": 200,
  "data": ""
}
```

###### 失败示例

```json
{
  "errorCode": 40013,
  "errorMsg": "domain is not configured, please configure it on the platform"
}
```

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10008  | upload file error                 |
#### UploadTask

##### 功能描述

获取网络请求任务对象 RequestTask

##### 体验 Demo

## 下载文件

#### DownloadTask downloadFile

##### 功能描述

下载文件资源到本地。客户端直接发起一个 HTTPS GET 请求，返回文件的本地临时路径 (本地路径)，单次下载允许的最大文件为 200MB。使用前请注意阅读相关说明。
注意：请在服务端响应的 header 中指定合理的 Content-Type 字段，以保证客户端正确处理文件类型。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { downloadFile } from '@ray-js/ray'
const manager = downloadFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.downloadFile({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| url      | string   |        | 是   | 下载资源的 url                                   |
| header   | any      |        | 否   | HTTP 请求的 Header，Header 中不能设置 Referer    |
| timeout  | number   |        | 否   | 超时时间，单位为毫秒                             |
| filePath | string   |        | 否   | 指定文件下载后存储的路径 \(本地路径\)            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性         | 类型    | 说明                                                                                                  |
| ------------ | ------- | ----------------------------------------------------------------------------------------------------- |
| tempFilePath | string  | 临时文件路径 \(本地路径\)。没传入 filePath 指定文件存储路径时会返回，下载后的文件会存储到一个临时文件 |
| filePath     | string  | 用户文件路径 \(本地路径\)。传入 filePath 时会返回，跟传入的 filePath 一致                             |
| statusCode   | number  | 开发者服务器返回的 HTTP 状态码                                                                        |
| profile      | Profile | 网络请求过程中一些调试信息                                                                            |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**Profile**

| 属性                             | 类型    | 默认值 | 必填 | 说明                                                                                                                                                                                                                       |
| -------------------------------- | ------- | ------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| redirectStart                    | number  |        | 是   | 第一个 HTTP 重定向发生时的时间。有跳转且是同域名内的重定向才算，否则值为 0                                                                                                                                                 |
| redirectEnd                      | number  |        | 是   | 最后一个 HTTP 重定向完成时的时间。有跳转且是同域名内部的重定向才算，否则值为 0                                                                                                                                             |
| fetchStart                       | number  |        | 是   | 组件准备好使用 HTTP 请求抓取资源的时间，这发生在检查本地缓存之前                                                                                                                                                           |
| domainLookupStart                | number  |        | 是   | DNS 域名查询开始的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等                                                                                                                              |
| domainLookupEnd                  | number  |        | 是   | DNS 域名查询完成的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等                                                                                                                              |
| connectStart                     | number  |        | 是   | HTTP（TCP） 开始建立连接的时间，如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接开始的时间                                                                     |
| connectEnd                       | number  |        | 是   | HTTP（TCP） 完成建立连接的时间（完成握手），如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接完成的时间。注意这里握手结束，包括安全连接建立完成、SOCKS 授权通过 |
| SSLconnectionStart               | number  |        | 是   | SSL 建立连接的时间,如果不是安全连接,则值为 0                                                                                                                                                                               |
| SSLconnectionEnd                 | number  |        | 是   | SSL 建立完成的时间,如果不是安全连接,则值为 0                                                                                                                                                                               |
| requestStart                     | number  |        | 是   | HTTP 请求读取真实文档开始的时间（完成建立连接），包括从本地读取缓存。连接错误重连时，这里显示的也是新建立连接的时间                                                                                                        |
| requestEnd                       | number  |        | 是   | HTTP 请求读取真实文档结束的时间                                                                                                                                                                                            |
| responseStart                    | number  |        | 是   | HTTP 开始接收响应的时间（获取到第一个字节），包括从本地读取缓存                                                                                                                                                            |
| responseEnd                      | number  |        | 是   | HTTP 响应全部接收完成的时间（获取到最后一个字节），包括从本地读取缓存                                                                                                                                                      |
| rtt                              | number  |        | 是   | 当次请求连接过程中实时 rtt                                                                                                                                                                                                 |
| estimate_nettype                 | string  |        | 是   | 评估的网络状态 slow 2g/2g/3g/4g                                                                                                                                                                                            |
| httpRttEstimate                  | number  |        | 是   | 协议层根据多个请求评估当前网络的 rtt（仅供参考）                                                                                                                                                                           |
| transportRttEstimate             | number  |        | 是   | 传输层根据多个请求评估的当前网络的 rtt（仅供参考）                                                                                                                                                                         |
| downstreamThroughputKbpsEstimate | number  |        | 是   | 评估当前网络下载的 kbps                                                                                                                                                                                                    |
| throughputKbps                   | number  |        | 是   | 当前网络的实际下载 kbps                                                                                                                                                                                                    |
| peerIP                           | string  |        | 是   | 当前请求的 IP                                                                                                                                                                                                              |
| port                             | number  |        | 是   | 当前请求的端口                                                                                                                                                                                                             |
| socketReused                     | boolean |        | 是   | 是否复用连接                                                                                                                                                                                                               |
| sendBytesCount                   | number  |        | 是   | 发送的字节数                                                                                                                                                                                                               |
| receivedBytedCount               | number  |        | 是   | 收到字节数                                                                                                                                                                                                                 |

##### 返回值

`DownloadTask`

##### 代码示例

###### 请求示例

```jsx
import { downloadFile } from '@ray-js/ray';

downloadFile({
  url: 'https://images.tuyacn.com/rms-static/ef2b8b60-4756-11eb-a066-2bc8444523c6-1608972427030.png?tyName=logo.png',
  success: (res) => {
    console.log('~ 🚀 downloadFile success', res);
  },
  fail: (err) => {
    console.log('~ 🚀 downloadFile fail', err);
  },
  complete: () => {
    console.log('~ 🚀 downloadFile complete');
  }
});
```

###### 成功示例

```json
{
  "statusCode": 200,
  "tempFilePath": "thingfile://tmp/63868997-5E75-4794-BF45-2883A337E63F.png"
}
```

###### 失败示例

```json
{
  "errorCode": 6,
  "errorMsg": "The parameter format is incorrect"
}
```

##### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 10007  | download file error                  |
#### DownloadTask

##### 功能描述

一个可以监听下载进度变化事件，以及取消下载任务的对象

##### 体验 Demo
### apiRequestByHighway

#### 功能描述

发起 `highway` 请求

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { apiRequestByHighway } from '@ray-js/ray'
apiRequestByHighway({ ... })
```

**原生小程序中使用**

```javascript
ty.apiRequestByHighway({ ... })
```

#### 请求参数

**Object object**

| 属性         | 类型              | 默认值           | 必填 | 说明                                                                               |
| ------------ | ----------------- | ---------------- | ---- | ---------------------------------------------------------------------------------- |
| api          | string            |                  | 是   | api名称           |
| data         | string            |                  | 否   | data 请求入参                      |
| method       | `enum` HighwayMethod  | `HighwayMethod.GET`   | 否   |  method 请求方法    |
| success      | function          |                  | 否   | 接口调用成功的回调函数                  |
| fail         | function          |                  | 否   | 接口调用失败的回调函数                  |
| complete     | function          |                  | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）  |

#### 返回结果

**success**

| 属性       | 类型     | 说明                                         |
| ---------- | -------- | -------------------------------------------- |
| thingjson  | object   | 接口返回数据的序列化对象，序列化失败时为 null    |
| data | string   | 接口返回的原始数据               |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 引用对象

**`enum` HighwayMethod**

| 枚举值  | 描述              |
| ------- | ----------------- |
| OPTIONS | HTTP 请求 OPTIONS |
| GET     | HTTP 请求 GET     |
| HEAD    | HTTP 请求 HEAD    |
| POST    | HTTP 请求 POST    |
| PUT     | HTTP 请求 PUT     |
| DELETE  | HTTP 请求 DELETE  |
| TRACE   | HTTP 请求 TRACE   |
| CONNECT | HTTP 请求 CONNECT |

#### 错误码

| 错误码 | 错误描述              |
| ------ | --------------------- |
| 5  | The necessary parameters are missing |
| 40015  | miniapp highway request error |
