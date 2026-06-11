# CDN 使用指南

[AI-generated summary: 本文档介绍了Tuya小程序的CDN资源使用功能，涵盖涂鸦CDN和三方CDN两种方案。涉及静态资源上传、配置管理、地区差异处理、URL获取和问题排查。覆盖内容：getCdnUrl、cdnImage.json、project.tuya.json、publicRoot、IDE上传、开发者平台、多区域配置(AY/AZ/EU/IN/UE/WE/RU)、Image组件、文件删除与替换、存储额度、useMemo优化、区域自动选择]

## 配置 CDN

### 使用涂鸦 CDN
使用涂鸦 CDN 请参考[涂鸦 CDN 使用指南](./cdn/tuya_cdn)。

### 使用三方 CDN
使用三方 CDN 请参考[三方 CDN 使用指南](./cdn/external_cdn)。

## 注意事项
- 使用涂鸦 CDN 和三方 CDN 只能选择其一，不能同时使用。

### 涂鸦 CDN 资源使用

#### 版本限制

- 基础库版本需 `>=2.26.0`
- @ray-js/ray 版本需 `>=1.6.10`
- 开发者工具版本需 `>=0.10.0`
- **不可与三方 CDN 功能同时使用**

#### 功能描述

为了减少小程序包体积，小程序提供了 CDN 资源使用功能。开发者可以将项目中的静态资源(如图片、音频等)上传到 CDN，运行时会自动替换为对应的 CDN 地址。

#### 配置 CDN

##### 工程配置

在 `project.tuya.json` 中声明需上传 CDN 的配置文件的存放目录。

```json
{
  "projectname": "miniApp",
  "i18n": true,
  "miniprogramRoot": "app/",  # 小程序源码
+ "publicRoot": "cdn/",    # 需上传 CDN 的静态资源存放目录
  "projectId": "********",
  "baseversion": "2.10.6",
  "dependencies": {
    "BaseKit": "3.0.3",
    "MiniKit": "3.0.6",
    "BizKit": "3.0.6"
  }
}
```

在项目根目录内新增 `cdn` 目录, 文件内容如下:

```
├── package.json
├── project.tuya.json
└── cdn
```

##### 开发者工具上传 CDN
在开发者工具选择文件上传之后，会自动在 cdn 目录下生成 `cdnImage.json`，例如：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg",
  "1.png": "smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg"
}
```

##### 使用限制

- 资源会先推送至中国区，然后同步到其他区域
- 当前仅支持存储 100MB 的静态资源

##### 功能说明

| 操作 | IDE | 开发者平台 |
|------|-----|-----------|
| 初始化配置文件 | ✓ | - |
| 上传文件 | ✓ | ✓ |
| 查看文件 | - | ✓ |
| 删除文件 | - | ✓ |

**上传文件：**

- IDE 上传：会自动生成 Key-Value 并写入 `cdnImage.json`，如需修改 key，请手动编辑该文件
- 平台上传：需手动在 `cdnImage.json` 中添加对应的 Key-Value 映射

**删除文件：**

1. 先在 `cdnImage.json` 中删除对应的 key-value
2. 前往[小程序开发者平台](https://platform.tuya.com/miniapp)删除文件释放额度

##### 手动管理示例

###### 示例一：通过 IDE 上传文件

**操作步骤：**

1. 在 IDE 中点击"上传 CDN 文件"按钮，选择本地图片文件 `logo.png`
2. IDE 自动生成 `cdnImage.json` 文件，内容如下：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg"
}
```

3. 在代码中使用：

```tsx
import { getCdnUrl } from '@ray-js/ray'
import cdnImage from 'cdn/cdnImage.json'

const logoUrl = getCdnUrl('logo.png', cdnImage)
```

###### 示例二：通过开发者平台上传文件

**操作步骤：**

1. 前往[小程序开发者平台](https://platform.tuya.com/miniapp)上传图片文件

2. 上传成功后，点击"复制"按钮，得到 CDN 路径：

```
smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg
```

3. 如果本地没有 `cdnImage.json` 文件，先初始化它

   点击 IDE 中的"初始化 cdnImage.json 文件"按钮：

4. 在项目的 `cdnImage.json` 中手动添加映射：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg",
  "banner.png": "smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg"
}
```

5. 在代码中使用：

```tsx
import { getCdnUrl } from '@ray-js/ray'
import cdnImage from 'cdn/cdnImage.json'

