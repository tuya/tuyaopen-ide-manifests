// AUTO-GENERATED from peripheral-templates/index.json — do NOT edit by hand.
// Regenerate via: node scripts/sync-peripheral-templates.mjs
export default {
  "audio": {
    "label": {
      "en": "Audio",
      "zh-CN": "音频"
    },
    "interfaces": [
      "INTERNAL",
      "I2S"
    ],
    "pins": {
      "INTERNAL": [
        "spk_en"
      ],
      "I2S": [
        "bck",
        "ws",
        "din",
        "dout",
        "mclk",
        "spk_en"
      ]
    },
    "fields": [],
    "audioDecoder": {
      "options": [
        "NONE",
        "ES8311",
        "ES8388",
        "ES8389"
      ],
      "decoderPinInterface": "I2C",
      "decoderPins": [
        "scl",
        "sda"
      ]
    }
  },
  "display": {
    "label": {
      "en": "Display",
      "zh-CN": "显示屏"
    },
    "interfaces": [
      "SPI",
      "QSPI",
      "I2C",
      "RGB",
      "MCU8080"
    ],
    "pins": {
      "SPI": [
        "sck",
        "mosi",
        "cs",
        "dc",
        "rst",
        "bl",
        "power"
      ],
      "QSPI": [
        "sck",
        "cs",
        "d0",
        "d1",
        "d2",
        "d3",
        "dc",
        "rst",
        "bl",
        "power"
      ],
      "I2C": [
        "scl",
        "sda",
        "rst",
        "bl",
        "power"
      ],
      "RGB": [
        "spi_sck",
        "spi_mosi",
        "spi_cs",
        "spi_dc",
        "rst",
        "pclk",
        "de",
        "hsync",
        "vsync",
        "r0",
        "r1",
        "r2",
        "r3",
        "r4",
        "r5",
        "r6",
        "r7",
        "g0",
        "g1",
        "g2",
        "g3",
        "g4",
        "g5",
        "g6",
        "g7",
        "b0",
        "b1",
        "b2",
        "b3",
        "b4",
        "b5",
        "b6",
        "b7",
        "bl",
        "power"
      ],
      "MCU8080": [
        "wr",
        "rd",
        "cs",
        "dc",
        "rst",
        "bl",
        "power",
        "d0",
        "d1",
        "d2",
        "d3",
        "d4",
        "d5",
        "d6",
        "d7",
        "d8",
        "d9",
        "d10",
        "d11",
        "d12",
        "d13",
        "d14",
        "d15",
        "d16",
        "d17"
      ]
    },
    "fields": [
      "model",
      "resolution",
      "pixelFormat",
      "backlight"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestionsByInterface": {
      "SPI": [
        "GC9A01",
        "GC9D01",
        "ILI9341",
        "ST7735S",
        "ST7305",
        "ST7306",
        "ST7789",
        "UC8276"
      ],
      "QSPI": [
        "CO5300",
        "NV3041"
      ],
      "RGB": [
        "ILI9488",
        "ST7701S",
        "ST7701SN"
      ],
      "MCU8080": [
        "ST7789",
        "ST7796S"
      ],
      "I2C": [
        "SSD1306"
      ]
    },
    "pixelFormatByInterface": {
      "RGB": [
        "RGB565",
        "RGB666",
        "RGB888"
      ],
      "SPI": [
        "RGB565",
        "RGB888",
        "MONOCHROME",
        "GRAYSCALE2"
      ],
      "QSPI": [
        "RGB565",
        "RGB888"
      ],
      "MCU8080": [
        "RGB565",
        "RGB888"
      ],
      "I2C": [
        "MONOCHROME",
        "GRAYSCALE2"
      ]
    },
    "pinGroupsByPixelFormat": {
      "RGB": {
        "RGB565": [
          {
            "labelKey": "periPinGroupSwSpi",
            "pins": [
              "spi_sck",
              "spi_mosi",
              "spi_cs",
              "spi_dc",
              "rst"
            ]
          },
          {
            "labelKey": "periPinGroupBacklight",
            "pins": [
              "bl"
            ]
          },
          {
            "labelKey": "periPinGroupEnable",
            "pins": [
              "power"
            ]
          },
          {
            "labelKey": "periPinGroupSync",
            "pins": [
              "pclk",
              "de",
              "hsync",
              "vsync"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupRed",
            "pins": [
              "r3",
              "r4",
              "r5",
              "r6",
              "r7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupGreen",
            "pins": [
              "g2",
              "g3",
              "g4",
              "g5",
              "g6",
              "g7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupBlue",
            "pins": [
              "b3",
              "b4",
              "b5",
              "b6",
              "b7"
            ],
            "readonly": true
          }
        ],
        "RGB666": [
          {
            "labelKey": "periPinGroupSwSpi",
            "pins": [
              "spi_sck",
              "spi_mosi",
              "spi_cs",
              "spi_dc",
              "rst"
            ]
          },
          {
            "labelKey": "periPinGroupBacklight",
            "pins": [
              "bl"
            ]
          },
          {
            "labelKey": "periPinGroupEnable",
            "pins": [
              "power"
            ]
          },
          {
            "labelKey": "periPinGroupSync",
            "pins": [
              "pclk",
              "de",
              "hsync",
              "vsync"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupRed",
            "pins": [
              "r2",
              "r3",
              "r4",
              "r5",
              "r6",
              "r7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupGreen",
            "pins": [
              "g2",
              "g3",
              "g4",
              "g5",
              "g6",
              "g7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupBlue",
            "pins": [
              "b2",
              "b3",
              "b4",
              "b5",
              "b6",
              "b7"
            ],
            "readonly": true
          }
        ],
        "RGB888": [
          {
            "labelKey": "periPinGroupSwSpi",
            "pins": [
              "spi_sck",
              "spi_mosi",
              "spi_cs",
              "spi_dc",
              "rst"
            ]
          },
          {
            "labelKey": "periPinGroupBacklight",
            "pins": [
              "bl"
            ]
          },
          {
            "labelKey": "periPinGroupEnable",
            "pins": [
              "power"
            ]
          },
          {
            "labelKey": "periPinGroupSync",
            "pins": [
              "pclk",
              "de",
              "hsync",
              "vsync"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupRed",
            "pins": [
              "r0",
              "r1",
              "r2",
              "r3",
              "r4",
              "r5",
              "r6",
              "r7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupGreen",
            "pins": [
              "g0",
              "g1",
              "g2",
              "g3",
              "g4",
              "g5",
              "g6",
              "g7"
            ],
            "readonly": true
          },
          {
            "labelKey": "periPinGroupBlue",
            "pins": [
              "b0",
              "b1",
              "b2",
              "b3",
              "b4",
              "b5",
              "b6",
              "b7"
            ],
            "readonly": true
          }
        ]
      }
    },
    "interfaceExtraFields": {
      "RGB": [
        {
          "key": "syncMode",
          "labelKey": "periRgbSyncMode",
          "type": "select",
          "options": [
            "VH",
            "DE",
            "VH+DE"
          ]
        },
        {
          "key": "clk",
          "labelKey": "periRgbClk",
          "type": "number"
        },
        {
          "key": "clkEdge",
          "labelKey": "periRgbClkEdge",
          "type": "select",
          "options": [
            "rising",
            "falling"
          ]
        },
        {
          "key": "hbp",
          "labelKey": "periRgbHBP",
          "type": "number"
        },
        {
          "key": "hfp",
          "labelKey": "periRgbHFP",
          "type": "number"
        },
        {
          "key": "vbp",
          "labelKey": "periRgbVBP",
          "type": "number"
        },
        {
          "key": "vfp",
          "labelKey": "periRgbVFP",
          "type": "number"
        },
        {
          "key": "hsw",
          "labelKey": "periRgbHSW",
          "type": "number"
        },
        {
          "key": "vsw",
          "labelKey": "periRgbVSW",
          "type": "number"
        }
      ],
      "MCU8080": [
        {
          "key": "clk",
          "labelKey": "periMcuClk",
          "type": "number"
        },
        {
          "key": "dataBits",
          "labelKey": "periMcuDataBits",
          "type": "select",
          "options": [
            "8",
            "9",
            "16",
            "18",
            "24"
          ]
        }
      ]
    },
    "pinGroups": {
      "I2C": [
        {
          "labelKey": "periPinGroupEnable",
          "pins": [
            "rst",
            "power"
          ]
        },
        {
          "labelKey": "periPinGroupBacklight",
          "pins": [
            "bl"
          ]
        },
        {
          "labelKey": "periPinGroupI2C",
          "pins": [
            "scl",
            "sda"
          ]
        }
      ],
      "SPI": [
        {
          "labelKey": "periPinGroupEnable",
          "pins": [
            "rst",
            "power"
          ]
        },
        {
          "labelKey": "periPinGroupBacklight",
          "pins": [
            "bl"
          ]
        },
        {
          "labelKey": "periPinGroupSPI",
          "pins": [
            "sck",
            "mosi",
            "cs",
            "dc"
          ]
        }
      ],
      "QSPI": [
        {
          "labelKey": "periPinGroupEnable",
          "pins": [
            "rst",
            "power"
          ]
        },
        {
          "labelKey": "periPinGroupBacklight",
          "pins": [
            "bl"
          ]
        },
        {
          "labelKey": "periPinGroupQSPI",
          "pins": [
            "sck",
            "cs",
            "d0",
            "d1",
            "d2",
            "d3",
            "dc"
          ]
        }
      ],
      "MCU8080": [
        {
          "labelKey": "periPinGroupEnable",
          "pins": [
            "rst",
            "power"
          ]
        },
        {
          "labelKey": "periPinGroupBacklight",
          "pins": [
            "bl"
          ]
        },
        {
          "labelKey": "periPinGroup8080Sync",
          "pins": [
            "wr",
            "rd",
            "cs",
            "dc"
          ]
        },
        {
          "labelKey": "periPinGroup8080Data",
          "pins": [
            "d0",
            "d1",
            "d2",
            "d3",
            "d4",
            "d5",
            "d6",
            "d7",
            "d8",
            "d9",
            "d10",
            "d11",
            "d12",
            "d13",
            "d14",
            "d15",
            "d16",
            "d17"
          ]
        }
      ]
    }
  },
  "touchpad": {
    "label": {
      "en": "Touchpad",
      "zh-CN": "触控板"
    },
    "interfaces": [
      "I2C"
    ],
    "pins": {
      "I2C": [
        "scl",
        "sda",
        "int",
        "rst"
      ]
    },
    "fields": [
      "model",
      "touchRange",
      "touchTransform"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestions": [
      "CST92XX",
      "CST816X",
      "FT6336",
      "GT911",
      "GT1151"
    ]
  },
  "camera": {
    "label": {
      "en": "Camera",
      "zh-CN": "摄像头"
    },
    "interfaces": [
      "DVP",
      "UVC"
    ],
    "pins": {
      "DVP": [
        "pclk",
        "vsync",
        "hsync",
        "mclk",
        "rst",
        "pwdn",
        "i2c_scl",
        "i2c_sda",
        "d0",
        "d1",
        "d2",
        "d3",
        "d4",
        "d5",
        "d6",
        "d7"
      ],
      "UVC": [
        "pwr_en",
        "rst"
      ]
    },
    "fields": [
      "model"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestionsByInterface": {
      "DVP": [
        "OV2640",
        "GC2145"
      ],
      "UVC": []
    },
    "interfaceExtraFields": {
      "DVP": [
        {
          "key": "i2cPort",
          "labelKey": "periDvpI2CPort",
          "type": "select",
          "options": [
            "I2C0"
          ],
          "allowEmpty": true
        },
        {
          "key": "clk",
          "labelKey": "periDvpMclk",
          "type": "number"
        }
      ]
    },
    "pinGroups": {
      "DVP": [
        {
          "labelKey": "periPinGroupControl",
          "pins": [
            "rst",
            "pwdn"
          ]
        },
        {
          "labelKey": "periPinGroupI2C",
          "pins": [
            "i2c_scl",
            "i2c_sda"
          ]
        },
        {
          "labelKey": "periPinGroupDvpSync",
          "pins": [
            "pclk",
            "vsync",
            "hsync",
            "mclk"
          ]
        },
        {
          "labelKey": "periPinGroupDvpData",
          "pins": [
            "d0",
            "d1",
            "d2",
            "d3",
            "d4",
            "d5",
            "d6",
            "d7"
          ]
        }
      ]
    }
  },
  "imu": {
    "label": {
      "en": "IMU",
      "zh-CN": "惯性传感器"
    },
    "interfaces": [
      "I2C"
    ],
    "pins": {
      "I2C": [
        "scl",
        "sda",
        "int"
      ]
    },
    "fields": [
      "model",
      "axes"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestions": [
      "BMI270"
    ]
  },
  "button": {
    "label": {
      "en": "Button",
      "zh-CN": "按键"
    },
    "interfaces": [
      "GPIO"
    ],
    "pins": {
      "GPIO": [
        "btn"
      ]
    },
    "fields": []
  },
  "led": {
    "label": {
      "en": "LED",
      "zh-CN": "指示灯"
    },
    "interfaces": [
      "GPIO",
      "RMT"
    ],
    "interfacePlatformRequires": {
      "RMT": "rmt"
    },
    "pins": {
      "GPIO": [
        "led"
      ],
      "RMT": [
        "data"
      ]
    },
    "fields": [
      "model"
    ],
    "modelLabel": {
      "en": "Chip Signal",
      "zh-CN": "芯片信号"
    },
    "modelSuggestions": [
      "WS2812"
    ],
    "modelAsSelect": true,
    "hideModelForInterface": [
      "GPIO"
    ]
  },
  "led-pixel": {
    "label": {
      "en": "LED Pixel",
      "zh-CN": "像素灯"
    },
    "interfaces": [
      "SPI",
      "SPI+PWM",
      "RMT"
    ],
    "pins": {
      "SPI": [
        "data",
        "sck"
      ],
      "SPI+PWM": [
        "data",
        "sck",
        "cold",
        "warm"
      ],
      "RMT": [
        "data"
      ]
    },
    "fields": [
      "model",
      "count"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestions": [
      "WS2812",
      "WS2812B",
      "SM16703P",
      "YX1903B"
    ],
    "interfaceExtraFields": {
      "SPI": [
        {
          "key": "lineSeq",
          "labelKey": "periPixelLineSeq",
          "type": "select",
          "options": [
            "RGB",
            "RBG",
            "GRB",
            "GBR",
            "BRG",
            "BGR"
          ]
        }
      ],
      "SPI+PWM": [
        {
          "key": "lineSeq",
          "labelKey": "periPixelLineSeq",
          "type": "select",
          "options": [
            "RGB",
            "RBG",
            "GRB",
            "GBR",
            "BRG",
            "BGR"
          ]
        },
        {
          "key": "pwmFreq",
          "labelKey": "periPixelPwmFreq",
          "type": "number",
          "min": 1000,
          "max": 20000
        },
        {
          "key": "activeLevel",
          "labelKey": "periPixelActiveLevel",
          "type": "select",
          "options": [
            "high",
            "low"
          ]
        },
        {
          "key": "pwmType",
          "labelKey": "periPixelPwmType",
          "type": "select",
          "options": [
            "CW",
            "CW_NC"
          ]
        },
        {
          "key": "pwmCh0",
          "labelKey": "periPixelPwmCh0",
          "type": "select",
          "options": []
        },
        {
          "key": "pwmCh1",
          "labelKey": "periPixelPwmCh1",
          "type": "select",
          "options": []
        }
      ],
      "RMT": [
        {
          "key": "lineSeq",
          "labelKey": "periPixelLineSeq",
          "type": "select",
          "options": ["RGB","RBG","GRB","GBR","BRG","BGR"]
        }
      ]
    },
    "pinGroups": {
      "SPI+PWM": [
        {
          "labelKey": "periPinGroupSPI",
          "pins": [
            "data",
            "sck"
          ]
        },
        {
          "labelKey": "periPinGroupPixelCW",
          "pins": [
            "cold",
            "warm"
          ]
        }
      ]
    }
  },
  "encoder": {
    "label": {
      "en": "Encoder",
      "zh-CN": "编码器"
    },
    "interfaces": [
      "GPIO"
    ],
    "pins": {
      "GPIO": [
        "a",
        "b",
        "push"
      ]
    },
    "fields": []
  },
  "ir": {
    "label": {
      "en": "IR",
      "zh-CN": "红外"
    },
    "interfaces": [
      "GPIO"
    ],
    "pins": {
      "GPIO": [
        "tx",
        "rx"
      ]
    },
    "fields": []
  },
  "joystick": {
    "label": {
      "en": "Joystick",
      "zh-CN": "摇杆"
    },
    "interfaces": [
      "ADC"
    ],
    "pins": {
      "ADC": [
        "x",
        "y",
        "btn"
      ]
    },
    "fields": []
  },
  "pmic": {
    "label": {
      "en": "PMIC",
      "zh-CN": "电源管理"
    },
    "interfaces": [
      "I2C"
    ],
    "pins": {
      "I2C": [
        "scl",
        "sda"
      ]
    },
    "fields": [
      "model"
    ],
    "modelSuggestions": [
      "AXP2101"
    ]
  },
  "io-expander": {
    "label": {
      "en": "IO Expander",
      "zh-CN": "IO 扩展芯片"
    },
    "interfaces": [
      "I2C"
    ],
    "pins": {
      "I2C": [
        "scl",
        "sda",
        "int"
      ]
    },
    "fields": [
      "model"
    ],
    "modelAsSelect": true,
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelSuggestions": [
      "XL9555",
      "PCA9555",
      "TCA9555",
      "PCF8575",
      "PCA9539",
      "MCP23017"
    ],
    "expanderPins": {
      "provides": true,
      "entryFields": [
        "pin",
        "role",
        "dir"
      ],
      "dirOptions": [
        "out",
        "in",
        "io"
      ],
      "modelPinCount": {
        "XL9555": 16,
        "PCA9555": 16,
        "TCA9555": 16,
        "PCF8575": 16,
        "PCA9539": 16,
        "MCP23017": 16,
        "PCF8574": 8
      },
      "defaultPinCount": 16
    }
  },
  "printer": {
    "label": {
      "en": "Printer",
      "zh-CN": "打印机"
    },
    "interfaces": [
      "UART",
      "SPI+PWM"
    ],
    "pins": {
      "UART": [
        "tx",
        "rx"
      ],
      "SPI+PWM": [
        "di",
        "clk",
        "lat",
        "strobe",
        "power_en",
        "motor_en",
        "paper_sensor",
        "motor_a1",
        "motor_a2",
        "motor_b1",
        "motor_b2"
      ]
    },
    "fields": [
      "model"
    ],
    "modelLabel": {
      "en": "Driver IC",
      "zh-CN": "驱动芯片"
    },
    "modelAsSelect": true,
    "modelSuggestionsByInterface": {
      "UART": [
        "DP48A"
      ],
      "SPI+PWM": [
        "MTP02"
      ]
    },
    "pinGroups": {
      "SPI+PWM": [
        {
          "labelKey": "periPinGroupControl",
          "pins": [
            "power_en",
            "motor_en"
          ]
        },
        {
          "labelKey": "periPinGroupPrinterSpi",
          "pins": [
            "di",
            "clk"
          ]
        },
        {
          "labelKey": "periPinGroupPrinterCtrl",
          "pins": [
            "lat",
            "strobe",
            "paper_sensor"
          ]
        },
        {
          "labelKey": "periPinGroupPrinterMotor",
          "pins": [
            "motor_a1",
            "motor_a2",
            "motor_b1",
            "motor_b2"
          ]
        }
      ]
    },
    "interfaceExtraFields": {
      "UART": [
        {
          "key": "baudRate",
          "labelKey": "periPrinterBaudRate",
          "type": "number",
          "min": 2400,
          "max": 115200
        }
      ],
      "SPI+PWM": [
        {
          "key": "spiClk",
          "labelKey": "periPrinterSpiClk",
          "type": "number",
          "min": 100000,
          "max": 10000000
        },
        {
          "key": "strobeMs",
          "labelKey": "periPrinterStrobeMs",
          "type": "number",
          "min": 1,
          "max": 10
        },
        {
          "key": "motorStepMs",
          "labelKey": "periPrinterMotorStepMs",
          "type": "number",
          "min": 1,
          "max": 10
        },
        {
          "key": "motorPwmDuty",
          "labelKey": "periPrinterMotorPwmDuty",
          "type": "number",
          "min": 0,
          "max": 10000
        },
        {
          "key": "motorA1",
          "labelKey": "periPrinterMotorA1",
          "type": "select",
          "options": []
        },
        {
          "key": "motorA2",
          "labelKey": "periPrinterMotorA2",
          "type": "select",
          "options": []
        },
        {
          "key": "motorB1",
          "labelKey": "periPrinterMotorB1",
          "type": "select",
          "options": []
        },
        {
          "key": "motorB2",
          "labelKey": "periPrinterMotorB2",
          "type": "select",
          "options": []
        }
      ]
    }
  },
  "sd-card": {
    "label": {
      "en": "SD Card",
      "zh-CN": "SD 卡"
    },
    "interfaces": [
      "SDIO",
      "SPI"
    ],
    "pins": {
      "SDIO": [
        "clk",
        "cmd",
        "d0",
        "d1",
        "d2",
        "d3",
        "cd"
      ],
      "SPI": [
        "sck",
        "mosi",
        "miso",
        "cs",
        "cd"
      ]
    },
    "fields": []
  }
};
