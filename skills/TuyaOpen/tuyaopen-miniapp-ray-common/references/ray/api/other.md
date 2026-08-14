# 其它 (other)

### changeDebugMode

#### 功能描述

设置 vconsole 调试模式开关
true: 开启 vconsole
false: 关闭 vconsole

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { changeDebugMode } from '@ray-js/ray'
changeDebugMode({ ... })
```

**原生小程序中使用**

```javascript
ty.changeDebugMode({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| isEnable | boolean  |        | 是   | 调试模式开关                                     |
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
### ty.panel.initPanelKit

初始化面板基础能力

1. 用于初始化面板基础能力（注册 [设备](/cn/miniapp/develop/ray/api/device-info/info/registerDeviceListListener) / [群组](/cn/miniapp/develop/ray/api/group/common/control/registerGroupChange) 事件监听），若无特殊业务需求（如：监听当前设备以外的其他设备 DP 状态、设备信息等变更），业务不需要再调用 ty.device.registerDeviceListListener 或 ty.device.registerGroupChange 方法。
2. 用于创建设备上下线监听，设备离线后弹出离线弹窗，若无特殊需求，业务不需要再开发离线弹窗界面及逻辑。

**类型**

<Alert type="info">
  deviceId 或 groupId 二者必填其一
</Alert>

```typescript
type PanelKitInitConfig = {
  /**
   * 设备 ID
   */
  deviceId?: string;
  /**
   * 群组 ID
   */
  groupId?: string;

  /**
   * @description 是否使用默认离线弹窗
   * @default true
   */
  useDefaultOffline: boolean;
  /**
   * 蓝牙 toast 是否需要覆盖界面
   * @default false
   * @version 2.10.4
   */
  bleCover?: boolean;

  /**
   * @description 自定义导航栏后，需要配置高度
   * @default 0
   * @version 2.10.4
   */
  customTop?: string;

  /**
   * @description 是否显示蓝牙连接状态提示
   *
   * @default true
   * @version 2.10.4
   */
  showBLEToast?: boolean;

  /**
   * @description 蓝牙连接类型。0 : 网关和app都需要，默认值，本地和网关两个途径任何一个可用均可生效 1 : 仅app，只会判定本地是否在线，以及本地连接是否成功 2 : 仅网关连接，只会判定网关是否在线，以及坚持网关连接是否成功
   * @default 0
   */
  bleConnectType?: number;
};
```

**请求参数**

| 参数   | 数据类型             | 说明                   | 是否必填 |
| :----- | :------------------- | :--------------------- | :------- |
| config | `PanelKitInitConfig` | 初始化面板基础能力配置 | 是       |

**返回参数**

无

**请求示例**

```typescript
ty.panel.initPanelKit({ deviceId: 'vdev1234567' });
```

**返回示例**

无

**注意事项**

如果需要自定义设备离线的多语言词条，可参考下方 JSON 数据自行在 涂鸦开发者平台的产品多语言或面板多语言里配置。

```json
{
  "zh": {
    "openBle": "开启系统蓝牙",
    "openBleShare": "开启“蓝牙共享”",
    "openBleShareStep": "设置 > 找到您的 App > 开启蓝牙共享",
    "deviceOfflineHelpNew": "① 确保设备通电正常（或电池电量充足）\n② 将手机尽量贴近设备\n③ 若设备曾被其他手机连接过，请先断开，再进行",
    "offline_link": "重新连接",
    "backToHome": "返回首页",
    "checkHelp": "查看帮助",
    "offline_alreadyOffline": "设备已离线",
    "offline_pleaseCheck": "请依次检查：",
    "offline_linkFront": "3. 检查是否修改了路由器的名称或密码，可以尝试",
    "offline_moreHelp": "更多帮助",
    "offline_textLinkMore": "",
    "bluetoothShareTip": "功能受限，请开启“蓝牙共享”",
    "bluetoothOfflineTip": "请开启“蓝牙”",
    "deviceOffline": "设备连接失败"
  },
  "en": {
    "openBle": "Enable System Bluetooth",
    "openBleShare": "Enable Bluetooth Sharing",
    "openBleShareStep": "Settings > Find Your App > Enable Bluetooth Sharing",
    "deviceOfflineHelpNew": "① Make sure that the device is powered on or that the battery capacity is sufficient.\n② Place the mobile phone as close as possible to the device.\n③ If the device has been connected to another mobile phone, close the connection and try to ",
    "offline_link": "reconnect the router.",
    "backToHome": "Homepage",
    "checkHelp": "View Help",
    "offline_alreadyOffline": "Offline Device",
    "offline_pleaseCheck": "Check the following items:",
    "offline_linkFront": "3. Whether the name or password of the router is modified. You can try to ",
    "offline_moreHelp": "More Help",
    "offline_textLinkMore": "",
    "bluetoothShareTip": "Limited functionality, please turn on \"Bluetooth Sharing\"",
    "bluetoothOfflineTip": "Enable Bluetooth on your mobile phone.",
    "deviceOffline": "Device Connection Failure"
  }
}
```
