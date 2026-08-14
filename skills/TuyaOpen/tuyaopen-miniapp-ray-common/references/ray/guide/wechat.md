# 适配微信 (wechat)

[AI-generated summary: 本文档介绍使用Ray框架开发微信小程序的完整方案，涵盖环境搭建、项目初始化、调试发布的全流程。同时详细说明了微信SDK提供的用户管理、设备管理、设备入网等核心能力与限制。覆盖内容：@ray-js/wechat、用户登录、设备列表、设备详细、设备OTA、修改设备名称、配网插件、云函数、模板首页、模板设置页、个人中心、消息中心、WiFi AP配网、BLE配网、初始化项目、开发调试、测试发布、不支持的API]

## 简介

### 如何用 Ray 来开发微信小程序

开发者在开发面板小程序后，可以将面板小程序编译打包为微信小程序代码，当然也可以直接使用 Ray 全新开发一个微信小程序。
在微信小程序不能像 APP 里一样提供一个友好的容器为运行面板，所以开发者需要将用户状态同步、设备详细页面、设备 OTA、设备入网等能力集入到微信小程序中，以形成一个完整的（包含用户登录、添加设备、设备切换、设备消息展示，用户退出登录等）微信小程序，这样才能够在微信小程序中正常运行。

在 Ray 中提供了很多与设备控制相关的 API，除此以外，涂鸦同时也提供了微信小程序端特有的 API，并将它们集合成了 SDK: @ray-js/wechat,开发者可以使用此 SDK 开发微信的专属功能。

### SDK 提供了哪些能力

主要有以下这些能力：

<table className={styles.wechatTable}>
  <thead>
  </thead>
  <tbody>
    <tr>
      <th>模块</th>
      <th>能力</th>
    </tr>
    <tr>
      <td rowSpan="4">用户管理</td>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/user#%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95">用户登录</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/user#%E4%BF%AE%E6%94%B9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF">修改用户信息</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/user#%E7%94%A8%E6%88%B7%E9%80%80%E5%87%BA%E7%99%BB%E5%BD%95">退出登录</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/user#%E7%94%A8%E6%88%B7%E6%B3%A8%E9%94%80">注销用户</td>
    </tr>

    <tr>
      <td rowSpan="5">设备管理</td>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/device#%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E5%88%97%E8%A1%A8">设备列表</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/device#%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E8%AF%A6%E7%BB%86">设备详细</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/device#%E7%A7%BB%E9%99%A4%E8%AE%BE%E5%A4%87">设备移除</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/device#%E8%AE%BE%E5%A4%87-ota">设备OTA</td>
    </tr>
    <tr>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/device#%E4%BF%AE%E6%94%B9%E8%AE%BE%E5%A4%87%E5%90%8D%E7%A7%B0">修改设备名称</td>
    </tr>
    <tr>
      <td>设备入网</td>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/distribution">配网插件使用</td>
    </tr>
    <tr>
      <td>云函数</td>
      <td><a style={{fontWeight: 400}} href="/cn/miniapp/develop/ray/guide/wechat/advanced/cloud">请求方法</td>
    </tr>

  </tbody>
</table>
## 微信小程序

本篇快速上手文档旨在帮助您快速了解微信小程序的开发流程。完成文档阅读以后，您基本就可以基于涂鸦提供的能力，着手开发微信小程序。本文会从以下几个方面进行介绍

1.  [搭建环境](/cn/miniapp/develop/ray/guide/wechat/quick-start/environment)
2.  [初始化工程](/cn/miniapp/develop/ray/guide/wechat/quick-start/init-project)
3.  [开发调试](/cn/miniapp/develop/ray/guide/wechat/quick-start/dev-debug)
4.  [测试发布](/cn/miniapp/develop/ray/guide/wechat/quick-start/test-release)
## 项目模板

### 获取途径

支持通过以下方式来创建面板小程序项目：

- 方式一：使用官方 Ray CLI 下载工程。

  ```shell
  $ npx @ray-js/create-app my-app
  $ cd my-app
  $ yarn && yarn start
  ```

