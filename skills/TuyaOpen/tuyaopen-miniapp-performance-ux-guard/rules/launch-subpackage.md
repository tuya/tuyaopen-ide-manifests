---
id: launch-subpackage
priority: CRITICAL
category: Launch > Package
---

# 大型项目须使用分包加载

## Rule
包体较大的项目必须使用分包加载，主包仅保留首页和公共依赖

## Bad
```json
{
  "pages": [
    "pages/home/index",
    "pages/detail/index",
    "pages/settings/index",
    "pages/profile/index"
  ]
}
```
主包过大，启动需下载全部代码。

## Good
```json
{
  "pages": ["pages/home/index"],
  "subPackages": [
    {
      "root": "package-detail",
      "pages": ["pages/detail/index"]
    }
  ]
}
```
使用 subPackages 将非首屏页面拆入子包，主包 ≤2MB。

## Why
主包体积直接影响小程序启动速度。分包后主包仅下载首屏所需代码，启动耗时可缩短 30-50%。