const bannerUrl = getCdnUrl('banner.png', cdnImage)
```

###### 示例三：删除或替换 CDN 文件

**场景一：彻底删除文件**

假设不再需要 `banner.png`：

1. 先在 `cdnImage.json` 中删除对应的记录：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg"
  // 已删除 "banner.png" 这一行
}
```

2. 前往[小程序开发者平台](https://platform.tuya.com/miniapp)删除对应的 CDN 文件，释放存储额度

3. 确保代码中不再引用 `banner.png`，避免图片加载失败

**场景二：替换文件**

假设需要更新 `banner.png` 为新图片：

1. 前往[小程序开发者平台](https://platform.tuya.com/miniapp)上传新图片

2. 删除旧的 CDN 文件（释放额度）

3. 在 `cdnImage.json` 中更新 CDN 路径：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg",
  "banner.png": "smart/miniapp/static/bay1754039465669v6sh/1755999999000newfile.jpeg"
}
```

4. 代码中的引用保持不变，图片会自动使用新的 CDN 地址：

```tsx
import { getCdnUrl } from '@ray-js/ray'
import cdnImage from 'cdn/cdnImage.json'

// key 不变，但会加载新图片
const bannerUrl = getCdnUrl('banner.png', cdnImage)
```

#### 项目中使用

##### 基本用法

Ray 提供了 `getCdnUrl` 方法，图片会根据当前区域自动替换为对应的 CDN 地址。

**步骤 1：导入依赖**

```tsx
import { getCdnUrl } from '@ray-js/ray'
import cdnImage from 'cdn/cdnImage.json'
```

**步骤 2：获取 CDN 地址**

```tsx
// 使用完整的 key 路径
const logoUrl = getCdnUrl('logo.png', cdnImage)
```

**步骤 3：在组件中使用**

```tsx
import { Image } from '@ray-js/ray'

<Image src={logoUrl} style={{ width: 100, height: 100 }} />
```

##### 完整示例

假设 `cdnImage.json` 内容如下：

```json
{
  "logo.png": "smart/miniapp/static/bay1754039465669v6sh/17558339266fe39741bbe.jpeg",
  "1.png": "smart/miniapp/static/bay1754039465669v6sh/1755833933000ccbfae02.jpeg"
}
```

在 React 组件中使用：

```tsx
import React from 'react'
import { Image, View, Text, getCdnUrl } from '@ray-js/ray'
import cdnImage from 'cdn/cdnImage.json'

const imageStyles = {
  base: {
    display: 'block',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  banner: {
    width: 200,
    height: 200,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
  },
}

export default function Home() {
  // 预先处理 CDN URL，避免重复调用
  const logoUrl = getCdnUrl('logo.png', cdnImage)
  const bannerUrl = getCdnUrl('1.png', cdnImage)

  return (
    <View>
      <Text>Hello CDN</Text>
      <Image src={logoUrl} style={{ ...imageStyles.base, ...imageStyles.logo }} />
      <Image src={bannerUrl} style={{ ...imageStyles.base, ...imageStyles.banner }} />
    </View>
  )
}
```

##### 注意事项

- 建议在组件外部或 `useMemo` 中预先处理 URL，避免每次渲染都调用
- CDN 地址会根据用户所在区域自动选择最近的节点，提升加载速度

#### 常见问题

**Q1: 100MB 是单个项目的额度还是所有项目共享的额度？**

A: 100MB 是当前空间下**所有小程序项目的总额度**，不是单个项目的额度。

- 同一空间内的多个小程序项目会共享这 100MB 的存储空间
- 如有空间授权，以父账号（空间所有者）的额度为准
- 例如：A 授权给 B，B 在 A 空间中操作时，使用的是 A 账号的 CDN 额度

**Q2: 如何释放 CDN 额度？**

A: 必须前往[小程序开发者平台](https://platform.tuya.com/miniapp)删除文件才能释放额度。**仅在项目中删除 `cdn/cdnImage.json` 文件或其中的记录，不会释放 CDN 额度**。

正确的删除流程：
1. 先在项目的 `cdnImage.json` 中删除对应的 key-value（避免代码引用失效）
2. 前往开发者平台删除对应的 CDN 文件（释放额度）

**Q3: 如果额度不足怎么办？**

A: 
1. 前往开发者平台查看已上传的文件，删除不再使用的资源释放额度
2. 在上传前优化图片大小，使用压缩工具（如 TinyPNG）减小文件体积

**Q4: 误删了 `cdnImage.json` 文件怎么办？**

A: `cdnImage.json` 只是本地的映射文件，删除后：
1. 开发者平台的 CDN 文件仍然存在，额度不会释放
2. 可以重新在 IDE 中点击"初始化 cdnImage.json 文件"按钮生成空模板
3. 前往开发者平台查看已上传的文件，手动重建映射关系
### 三方 CDN 资源使用

#### 版本限制

- 基础库版本需 `>=2.26.0`
- @ray-js/ray 版本需 `>=1.6.10`
- 开发者工具版本需 `>=0.8.4`
- **不可与涂鸦 CDN 功能同时使用**

#### 功能描述

为了减少小程序包体积，Ray 提供了 CDN 资源使用功能。开发者可以将项目中的静态资源(如图片、音频等)上传到 CDN，运行时会自动替换为对应的 CDN 地址。

#### 上传 CDN

开发者需要自行选择 CDN 服务商并上传资源。以下是一些主流的 CDN 服务商供参考：

- [腾讯云 CDN](https://cloud.tencent.com/product/cdn)
- [阿里云 CDN](https://www.aliyun.com/product/cdn)
- [AWS CloudFront](https://aws.amazon.com/cn/cloudfront/)
- [Cloudflare CDN](https://www.cloudflare.com/cdn/)

#### 配置 CDN

在项目中增加, 并增加一份 `cdnImage.json` 文件, 参考如下目录结构：

```
├── package.json
├── project.tuya.json
└── src
    └── cdn
        └──cdnImage.json
```

`cdnImage.json` 需要配置每个区域对应的 CDN 地址，例如：

需配置的多区标识：

- AY：中国区
- AZ：美国区
- EU：欧洲区
- IN：印度区
- UE：美东
- WE：西欧
- RU：俄罗斯

```json
{
  // 中国区
  "AY": {
    "/cdn/logo.png": "https://images.tuyacn.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://images.tuyacn.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 美国区
  "AZ": {
    "/cdn/logo.png": "https://usimagesd1448c85ulz2o4.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://usimagesd1448c85ulz2o4.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 欧洲区
  "EU": {
    "/cdn/logo.png": "https://euimagesd2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://euimagesd2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 印度区
  "IN": {
    "/cdn/logo.png": "https://inimagesd1jqokb9wptk2t.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://inimagesd1jqokb9wptk2t.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 美东
  "UE": {
    "/cdn/logo.png": "https://usimagesd1448c85ulz2o4.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://usimagesd1448c85ulz2o4.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 西欧
  "WE": {
    "/cdn/logo.png": "https://d2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://d2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  },
  // 俄罗斯
  "RU": {
    "/cdn/logo.png": "https://euimagesd2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1664528993779f7997c9a.png",
    "/cdn/1.png": "https://euimagesd2h2yqnfpu4gl5.cdn5th.com/smart/miniapp/static/1670384599c63a79781fd.png"
  }
}
```

**注意：**

1.  上述配置的 CDN 地址，需要与上传的 CDN 地址一致，否则会导致 CDN 资源替换失败。
2.  欧洲区（EU）的 CDN 地址为兜底地址，当其他区域 CDN 地址不存在时，会使用欧洲区的 CDN 地址。

#### 项目中使用

ray 提供了 `getCdnUrl` 方法，你可以图片会根据当前区域自动替换为对应的 CDN 地址。

```tsx
import { getCdnUrl } from '@ray-js/ray'
import React from 'react'
import { Image, View, Text } from '@ray-js/ray'
import cdnImage from '@/cdn/cdnImage.json'

const imageStyles = {
  base: {
    display: 'block',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  banner: {
    width: 200,
    height: 200,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
  },
}

export default function Home() {
  // 预先处理CDN URL,避免重复调用
  const logoUrl = getCdnUrl('/cdn/logo.png', cdnImage)
  const bannerUrl = getCdnUrl('/cdn/1.png', cdnImage)

  return (
    <View>
      <Text>Hello CDN</Text>
      <Image src={logoUrl} style={{ ...imageStyles.base, ...imageStyles.logo }} />
      <Image src={bannerUrl} style={{ ...imageStyles.base, ...imageStyles.banner }} />
    </View>
  )
}
```