- 方式二：在 [tuya-ray-cra-template](https://github.com/tuya/tuya-ray-cra-template) GitHub 仓库查看代码或下载至本地。

  ```shell
  $ git clone https://github.com/tuya/tuya-ray-cra-template.git
  $ cd tuya-ray-cra-template/templates
  ```

- 方式三【推荐】：通过 Tuya MiniApp IDE Tuya MiniApp IDE 创建项目工程。更多详情，请参考 [快速开始 - 初始化项目工程](/cn/miniapp/develop/miniapp/guide/start/quick-start#三初始化工程)
## 模板介绍

这里主要为介绍 @ray-js/create-app 命令所提供的模板中包含的功能

### 模板首页

主要用于与设备交互： 控制设备和显示设备状态，模板中为控制单插设备做的功能，主要有：开关功能、倒计时设置、倒计时提醒。

除了设备控制功能外，首页中还放置其他功能的入口：登录入口、切换设备入口、添加设备入口、个人中心入口、消息中心入口、设备详细入口。

### 模板设置页面

设备有一些设置性功能，模板中这个页面是根据单插的设置性的功能做动态展示设置选项：一般为：上电状态、童锁开关等。

### 用户登录

主要为为 C 端用户提供登录的功能，模板中使用的是微信登录方式，开发者可以自己调整为自己所需要的登录方式。同时可以根据需要调整页面的布局，如：加入 logo 、加入隐私政策协议等

### 个人中心

此模块主要为展示用户信息，提供用户退出登录功能

### 设备详细页面

此模块包含了 设备基础信息、设备虚拟 ID、设备 OTA、设备移除 等功能

#### 设备基础信息

此页面用于展示设备名称和设备、并提供修改设备名称的能力。

#### 设备信息

此页面展示了设备虚拟 ID，并提供复制 设备虚拟 ID 的功能，以便在问题反馈或技术咨询时，将设备虚拟 ID 提供给涂鸦。

#### 设备 OTA

对于大部分的设备会需要有 OTA 升级固件的能力，此页面使用了 SDK 中提供的 OTA 相关 API 开发完成。支持通过蓝牙以及云的方式进行 OTA 升级。

### 消息中心

此模块下会展示：告警消息、家庭消息、通知消息。
## 进阶开发

在熟悉面板小程序的开发流程后，您可以阅读本系列进阶开发文档，进一步了解一些进阶的开发指引，帮助您拓展面板小程序的功能能力。进阶开发指引主要包括：

大体上可分为 4 层：

最底层为涂鸦 IoT 开放能力和微信开放能力。

在最底层上我们针对业务的需要整理并实现了基础能力层，基础能力层主要提供一些常用的基础能力：云函数、MQTT 服务、蓝牙服务、WiFi 服务、消息事件管理。

基础能力层不具备特定的场景，为了给开发者提供更为友好的开发，我们提供了业务支持层（即 SDK），这一层主要提供具备一定业务场景的 API，开发者在了解场景及 API 的使用说明后，可以进行简单的 API 调用，实现业务场景，提高效率，此层主要提供的能力有：用户状态管理能力、设备控制能力、设备 OTA 能力、ILink 接入能力、设备入网能力等。

最上层的为业务实现层，此层由开发者使用 SDK 进行开发实现，为形成一个较为完整且符合法律法合要求的小程序，大体需要实现：用户登录、个人中心、设备面板、设备配网等功能。同时，在这一层，开发者可以根据自身需要加入自己的功能模块。
## 与智能小程序的区别

### 入网能力支持情况

<table className={styles.wechatTable}>
  <thead>
  </thead>
  <tbody>
    <tr>
      <th>类型</th>
      <th>微信小程序</th>
    </tr>
    <tr>
      <td>WiFi AP 配网</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>WiFi EZ 配网</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>BLE 配网（单点蓝牙）</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Cat.1 配网</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>NB 扫码配网</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>IPC 配网</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>WiFi + BLE</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>BLE + Beacon</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Beacon配网（Beacon 1.x)</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Tuya Ble Mesh 配网</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>SIG Mesh 配网</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>WiFi 免密配网</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>有线配网</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>网关添加子设备</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>

### 不支持的能力

微信小程序目前还未支持的能力有：群组能力、大数据通道、数据透传、MQTT 发送消息、物模型（thing)、socket 能力等等

### 不支持的 API

由于微信小程序受限于微信本身提供的能力，以及其他方面的原因，所以微信 SDK 相比于 APP 存于差展示，以下为微信 SDK 未支持的 API:

