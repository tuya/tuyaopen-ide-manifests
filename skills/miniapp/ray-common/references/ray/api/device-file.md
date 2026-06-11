# 设备云存文件管理 (device-file)


## 文件上传通用方法

#### fetchDeviceFileDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取云存文件详情

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileNo` | `string` | 是 | 云存文件 id |
| `devId` | `string` | 是 | 设备 id |

##### 返回值

类型: `Promise<Audio>`

Audio：fileNo、fileName、publicUrl（云存文件地址）

###### Audio

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileNo` | `string` | 是 | 云存文件 id（与上传、下载、删除等接口中的 fileNo 一致） |
| `fileName` | `string` | 是 | 展示用文件名 |
| `publicUrl` | `string` | 否 | 可公开访问的云存文件地址（若有） |

##### 示例代码

###### 请求示例

```typescript
import { fetchDeviceFileDetail } from '@tuya-miniapp/cloud-api';

fetchDeviceFileDetail('cloud-file-id', 'vdevo167504******003')
  .then((detail) => {
    console.log(detail);
  })
  .catch();
```

###### 返回示例

```json
{
  "fileNo": "cloud-file-id",
  "fileName": "clip.wav",
  "publicUrl": "https://example.com/storage/clip.wav"
}
```
#### fetchDeviceFileSign

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取临时地址上传签名

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizType` | `string` | 是 | 业务类型 |
| `fileName` | `string` | 是 | 待存文件名称 |
| `contentType` | `string` | 是 | 待存文件分类 |

##### 返回值

类型: `Promise<FileSign>`

FileSign：action（临时存储签名）、token（存储结果查询 key）

###### FileSign

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 临时存储签名（随上传 SDK 使用） |
| `token` | `string` | 是 | 存储结果查询 key，用于 `fetchDeviceFileUploadState` |

##### 示例代码

###### 请求示例

```typescript
import { fetchDeviceFileSign } from '@tuya-miniapp/cloud-api';

fetchDeviceFileSign('pet_media', 'clip.wav', 'audio/wav')
  .then((sign) => {
    console.log(sign);
  })
  .catch();
```

###### 返回示例

```json
{
  "action": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "upload-token-abc123"
}
```
#### fetchDeviceFileUploadState

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取上传状态

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `uploadToken` | `string` | 是 | 存储结果查询 key |

##### 返回值

类型: `Promise<UploadState>`

UploadState：bizUrl（长期云存地址）、pollingToken（大文件存储结果轮询 key）

###### UploadState

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizUrl` | `string` | 否 | 长期云存访问地址（上传完成且就绪后返回） |
| `pollingToken` | `string` | 否 | 大文件场景下用于轮询结果的 token，传给 `fetchBigPublicFileUploadState` |

##### 示例代码

###### 请求示例

```typescript
import { fetchDeviceFileUploadState } from '@tuya-miniapp/cloud-api';

fetchDeviceFileUploadState('upload-token-from-sign')
  .then((state) => {
    console.log(state);
  })
  .catch();
```

###### 返回示例

```json
{
  "bizUrl": "https://example.com/cloud/clip.wav",
  "pollingToken": ""
}
```
#### fetchBigPublicFileUploadState

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

轮询大文件上传状态

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `pollingToken` | `string` | 是 | 大文件存储结果轮询 key |

##### 返回值

类型: `Promise<UploadState>`

UploadState：bizUrl（长期云存地址）

###### UploadState

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizUrl` | `string` | 否 | 长期云存访问地址（上传完成且就绪后返回） |
| `pollingToken` | `string` | 否 | 大文件场景下用于轮询结果的 token，传给 `fetchBigPublicFileUploadState` |

##### 示例代码

###### 请求示例

```typescript
import { fetchBigPublicFileUploadState } from '@tuya-miniapp/cloud-api';

fetchBigPublicFileUploadState('polling-token-from-upload-state')
  .then((state) => {
    console.log(state);
  })
  .catch();
```

###### 返回示例

```json
{
  "bizUrl": "https://example.com/cloud/large-file.mp4",
  "pollingToken": ""
}
```
