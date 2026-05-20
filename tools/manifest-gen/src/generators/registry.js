import * as gpio   from './platform/peripherals/gpio.js'
import * as uart   from './platform/peripherals/uart.js'
import * as i2c    from './platform/peripherals/i2c.js'
import * as spi    from './platform/peripherals/spi.js'
import * as qspi   from './platform/peripherals/qspi.js'
import * as pwm    from './platform/peripherals/pwm.js'
import * as adc    from './platform/peripherals/adc.js'
import * as timer  from './platform/peripherals/timer.js'
import * as wdt    from './platform/peripherals/wdt.js'
import * as rtc    from './platform/peripherals/rtc.js'
import * as flash  from './platform/peripherals/flash.js'
import * as pinmux from './platform/peripherals/pinmux.js'
import * as dma2d  from './platform/peripherals/dma2d.js'
import * as rgb    from './platform/peripherals/rgb.js'
import * as i8080  from './platform/peripherals/i8080.js'
import * as dvp    from './platform/peripherals/dvp.js'
import * as kws    from './platform/peripherals/kws.js'
import * as vad    from './platform/peripherals/vad.js'

// 新增外设：在此添加 import 和数组条目，其余代码无需修改
export const peripheralModules = [
  gpio, uart, i2c, spi, qspi, pwm, adc,
  timer, wdt, rtc, flash, pinmux,
  dma2d, rgb, i8080, dvp, kws, vad,
]