<table className={styles.wechatTable}>
  <thead>
  </thead>
  <tbody>
    <tr>
      <th>名称</th>
      <th>说明</th>
    </tr>
    <tr>
      <td>addDeviceToDesk</td>
      <td>添加设备到桌面</td>
    </tr>
    <tr>
      <td>bluetoothCapabilityIsSupport</td>
      <td>蓝牙设备是否支持某个能力</td>
    </tr>
    <tr>
      <td>cancelBLEFileTransfer</td>
      <td>取消文件传输到蓝牙设备</td>
    </tr>
    <tr>
      <td>checkOTAUpdateInfo</td>
      <td>检查固件升级信息</td>
    </tr>
    <tr>
      <td>connectBTBond</td>
      <td>打开BT配对窗口</td>
    </tr>
    <tr>
      <td>createAction</td>
      <td>创建自动化动作</td>
    </tr>
    <tr>
      <td>createCondition</td>
      <td>创建自动化条件</td>
    </tr>
    <tr>
      <td>deviceIsSupportThingModel</td>
      <td>设备是否支持物模型</td>
    </tr>
    <tr>
      <td>directConnectBLEDevice</td>
      <td>直连BLE(thing)设备</td>
    </tr>
    <tr>
      <td>disconnectBTBond</td>
      <td>移除BT配对</td>
    </tr>
    <tr>
      <td>editAction</td>
      <td>编辑场景动作</td>
    </tr>
    <tr>
      <td>editCondition</td>
      <td>编辑场景条件</td>
    </tr>
    <tr>
      <td>getBTDeviceInfo</td>
      <td>获取设备BT信息</td>
    </tr>
    <tr>
      <td>getDeviceNumWithDpCode</td>
      <td>根据dpCode获取群组下具备此dpCode的设备数量</td>
    </tr>
    <tr>
      <td>getDeviceOfflineReminderState</td>
      <td>获取设备离线提醒的开关状态</td>
    </tr>
    <tr>
      <td>getDeviceOfflineReminderWarningText</td>
      <td>获取离线提醒警告内容</td>
    </tr>
    <tr>
      <td>getDeviceProperty</td>
      <td>获取设备属性</td>
    </tr>
    <tr>
      <td>getDeviceThingModelInfo</td>
      <td>获取设备物模型信息</td>
    </tr>
    <tr>
      <td>getDeviceWifiActivatorStatus</td>
      <td>连云激活-WiFi的激活状态</td>
    </tr>
    <tr>
      <td>getDpDataByMesh</td>
      <td>获取mesh子子设备的dp数据</td>
    </tr>
    <tr>
      <td>getEncryptLocalKeyWithData</td>
      <td>获取加密过的设备 localKey BLE(thing)蓝牙大数据通道传输过程中需要用到的特殊加密操作</td>
    </tr>
    <tr>
      <td>getGroupDeviceList</td>
      <td>获取群组下设备列表</td>
    </tr>
    <tr>
      <td>getGroupDeviceNum</td>
      <td>获取群组下设备数量</td>
    </tr>
    <tr>
      <td>getGroupInfo</td>
      <td>获取群组信息</td>
    </tr>
    <tr>
      <td>getGroupProperty</td>
      <td>获取群组属性</td>
    </tr>
    <tr>
      <td>getMeshDeviceId</td>
      <td>通过nodeId获取子设备的设备Id</td>
    </tr>

    <tr>
      <td>getProductInfo</td>
      <td>获取产品信息</td>
    </tr>
    <tr>
      <td>getShareDeviceInfo</td>
      <td>获取共享设备信息</td>
    </tr>
    <tr>
      <td>getSupportedThirdPartyServices</td>
      <td>获取设备支持的三方服务</td>
    </tr>
    <tr>
      <td>isDeviceSupportOfflineReminder</td>
      <td>设备是否支持离线提醒</td>
    </tr>
    <tr>
      <td>offBLEBigDataChannelDeviceToAppSuccess</td>
      <td>取消监听：大数据从设备传输到App成功的事件</td>
    </tr>
    <tr>
      <td>offBLEBigDataChannelProgressEvent</td>
      <td>取消监听：BLE(thing)大数据通道传输进度</td>
    </tr>
    <tr>
      <td>offBLEBigDataChannelUploadCloudProgress</td>
      <td>取消监听：大数据上传到云端进度的事件</td>
    </tr>
    <tr>
      <td>offBLEScanBindDevice</td>
      <td>取消监听：扫描到设备后进行通知</td>
    </tr>
    <tr>
      <td>offBLETransparentDataReport</td>
      <td>取消监听：BLE(thing)设备数据透传通道上报通知</td>
    </tr>
    <tr>
      <td>offDirectlyConnectedSearchDeviceEvent</td>
      <td>取消监听：免配网-设备扫描结果事件</td>
    </tr>
    <tr>
      <td>offFileTransferProgress</td>
      <td>取消监听：传输文件的到蓝牙设备的进度事件</td>
    </tr>
    <tr>
      <td>offGroupDpCodeChange</td>
      <td>取消监听：群组dpCode变化事件</td>
    </tr>
    <tr>
      <td>offGroupDpDataChangeEvent</td>
      <td>取消监听：群组DP变更事件</td>
    </tr>
    <tr>
      <td>offGroupInfoChange</td>
      <td>取消监听：群组内增加/移除设备事件</td>
    </tr>
    <tr>
      <td>offGroupRemovedEvent</td>
      <td>取消监听：群组移除事件</td>
    </tr>
    <tr>
      <td>offLeaveBeaconFence</td>
      <td>取消监听：远离beacon设备的事件</td>
    </tr>
    <tr>
      <td>offReceivedThingModelMessage</td>
      <td>取消监听：接收物模型消息事件</td>
    </tr>
    <tr>
      <td>offSocketMessageReceived</td>
      <td>取消监听：socket消息通道消息上报</td>
    </tr>
    <tr>
      <td>onBLEBigDataChannelDeviceToAppSuccess</td>
      <td>大数据从设备传输到App成功的事件</td>
    </tr>
    <tr>
      <td>onBLEBigDataChannelProgressEvent</td>
      <td>BLE(thing)大数据通道传输进度</td>
    </tr>
    <tr>
      <td>onBLEBigDataChannelUploadCloudProgress</td>
      <td>大数据上传到云端进度的事件</td>
    </tr>
    <tr>
      <td>onBLEScanBindDevice</td>
      <td>扫描到设备后进行通知</td>
    </tr>
    <tr>
      <td>onBLETransparentDataReport</td>
      <td>BLE(thing)设备数据透传通道上报通知</td>
    </tr>
    <tr>
      <td>onDirectlyConnectedSearchDeviceEvent</td>
      <td>免配网-设备扫描结果事件</td>
    </tr>
    <tr>
      <td>onFileTransferProgress</td>
      <td>传输文件的到蓝牙设备的进度事件</td>
    </tr>
    <tr>
      <td>onGroupDpCodeChange</td>
      <td>群组dpCode变化事件</td>
    </tr>
    <tr>
      <td>onGroupDpDataChangeEvent</td>
      <td>群组DP变更事件</td>
    </tr>
    <tr>
      <td>onGroupInfoChange</td>
      <td>群组内增加/移除设备事件</td>
    </tr>
    <tr>
      <td>onGroupRemovedEvent</td>
      <td>群组移除事件</td>
    </tr>
    <tr>
      <td>onLeaveBeaconFence</td>
      <td>远离beacon设备的事件</td>
    </tr>
    <tr>
      <td>onReceivedThingModelMessage</td>
      <td>接收物模型消息事件</td>
    </tr>
    <tr>
      <td>onSocketMessageReceived</td>
      <td>socket消息通道消息上报</td>
    </tr>
    <tr>
      <td>onTimerUpdate</td>
      <td>定时变化事件(native 页面变更定时器时会变更)</td>
    </tr>
    <tr>
      <td>openCategoryActivatorPage</td>
      <td>进入配网-选品类首页</td>
    </tr>
    <tr>
      <td>openDeviceDetailPage</td>
      <td>跳转设备详情</td>
    </tr>
    <tr>
      <td>openDeviceEdit</td>
      <td>跳转设备编辑页面</td>
    </tr>
    <tr>
      <td>openDeviceExecutionAndAnutomation</td>
      <td>跳转一键执行和自动化页面</td>
    </tr>
    <tr>
      <td>openDeviceInfo</td>
      <td>跳转设备信息页面</td>
    </tr>
    <tr>
      <td>openDeviceQuestionsAndFeedback</td>
      <td>跳转常见问题与反馈页面</td>
    </tr>
    <tr>
      <td>openDeviceWifiNetworkMonitorPage</td>
      <td>跳转设备 wifi 网络监测页面</td>
    </tr>
    <tr>
      <td>openGroupDetailPage</td>
      <td>跳转群组详情</td>
    </tr>
    <tr>
      <td>openGroupEdit</td>
      <td>跳转群组编辑页面</td>
    </tr>
    <tr>
      <td>openGroupTimerPage</td>
      <td>跳转定时界面</td>
    </tr>
    <tr>
      <td>openMeshLocalGroup</td>
      <td>跳转本地mesh群组</td>
    </tr>
    <tr>
      <td>openOTAUpgrade</td>
      <td>跳转设备升级页面</td>
    </tr>
    <tr>
      <td>openPreConditionPage</td>
      <td>打开生效时间段页面</td>
    </tr>
    <tr>
      <td>openRecommendSceneDetail</td>
      <td>打开推荐场景详情页面</td>
    </tr>
    <tr>
      <td>openReconnectPage</td>
      <td>跳转设备断线重连页面</td>
    </tr>
    <tr>
      <td>openShareDevice</td>
      <td>跳转共享设备页面</td>
    </tr>
    <tr>
      <td>openTimerPage</td>
      <td>跳转定时界面</td>
    </tr>
    <tr>
      <td>postBLEBigDataChannelWithProgress</td>
      <td>大数据通道操作，支持进度反馈</td>
    </tr>
    <tr>
      <td>postBLEFileTransfer</td>
      <td>传输文件到蓝牙设备</td>
    </tr>
    <tr>
      <td>publishBLETransparentData</td>
      <td>BLE(thing)下发透传数据</td>
    </tr>
    <tr>
      <td>publishDpsWithPipeType</td>
      <td>指定通道发送dps控制指令</td>
    </tr>
    <tr>
      <td>publishGroupDpCodes</td>
      <td>通过dpCode下发控制指令</td>
    </tr>
    <tr>
      <td>publishGroupDps</td>
      <td>群组控制</td>
    </tr>
    <tr>
      <td>publishLanMessage</td>
      <td>通过 局域网 消息通道下发消息</td>
    </tr>
    <tr>
      <td>publishMqttMessage</td>
      <td>通过 MQTT 消息通道下发消息</td>
    </tr>
    <tr>
      <td>publishSigMeshMultiDps</td>
      <td>mesh群组控制</td>
    </tr>
    <tr>
      <td>publishSocketMessage</td>
      <td>通过 Socket 消息通道下发消息</td>
    </tr>
    <tr>
      <td>publishThingModelMessage</td>
      <td>通过物模型投递消息</td>
    </tr>
    <tr>
      <td>queryDps</td>
      <td>查询 dps</td>
    </tr>
    <tr>
      <td>readBeaconFenceConfig</td>
      <td>读取beaconFence配置</td>
    </tr>
    <tr>
      <td>registerDeviceListListener</td>
      <td>注册需要监听的设备列表的监听器</td>
    </tr>
    <tr>
      <td>registerGroupChange</td>
      <td>开启对群组事件的监听</td>
    </tr>
    <tr>
      <td>registerLeaveBeaconFenceEvent</td>
      <td>注册监听远离beacon设备范围事件</td>
    </tr>
    <tr>
      <td>registerMQTTDeviceListener</td>
      <td>注册设备的MQTT信息监听</td>
    </tr>
    <tr>
      <td>registerMQTTProtocolListener</td>
      <td>注册MQTT协议监听</td>
    </tr>
    <tr>
      <td>registerTopicListListener</td>
      <td>注册需要监听的topci列表</td>
    </tr>
    <tr>
      <td>registerZigbeeGateWaySubDeviceListener</td>
      <td>注册Zigbee网关子设备监听器</td>
    </tr>
    <tr>
      <td>removeShareDevice</td>
      <td>移除共享设备</td>
    </tr>
    <tr>
      <td>saveSceneAction</td>
      <td>保存场景动作数据</td>
    </tr>
    <tr>
      <td>setDeviceProperty</td>
      <td>设置设备属性</td>
    </tr>
    <tr>
      <td>setGroupProperty</td>
      <td>设置群组的属性</td>
    </tr>
    <tr>
      <td>showSceneDialog</td>
      <td>展示场景的风格弹窗</td>
    </tr>
    <tr>
      <td>startBLEMeshLowPowerConnection</td>
      <td>发起蓝牙mesh设备直连</td>
    </tr>
    <tr>
      <td>startBLEScan</td>
      <td>开启扫描</td>
    </tr>
    <tr>
      <td>startBLEScanBindDevice</td>
      <td>在指定时间内扫描已配网设备</td>
    </tr>
    <tr>
      <td>startBLEScanSync</td>
      <td>同步执行开启扫描</td>
    </tr>
    <tr>
      <td>startDeviceWifiActivator</td>
      <td>连云激活-进行wifi激活</td>
    </tr>
    <tr>
      <td>startDirectlyConnectedDeviceActivator</td>
      <td>免配网-开始设备激活</td>
    </tr>
    <tr>
      <td>startDirectlyConnectedSearchDevice</td>
      <td>免配网-开始设备扫描</td>
    </tr>
    <tr>
      <td>stopBLEMeshLowPowerConnection</td>
      <td>断开蓝牙mesh设备连接</td>
    </tr>
    <tr>
      <td>stopBLEScan</td>
      <td>关闭扫描</td>
    </tr>
    <tr>
      <td>stopBLEScanSync</td>
      <td>同步执行关闭扫描</td>
    </tr>
    <tr>
      <td>stopDirectlyConnectedDeviceActivator</td>
      <td>免配网-停止设备激活</td>
    </tr>
    <tr>
      <td>stopDirectlyConnectedSearchDevice</td>
      <td>免配网-结束设备扫描</td>
    </tr>
    <tr>
      <td>subscribeBLETransparentDataReport</td>
      <td>开始监听BLE(thing)设备数据透传通道上报</td>
    </tr>
    <tr>
      <td>subscribeReceivedThingModelMessage</td>
      <td>订阅接受物模型消息</td>
    </tr>
    <tr>
      <td>toggleDeviceOfflineReminder</td>
      <td>离线提醒开关</td>
    </tr>
    <tr>
      <td>unRegisterGroupChange</td>
      <td>关闭对群组事件的监听</td>
    </tr>
    <tr>
      <td>unSubscribeDeviceRemoved</td>
      <td>取消订阅设备移除事件</td>
    </tr>
    <tr>
      <td>unSubscribeReceivedThingModelMessage</td>
      <td>取消订阅接收物模型消息</td>
    </tr>
    <tr>
      <td>unregisterDeviceListListener</td>
      <td>注销需要监听的设备列表的监听器</td>
    </tr>
    <tr>
      <td>unregisterLeaveBeaconFenceEvent</td>
      <td>注册监听远离beacon设备范围事件</td>
    </tr>
    <tr>
      <td>unregisterMQTTDeviceListener</td>
      <td>注销设备的MQTT信息监听</td>
    </tr>
    <tr>
      <td>unregisterMQTTProtocolListener</td>
      <td>注销MQTT协议监听</td>
    </tr>
    <tr>
      <td>unregisterTopicListListener</td>
      <td>注销需要监听的topic列表</td>
    </tr>
    <tr>
      <td>unregisterZigbeeGateWaySubDeviceListener</td>
      <td>注销Zigbee网关子设备监听器</td>
    </tr>
    <tr>
      <td>unsubscribeBLEConnectStatus</td>
      <td>停止监听BLE(thing)连接状态</td>
    </tr>
    <tr>
      <td>unsubscribeBLETransparentDataReport</td>
      <td>停止监听BLE(thing)设备数据透传通道上报</td>
    </tr>
    <tr>
      <td>updateDeviceThingModelInfo</td>
      <td>更新物模型信息</td>
    </tr>
    <tr>
      <td>validDeviceOnlineType</td>
      <td>判断设备上网类型是否与deviceModel物模型一致</td>
    </tr>
    <tr>
      <td>writeBeaconFenceConfig</td>
      <td>写入BeaconFence配置</td>
    </tr>
  </tbody>
</table>
