# 示例功能封面

为原先缺图的 62 个示例提供原创功能示意封面。每张图依据对应 manifest 的名称、简介和详情绘制，展示示例主题与数据流。图片是功能示意，实机运行效果以项目文档为准。

## 文件与维护

- 每个示例目录包含 960×540 的 `cover.png` 和可编辑的 `cover.svg`。
- 索引 `demos/index.json` 的 `image` 字段包含图片路径、尺寸和中英文替代文字。
- 现有 21 张应用封面保留。
- 使用现有编辑器的 Sharp 依赖可重新渲染 SVG：

```js
// 在仓库根目录执行
import sharp from './tools/manifest-editor/node_modules/sharp/lib/index.js';
await sharp('示例目录/cover.svg').png().toFile('示例目录/cover.png');
```

## 对应示例

| 示例 | 参考项目 |
| --- | --- |
| `ble-ble-central` | https://github.com/tuya/TuyaOpen/tree/master/examples/ble/ble_central |
| `ble-ble-peripher` | https://github.com/tuya/TuyaOpen/tree/master/examples/ble/ble_peripher |
| `e-paper-1-54inch-e-paper` | https://github.com/tuya/TuyaOpen/tree/master/examples/e-Paper/1.54inch_e-Paper |
| `e-paper-2-13inch-e-paper-touch` | https://github.com/tuya/TuyaOpen/tree/master/examples/e-Paper/2.13inch_e-Paper_Touch |
| `e-paper-4-26inch-e-paper` | https://github.com/tuya/TuyaOpen/tree/master/examples/e-Paper/4.26inch_e-Paper |
| `get-started-cxx` | https://github.com/tuya/TuyaOpen/tree/master/examples/get-started/cxx |
| `get-started-sample-project` | https://github.com/tuya/TuyaOpen/tree/master/examples/get-started/sample_project |
| `graphics-lvgl-camera` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/lvgl_camera |
| `graphics-lvgl-demo` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/lvgl_demo |
| `graphics-lvgl-gif` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/lvgl_gif |
| `graphics-lvgl-label` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/lvgl_label |
| `graphics-lvgl-simulator` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/lvgl_simulator |
| `graphics-u8g2-i2c` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/u8g2_i2c |
| `graphics-u8g2-spi` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/u8g2_spi |
| `graphics-u8g2-tdl-disp` | https://github.com/tuya/TuyaOpen/tree/master/examples/graphics/u8g2_tdl_disp |
| `tflite-tflite-helloworld` | https://github.com/tuya/TuyaOpen/tree/master/examples/tflite/tflite-helloworld |
| `multimedia-audio-kws` | https://github.com/tuya/TuyaOpen/tree/master/examples/multimedia/audio_kws |
| `multimedia-audio-player-music` | https://github.com/tuya/TuyaOpen/tree/master/examples/multimedia/audio_player/music |
| `multimedia-audio-player-tts` | https://github.com/tuya/TuyaOpen/tree/master/examples/multimedia/audio_player/tts |
| `multimedia-audio-recorder-output-sdcard` | https://github.com/tuya/TuyaOpen/tree/master/examples/multimedia/audio_recorder/output_sdcard |
| `multimedia-audio-vad` | https://github.com/tuya/TuyaOpen/tree/master/examples/multimedia/audio_vad |
| `protocols-http-client` | https://github.com/tuya/TuyaOpen/tree/master/examples/protocols/http_client |
| `protocols-https-client` | https://github.com/tuya/TuyaOpen/tree/master/examples/protocols/https_client |
| `protocols-mqtt-client` | https://github.com/tuya/TuyaOpen/tree/master/examples/protocols/mqtt_client |
| `protocols-tcp-client` | https://github.com/tuya/TuyaOpen/tree/master/examples/protocols/tcp_client |
| `protocols-tcp-server` | https://github.com/tuya/TuyaOpen/tree/master/examples/protocols/tcp_server |
| `system-os-event` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_event |
| `system-os-kv` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_kv |
| `system-os-mutex` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_mutex |
| `system-os-queue` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_queue |
| `system-os-semaphore` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_semaphore |
| `system-os-sw-timer` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_sw_timer |
| `system-os-thread` | https://github.com/tuya/TuyaOpen/tree/master/examples/system/os_thread |
| `wifi-ap` | https://github.com/tuya/TuyaOpen/tree/master/examples/wifi/ap |
| `wifi-low-power` | https://github.com/tuya/TuyaOpen/tree/master/examples/wifi/low_power |
| `wifi-scan` | https://github.com/tuya/TuyaOpen/tree/master/examples/wifi/scan |
| `wifi-sta` | https://github.com/tuya/TuyaOpen/tree/master/examples/wifi/sta |
| `peripherals-adc` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/adc |
| `peripherals-audio-codecs` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/audio_codecs |
| `peripherals-button` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/button |
| `peripherals-camera-output-display` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/camera/output_display |
| `peripherals-camera-output-sdcard` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/camera/output_sdcard |
| `peripherals-display-fill-color` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/display/fill_color |
| `peripherals-display-picture` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/display/picture |
| `peripherals-encoder` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/encoder |
| `peripherals-flash` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/flash |
| `peripherals-gpio` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/gpio |
| `peripherals-i2c-i2c-scan` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/i2c/i2c_scan |
| `peripherals-i2c-sht3x-4x-sensor` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/i2c/sht3x_4x_sensor |
| `peripherals-imu-bmi270` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/imu/bmi270 |
| `peripherals-ir` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/ir |
| `peripherals-joystick` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/joystick |
| `peripherals-led` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/led |
| `peripherals-leds-pixel` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/leds-pixel |
| `peripherals-pwm` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/pwm |
| `peripherals-sd` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/sd |
| `peripherals-spi` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/spi |
| `peripherals-timer` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/timer |
| `peripherals-touch` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/touch |
| `peripherals-tp` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/tp |
| `peripherals-uart` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/uart |
| `peripherals-watchdog` | https://github.com/tuya/TuyaOpen/tree/master/examples/peripherals/watchdog |
