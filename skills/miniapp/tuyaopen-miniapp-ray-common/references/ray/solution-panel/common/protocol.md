# 功能点解析集

[AI-generated summary: 本文档介绍了Ray平台中的功能点解析集（protocols）模块，该模块封装了标准化的设备功能点协议解析类，通过@ray-js/panel-sdk提供给开发者使用。涵盖了安装、使用方法、以及在垂直品类中的能力集和模块集集成等核心内容。。覆盖内容：protocols，功能点解析集，@ray-js/panel-sdk，设备功能点，协议解析，包装，安装，使用，导入，导出，垂直品类，能力集，模块集，智能产品开发，标准化]

功能点解析集（protocols）指的是一系列在您开发控制设备面板业务的时候需要用到的一些标准化的设备功能点协议解析类，我们在 @ray-js/panel-sdk 中做了一层包装，帮助您更方便的开发智能产品。

## 安装

```shell
$ yarn add @ray-js/panel-sdk
```

## 使用

```javascript
import { protocols } from '@ray-js/panel-sdk';

// 具体的导出项和用法可参考垂直品类下的"能力集"或"模块集"
const { xxx } = protocols;
```
