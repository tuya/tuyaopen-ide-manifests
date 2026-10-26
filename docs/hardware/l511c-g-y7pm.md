### 1、GPIO 

| 实际引脚编号（Tuya_pin） | 默认功能 | gpio号 | 验证情况（仅输出） | 备注 |
| --- | --- | --- | --- | --- |
| 5 | GPIO1 | GPIO20 | OK | 支持低功耗唤醒 |
| 6 | GPIO2 | GPIO21 | OK | 支持低功耗唤醒 |
| 16 | NET_STATUS | GPIO28 | OK | 网络指示灯接口占用 |
| 19 | MAIN_DTR | GPIO22 | OK | 默认作为低功耗下唤醒模组，支持低功耗，通过tkl_cellular_base_ioctl（CELL_IOCTL_CLOSE_WAKEUP_MODULE， NULL）可以关闭该功能，做gpio中断使用 |
| 20 | MAIN_RI | GPIO25 | OK | 唤醒MCU |
| 21 | MAIN_DCD | GPIO17 | OK |  |
| 22 | MAIN_CTS | GPIO1 | OK |  |
| 25 | STATUS | GPIO26 | OK |  |
| 26 | I2S_MCLK | GPIO19 | OK |  |
| 28 | AUX_RXD | GPIO10 | OK |  |
| 29 | AUX_TXD | GPIO11 | OK |  |
| 30 | PCM_CLK | GPIO29  | OK |  |
| 31 | PCM_SYNC | GPIO30 | OK |  |
| 32 | PCM_DIN | GPIO31 | OK | 中断异常 |
| 33 | PCM_DOUT | GPIO18  | OK |  |
| 49 | LCD_RST | GPIO1  | OK |  |
| 50 | LCD_SPI_OUT | GPIO9 | OK |  |
| 51 | LCD_SPI_RS | GPIO10 | OK |  |
| 52 | LCD_SPI_CS | GPIO8  | OK |  |
| 53 | LCD_SPI_CLK | GPIO11 |  OK |  |
| 54 | CAM_MCLK | GPIO3 | OK |  |
| 55 | CAM_DATA0 | GPIO20 | OK |  |
| 56 | CAM_DATA1 | GPIO21 | OK |  |
| 57 | CAM_I2C0_SCL | GPIO13 | OK |  |
| 58 | CAM_I2C0_SDA | GPIO12 | OK |             中断异常 |
| 62 | USIM2_CLK | GPIO14 | OK | 中断异常 |
| 63 | USIM2_RST | GPIO13 | OK | 中断异常 |
| 64 | USIM2_DATA | GPIO12 | OK | 中断异常 |
| 66 | I2C1_SDA | GPIO8 | OK | 中断异常 |
| 67 | I2C1_SCL | GPIO9 | OK | 中断异常 |
| 78 | LCD_TE | GPIO7 | OK | 中断异常 |
| 79 | USIM1_DET | / | OK | 默认作为sim卡热插拔检测引脚，未开启热插拔功能下可以做gpio中断使用，支持低功耗下唤醒 |
| 80 | CAM_SPI_CLK | GPIO4 | OK |  |
| 81 | CAM_PWDN | GPIO5 | OK |  |
| 82 | USB_BOOT | GPIO0 | OK |  |
| 100 | GPIO3 | GPIO23 | OK | 模组内置GPS版本被占用 |
| 101 | GPIO4 | GPIO24 | OK |  |
| 103 | CAM_RST_N | GPIO16 | OK |  |




### 2、ADC

| tuya adc | 功能 | 验证情况 | 备注 |
| --- | --- | --- | --- |
| 1 | ADC0 | OK |  |
| 2 | ADC1 | OK |  |
|  | ADC_BAT | OK |  |




### 3、I2C

| tuya I2C | 引脚编号 | I2C号 | 验证情况 | 备注 |
| --- | --- | --- | --- | --- |
| 0 | 38/39 | I2C0 | OK |  |
| 0 | 57/58 | I2C0 | OK | 在用 |
| 1 | 57/58 | I2C1 | OK |  |
| 1 | 66/67 | I2C1 | OK | 在用，外挂codec占用 |
| 1 | 80/81 | I2C1 |  |  |






### 4、PWM

| tuya pwm | 引脚编号 | pwm号 | 验证情况 | 备注 |
| --- | --- | --- | --- | --- |
| 0 | 22 | pwm0 | OK |  |
| 1 | 23 | pwm1 | OK |  |
| 2 | 54 | pwm2 | OK |  |
| 3 | 25 | pwm3 | OK |  |
| 4 | 20 | pwm4 | OK |  |




### 5、SPI（建议使用spi1外挂flash，flash最大支持32MB，spi0挂lcd或者其他外设）

| tuya spi | 引脚编号 | pwm号 | 验证情况 | 备注 |
| --- | --- | --- | --- | --- |
| 0 | 66(CS)67(MOSI)28(MISO)29(CLK) | spi0 | OK | 66(i2c_sda)67(i2c_scl)28(aux_rx)29(aux_tx) |
| 1 | 49(CLK)62(MISO)63(MOSI)64(CS) | spi1 | OK | 49(LCD_RST)62(USIM2_CLK )63(USIM2_RST)64(USIM2_DATA) |




### 6、UART

| tuya uart | 引脚编号 | uart号 | 验证情况 | 备注 |
| --- | --- | --- | --- | --- |
| 0 |  | uart0 | OK |  |
| 1 |  | uart1 | OK |  |
| 2 |  | uart2 | 待验证 |  |
| 3 |  | usb uart | OK |  |
|              |      | debug uart |  | 日志口 |




### 7、I2S

|  | 引脚编号 | 编号 | 验证情况 | 备注 |
| --- | --- | --- | --- | --- |
| 0 | 30(PCM_CLK)31(PCM_SYNC)32(PCM_DIN)33(PCM_DOUT)26(I2S_MCLK) |  | OK | 支持es8311模组 |




### 8、剩余内存

    3.12M

### 9、文件系统大小   

    300K

### 10、注意

    1、部分引脚支持多种外设，在使用时，需注意避免冲突，

    2、模组io口默认为1.8V电平，可以通过在初始化调用接口，将io口改为3.3V电平，需sdk支持



### 20、不支持项

    1）lcd接口

    3）低电压关机

    4）电池充电管理