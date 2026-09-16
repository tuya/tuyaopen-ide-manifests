# 文件 (file)

### FileSystemManager getFileSystemManager

#### 功能描述

获取文件管理器，仅支持操作 App 内的文件。
如若文件操作的需要权，需另外调用权限接口申请。

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
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

#### 返回值

`FileSystemManager`
### FileSystemManager

#### 功能描述

文件管理器

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayFileSystemManager" 
  qrCodeUrl="/images/qrCode/rayFileSystemManager.png" 
  lang="zh">
</DemoBlock>

## fileSystemManager

##### FileSystemManager.access

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.access({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.access({ ... })
```

###### 功能描述

判断文件/目录是否存在

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| path     | string   |        | 是   | 要判断是否存在的文件/目录路径 \(本地路径\)       |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray';

const filePath = `${env.USER_DATA_PATH}/test.text`;

const fileManager = React.useRef(null);

const getMenager = async () => {
  fileManager.current = await getFileSystemManager();
};
getMenager();

fileManager.current.access({
  path: filePath,
  success: (res) => {
    console.log('~ 🚀 access success', res);
  },
  fail: (err) => {
    console.log('~ 🚀 access fail', err);
  }
});
```

###### 成功示例

无返回值

###### 失败示例

```json
{
  "errorCode": 10011,
  "errorMsg": "file not exist"
}
```

###### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 10011  | file not exist                       |
| 10020  | sdcard not mounted error             |
##### FileSystemManager.mkdir

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.mkdir({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.mkdir({ ... })
```

###### 功能描述

创建目录，需要文件读写权限

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型     | 默认值  | 必填 | 说明                                                                                                                                                                                                                                                    |
| --------- | -------- | ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dirPath   | string   |         | 是   | 创建的目录路径 \(本地路径\)                                                                                                                                                                                                                             |
| recursive | boolean  | `false` | 否   | 是否在递归创建该目录的上级目录后再创建该目录。如果对应的上级目录已经存在，则不创建该上级目录。
如 dirPath 为 a/b/c/d 且 recursive 为 true，将创建 a 目录，再在 a 目录下创建 b 目录，
以此类推直至创建 a/b/c 目录下的 d 目录。
默认值：false |
| success   | function |         | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                  |
| fail      | function |         | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                  |
| complete  | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                        |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray'

const dirPath = `${fileRoot}/testDir`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    fileManager.current.mkdir({
      dirPath,
      success: res => {
        console.log('~ 🚀 mkdir success', res)
      },
      fail: err => {
        console.log('~ 🚀 mkdir fail', err)
      },
    })
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

```json
{
  "errorCode": 10016,
  "errorMsg": "create dir error, File already exists"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9004   | app no permission                 |
| 10016  | create dir error                  |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.mkdirSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.mkdirSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.mkdirSync({ ... })
```

###### 功能描述

创建目录，需要文件读写权限同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型    | 默认值  | 必填 | 说明                                                                                                                                                                                                                                                    |
| --------- | ------- | ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fileId    | string  |         | 是   | taskId                                                                                                                                                                                                                                                  |
| dirPath   | string  |         | 是   | 创建的目录路径 \(本地路径\)                                                                                                                                                                                                                             |
| recursive | boolean | `false` | 否   | 是否在递归创建该目录的上级目录后再创建该目录。如果对应的上级目录已经存在，则不创建该上级目录。
如 dirPath 为 a/b/c/d 且 recursive 为 true，将创建 a 目录，再在 a 目录下创建 b 目录，
以此类推直至创建 a/b/c 目录下的 d 目录。
默认值：false |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray'

const dirPath = `${fileRoot}/testDir`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    const res = fileManager.current.mkdirSync({
      dirPath,
    })
    console.log('~ 🚀 mkdirSync', res)
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9004   | app no permission                 |
| 10016  | create dir error                  |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.readFile

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.readFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.readFile({ ... })
```

###### 功能描述

读取本地文件内容

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值   | 必填 | 说明                                                                                                                                                        |
| -------- | -------- | -------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| filePath | string   |          | 是   | 要写入的文件路径 \(本地路径\)                                                                                                                               |
| encoding | string   | `"utf8"` | 否   | 指定读取文件的字符编码。
支持 utf8/ascii/base64。如果不传 encoding，默认 utf8                                                                           |
| position | number   |          | 否   | 从文件指定位置开始读，如果不指定，则从文件头开始读。读取的范围应该是左闭右开区间 \[position, position+length\)。有效范围：\[0, fileLength - 1\]。单位：byte |
| length   | number   |          | 否   | 指定文件的长度，如果不指定，则读到文件末尾。有效范围：\[1, fileLength\]。单位：byte                                                                         |
| success  | function |          | 否   | 接口调用成功的回调函数                                                                                                                                      |
| fail     | function |          | 否   | 接口调用失败的回调函数                                                                                                                                      |
| complete | function |          | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                            |

###### 返回结果

**success**

| 属性 | 类型   | 说明     |
| ---- | ------ | -------- |
| data | string | 文件内容 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray';

const filePath = `${env.USER_DATA_PATH}/test.text`;

const fileManager = React.useRef(null);

const getMenager = async () => {
  fileManager.current = await getFileSystemManager();
};
getMenager();

const data = fileManager.current.readFile({
  filePath,
  success: (res) => {
    console.log('~ 🚀 readFile success', res);
  },
  fail: (err) => {
    console.log('~ 🚀 readFile fail', err);
  }
});
```

###### 成功示例

```json
{
  "data": "File Content"
}
```

###### 失败示例

```json
{
  "errorCode": 10011,
  "errorMsg": "file not exist"
}
```

###### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 10011  | file not exist                       |
| 10012  | read file encoding invalid           |
| 10013  | read file error                      |
##### FileSystemManager.readFileSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.readFileSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.readFileSync({ ... })
```

###### 功能描述

读取本地文件内容同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型   | 默认值   | 必填 | 说明                                                                                                                                                        |
| -------- | ------ | -------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| filePath | string |          | 是   | 要写入的文件路径 \(本地路径\)                                                                                                                               |
| encoding | string | `"utf8"` | 否   | 指定读取文件的字符编码。
支持 utf8/ascii/base64。如果不传 encoding，默认 utf8                                                                           |
| position | number |          | 否   | 从文件指定位置开始读，如果不指定，则从文件头开始读。读取的范围应该是左闭右开区间 \[position, position+length\)。有效范围：\[0, fileLength - 1\]。单位：byte |
| length   | number |          | 否   | 指定文件的长度，如果不指定，则读到文件末尾。有效范围：\[1, fileLength\]。单位：byte                                                                         |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray';

const filePath = `${env.USER_DATA_PATH}/test.text`;

const fileManager = React.useRef(null);

const getMenager = async () => {
  fileManager.current = await getFileSystemManager();
};
getMenager();

const data = fileManager.current.readFileSync({
  filePath
});
console.log('~ 🚀 readFileSync:', data);
```

###### 成功示例

```json
{
  "data": "File Content"
}
```

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 10011  | file not exist                       |
| 10012  | read file encoding invalid           |
| 10013  | read file error                      |
##### FileSystemManager.removeSavedFile

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.removeSavedFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.removeSavedFile({ ... })
```

###### 功能描述

删除已保存的本地缓存文件，需要文件读写权限

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| filePath | string   |        | 是   | 需要删除的文件路径 \(本地路径\)                  |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, authorize, env } from '@ray-js/ray'

const filePath = `${env.USER_DATA_PATH}/test.text`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    fileManager.current.removeSavedFile({
      filePath,
      success: res => {
        console.log('~ 🚀 removeSavedFile success', res)
      },
      fail: err => {
        console.log('~ 🚀 removeSavedFile fail', err)
      },
    })
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

```json
{
  "errorCode": 10011,
  "errorMsg": "file not exist"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10018  | remove saved file error           |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.rmdir

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.rmdir({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.rmdir({ ... })
```

###### 功能描述

删除目录，需要文件读写权限

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                                                                          |
| --------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------- |
| dirPath   | string   |        | 是   | 要删除的目录路径 \(本地路径\)                                                                 |
| recursive | boolean  |        | 否   | 是否递归删除目录。如果为 true，则删除该目录和该目录下的所有子目录以及文件。
默认值：false |
| success   | function |        | 否   | 接口调用成功的回调函数                                                                        |
| fail      | function |        | 否   | 接口调用失败的回调函数                                                                        |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                              |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray'

const dirPath = `${fileRoot}/testDir`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    fileManager.current.rmdir({
      dirPath,
      success: res => {
        console.log('~ 🚀 rmdir success', res)
      },
      fail: err => {
        console.log('~ 🚀 rmdir fail', err)
      },
    })
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

```json
{
  "errorCode": 10011,
  "errorMsg": "file not exist, No such directory"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10017  | delete dir error                  |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.rmdirSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.rmdirSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.rmdirSync({ ... })
```

###### 功能描述

删除目录，需要文件读写权限同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型    | 默认值 | 必填 | 说明                                                                                          |
| --------- | ------- | ------ | ---- | --------------------------------------------------------------------------------------------- |
| fileId    | string  |        | 是   | taskId                                                                                        |
| dirPath   | string  |        | 是   | 要删除的目录路径 \(本地路径\)                                                                 |
| recursive | boolean |        | 否   | 是否递归删除目录。如果为 true，则删除该目录和该目录下的所有子目录以及文件。
默认值：false |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray'

const dirPath = `${fileRoot}/testDir`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    const res = fileManager.current.rmdirSync({
      dirPath,
    })
    console.log('~ 🚀 rmdirSync', res)
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10017  | delete dir error                  |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.saveFile

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.saveFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.saveFile({ ... })
```

###### 功能描述

将文件另存一份到目标路径中。

###### 体验 Demo

###### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| tempFilePath | string   |        | 是   | 需要存储的文件的临时路径                         |
| filePath     | string   |        | 是   | 要存储的文件的目标路径                           |
| success      | function |        | 否   | 接口调用成功的回调函数                           |
| fail         | function |        | 否   | 接口调用失败的回调函数                           |
| complete     | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

| 属性          | 类型   | 说明                                    |
| ------------- | ------ | --------------------------------------- |
| savedFilePath | string | 【待废弃， 不建议使用】存储后的文件路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray';

const tempFilePath = `${env.USER_DATA_PATH}/test.text`;
const filePath = `${env.USER_DATA_PATH}/test1.text`;

const fileManager = React.useRef(null);

const getMenager = async () => {
  fileManager.current = await getFileSystemManager();
};
getMenager();

fileManager.current.saveFile({
  tempFilePath,
  filePath,
  success: (res) => {
    console.log('~ 🚀 saveFile success', res);
  },
  fail: (err) => {
    console.log('~ 🚀 saveFile fail', err);
  }
});
```

###### 成功示例

```json
{
  "savedFilePath": "thingfile://usr/test1.text"
}
```

###### 失败示例

```json
{
  "errorCode": 6,
  "errorMsg": "The parameter format is incorrect, tempFilePath file not exist"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.saveFileSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.saveFileSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.saveFileSync({ ... })
```

###### 功能描述

将文件另存一份到目标路径中。同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性         | 类型   | 默认值 | 必填 | 说明                     |
| ------------ | ------ | ------ | ---- | ------------------------ |
| fileId       | string |        | 是   | taskId                   |
| tempFilePath | string |        | 是   | 需要存储的文件的临时路径 |
| filePath     | string |        | 是   | 要存储的文件的目标路径   |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, env } from '@ray-js/ray';

const tempFilePath = `${env.USER_DATA_PATH}/test.text`;
const filePath = `${env.USER_DATA_PATH}/test1.text`;

const fileManager = React.useRef(null);

const getMenager = async () => {
  fileManager.current = await getFileSystemManager();
};
getMenager();

const data = fileManager.current.saveFileSync({
  tempFilePath,
  filePath
});
console.log('~ 🚀 saveFileSync:', data);
```

###### 成功示例

无返回值

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.stat

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.stat({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.stat({ ... })
```

###### 功能描述

获取文件 Stats 对象，需要文件读写权限

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型     | 默认值  | 必填 | 说明                                                        |
| --------- | -------- | ------- | ---- | ----------------------------------------------------------- |
| path      | string   |         | 是   | 文件/目录路径 \(本地路径\)                                  |
| recursive | boolean  | `false` | 否   | 是否递归获取目录下的每个文件的 Stats 信息
默认值：false |
| success   | function |         | 否   | 接口调用成功的回调函数                                      |
| fail      | function |         | 否   | 接口调用失败的回调函数                                      |
| complete  | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）            |

###### 返回结果

**success**

| 属性          | 类型        | 说明     |
| ------------- | ----------- | -------- |
| fileStatsList | FileStats[] | 文件列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**FileStats**

| 属性             | 类型    | 默认值 | 必填 | 说明                                          |
| ---------------- | ------- | ------ | ---- | --------------------------------------------- |
| mode             | string  |        | 是   | 文件的类型和存取的权限                        |
| size             | number  |        | 是   | 文件大小，单位：B                             |
| lastAccessedTime | number  |        | 是   | 文件最近一次被存取或被执行的时间，UNIX 时间戳 |
| lastModifiedTime | number  |        | 是   | 文件最后一次被修改的时间，UNIX 时间戳         |
| isDirectory      | boolean |        | 是   | 当前文件是否一个目录                          |
| isFile           | boolean |        | 是   | 当前文件是否一个普通文件                      |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, authorize, env } from '@ray-js/ray'

const filePath = `${env.USER_DATA_PATH}/test.text`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    fileManager.current.stat({
      path: filePath,
      success: res => {
        console.log('~ 🚀 stat success', res)
      },
      fail: err => {
        console.log('~ 🚀 stat fail', err)
      },
    })
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

```json
[
  {
    "lastAccessedTime": 1727163969,
    "isFile": true,
    "size": 12,
    "isDirectory": false,
    "lastModifiedTime": 1727163969,
    "mode": "-rw-r--r--"
  }
]
```

###### 失败示例

```json
{
  "errorCode": 9004,
  "errorMsg": "app no permission, No read permission"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10015  | get file stats error              |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.statSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.statSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.statSync({ ... })
```

###### 功能描述

获取文件 Stats 对象，需要文件读写权限同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性      | 类型    | 默认值  | 必填 | 说明                                                        |
| --------- | ------- | ------- | ---- | ----------------------------------------------------------- |
| fileId    | string  |         | 是   | taskId                                                      |
| path      | string  |         | 是   | 文件/目录路径 \(本地路径\)                                  |
| recursive | boolean | `false` | 否   | 是否递归获取目录下的每个文件的 Stats 信息
默认值：false |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**FileStats**

| 属性             | 类型    | 默认值 | 必填 | 说明                                          |
| ---------------- | ------- | ------ | ---- | --------------------------------------------- |
| mode             | string  |        | 是   | 文件的类型和存取的权限                        |
| size             | number  |        | 是   | 文件大小，单位：B                             |
| lastAccessedTime | number  |        | 是   | 文件最近一次被存取或被执行的时间，UNIX 时间戳 |
| lastModifiedTime | number  |        | 是   | 文件最后一次被修改的时间，UNIX 时间戳         |
| isDirectory      | boolean |        | 是   | 当前文件是否一个目录                          |
| isFile           | boolean |        | 是   | 当前文件是否一个普通文件                      |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, authorize, env } from '@ray-js/ray'

const filePath = `${env.USER_DATA_PATH}/test.text`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    const stat = fileManager.current.statSync({
      path: filePath,
    })
    console.log('~ 🚀 statSync', stat)
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

```json
[
  {
    "lastAccessedTime": 1727163969,
    "isFile": true,
    "size": 12,
    "isDirectory": false,
    "lastModifiedTime": 1727163969,
    "mode": "-rw-r--r--"
  }
]
```

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10015  | get file stats error              |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.writeFile

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.writeFile({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.writeFile({ ... })
```

###### 功能描述

写文件，需要文件读写权限

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值   | 必填 | 说明                                                              |
| -------- | -------- | -------- | ---- | ----------------------------------------------------------------- |
| filePath | string   |          | 是   | 要写入的文件路径 \(本地路径\)                                     |
| data     | string   |          | 是   | 要写入的文本数据, 根据 encoding 编码                              |
| encoding | string   | `"utf8"` | 否   | 指定写入文件的字符编码,目前支持【utf8、ascii、base64】, 默认 utf8 |
| success  | function |          | 否   | 接口调用成功的回调函数                                            |
| fail     | function |          | 否   | 接口调用失败的回调函数                                            |
| complete | function |          | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                  |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, authorize, env } from '@ray-js/ray'

const filePath = `${env.USER_DATA_PATH}/test.text`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    fileManager.current.writeFile({
      filePath: filePath,
      data: 'File content',
      success: res => {
        console.log('~ 🚀 writeFile success', res)
      },
      fail: err => {
        console.log('~ 🚀 writeFile fail', err)
      },
    })
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

```json
{
  "errorCode": 6,
  "errorMsg": "The parameter format is incorrect, FilePath is empty"
}
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10019  | write file error                  |
| 10020  | sdcard not mounted error          |
##### FileSystemManager.writeFileSync

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { getFileSystemManager } from '@ray-js/ray'
const manager = getFileSystemManager({ ... })
manager.writeFileSync({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.getFileSystemManager({ ... })
manager.writeFileSync({ ... })
```

###### 功能描述

写文件，需要文件读写权限同步方法

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型   | 默认值   | 必填 | 说明                                                              |
| -------- | ------ | -------- | ---- | ----------------------------------------------------------------- |
| fileId   | string |          | 是   | taskId                                                            |
| filePath | string |          | 是   | 要写入的文件路径 \(本地路径\)                                     |
| data     | string |          | 是   | 要写入的文本数据, 根据 encoding 编码                              |
| encoding | string | `"utf8"` | 否   | 指定写入文件的字符编码,目前支持【utf8、ascii、base64】, 默认 utf8 |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx
import { getFileSystemManager, authorize, env } from '@ray-js/ray'

const filePath = `${env.USER_DATA_PATH}/test.text`

const fileManager = React.useRef(null)

const getMenager = async () => {
  fileManager.current = await getFileSystemManager()
}
getMenager()

authorize({
  scope: 'scope.writePhotosAlbum',
  success: async () => {
    console.log('authorize success')
    const res = fileManager.current.writeFileSync({
      filePath: filePath,
      data: 'File content',
    })
    console.log('~ 🚀 writeFileSync', res)
  },
  fail: err => {
    console.log('authorize fail', err)
  },
})
```

###### 成功示例

无返回值

###### 失败示例

无返回值

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 10011  | file not exist                    |
| 10019  | write file error                  |
| 10020  | sdcard not mounted error          |
