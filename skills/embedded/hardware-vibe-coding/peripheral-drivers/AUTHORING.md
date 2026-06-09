# 如何写一个外设 vibe-coding skill

这份指南记录了为 TuyaOpen hardware-vibe-coding 新增外设 skill 的完整流程与踩坑经验。
目标读者：给某个外设（display / camera / audio / ir / ...）补一份 `peripheral-<x>/SKILL.md`
并接入 vibe coding 路由的人。

> 核心原则：**skill 是喂给 LLM 的"事实"。LLM 会逐字照抄 skill 里的 API、include、宏。**
> 所以 skill 必须 100% 对齐真实 SDK，任何编造或遗漏都会变成生成代码里的编译错误。

---

## 0. 心法

- **不要凭记忆写 API。** 一律去 SDK 源码核对真实签名（见第 1 步）。
- **skill 里的每个 `#include` 都要能让代码自洽编过。** 漏一个 header = 生成代码编不过。
- **board-adapted vs custom 要分清**（见第 3 步），两条路径的代码完全不同。
- 写完必须跑**真编译验证**（第 6 步），不能只靠"看起来对"。

---

## 1. 先读真实 SDK（source of truth）

SDK 在 `/home/share/samba/TuyaOpen`（或本地 clone）。每个外设的结构：

```
src/peripherals/<x>/tdl_<x>/include/tdl_<x>_manage.h   ← TDL 管理层 API（应用调这层）
src/peripherals/<x>/tdl_<x>/include/tdl_<x>_driver.h    ← 枚举/回调类型定义
src/peripherals/<x>/tdd_<x>/include/tdd_<x>_*.h         ← TDD 驱动注册（custom 路径用）
src/peripherals/<x>/Kconfig                             ← ENABLE_* / NAME 宏
examples/peripherals/<x>/src/example_<x>.c              ← 官方用法范例（最重要）
boards/T5AI/<某板>/...                                   ← 真实 board 怎么注册这个外设
```

读取清单（缺一不可）：
1. `tdl_<x>_manage.h` —— 拿全部 `tdl_<x>_*()` 函数签名、handle 类型、结构体。
2. `tdl_<x>_driver.h` —— 回调 typedef、枚举（事件/格式/模式/状态）。
3. `example_<x>.c` —— **真实调用顺序**（find→open→...→close）、回调上下文规则、要不要起 task/ring buffer。
4. `Kconfig` —— `ENABLE_<X>`、`<X>_NAME` 默认值、依赖关系（如 `ENABLE_TP depends on ENABLE_DISPLAY`）。
5. 某块真实 board 的注册代码 —— custom 路径的 `tdd_<x>_register()` 参数怎么填。

把这些信息抄进 skill，**不要改写 API 名、不要简化参数**。

---

## 2. skill 文件模板

放在 `peripheral-drivers/peripheral-<x>/SKILL.md`。结构（照抄现有的 button/audio）：

```markdown
---
name: tuyaopen/peripheral-<x>
description: >-
  一句英文功能描述。<然后跟一串中英文关键词，逗号分隔，给路由匹配用>。
when_to_use: >-
  什么场景下用这个 skill。
id: peripheral-<x>
surfaces: [embedded]
tags: [<x>, ...]
---

# TuyaOpen TDL <X>

<一句话点明这个外设的关键特性：回调驱动？轮询？要不要 refresh？设备名复用？>

## Driver Registration (TDD)
board-adapted → board_register_hardware() 自动注册，应用不写。
custom → 给出 tdd_<x>_register() 的完整 cfg 范例。

## Headers
列出应用要 include 的所有 header。

## Usage Template
一段完整、能编过的 C 范例（find/open/用/close）。

## API Reference
表格：函数 | 说明。

## <枚举/事件/结构体>
列出回调用到的枚举、结构体定义。

## Enable Macro and NAME Macro
CONFIG_ENABLE_<X>=y / CONFIG_<X>_NAME。说明 board-adapted 时别写、custom 时要写。

## Reference Example
`examples/peripherals/<x>/`
```

**frontmatter 关键词要中英文都写**（路由是关键词匹配，用户可能中文也可能英文）。
例：`音频、麦克风、录音、播放、speaker、mic、codec`。

---

## 3. board-adapted vs custom —— 必须分清

| | board-adapted | custom（不在 board-context.md） |
|---|---|---|
| 谁注册驱动 | `board_register_hardware()` 自动 | 自己写 `tdd_<x>_register()`（走 usr_board） |
| 应用代码 | 只用 TDL API | usr_board 注册 + TDL API |
| Kconfig | board 已选，**不要写** `CONFIG_ENABLE_*` | **要写** `CONFIG_ENABLE_<X>=y` 到 `app_default.config` |
| 设备名 | board 定义的 NAME 宏 | 自己传名字给 register + find |

判断方法：看这个外设在不在目标 board 的 `board-context.md` 里。
- 在 → board-adapted（如 T5AI 的 audio/touch/printer）。
- 不在 → custom（如 T5AI 上的 ir/joystick/leds-pixel），skill 要写 usr_board 注册路径。

custom 外设 skill 务必让 LLM：① 写 `tdd_<x>_register()` ② 写 `CONFIG_ENABLE_<X>=y`
③ usr_board.c 里 `#include "tal_api.h"`（见踩坑 #2）。

---

## 4. 接线（5 处，缺一处路由就不命中）

skill 文件放好后，要让 vibe coding 在用户 prompt 命中关键词时把它内联进去。改这 5 处：

1. **`src/extension.ts`**（IDE 仓）`handleForwardToAiChat` 里的 `subSkillMatch` 数组 —— 加一行
   `{ name: 'peripheral-<x>', keywords: [/.../i] }`。**这是线上真正的路由**，必须改。
2. **`scripts/vibe-test-runner.mjs`** 的 `SUB_SKILL_MATCH` —— 镜像同样的关键词。
3. **`scripts/vibe-test-llm.mjs`** 的 `SUB_SKILL_MATCH` —— 镜像同样的关键词。
4. **主 `hardware-vibe-coding/SKILL.md`** Step 4 的委派表 —— 加一行类型→skill 路径。
5. **`peripheral-drivers/SKILL.md`** 的索引表 —— 加一行外设→skill+关键 API。

关键词设计：
- 中英文都要（`红外|infrared|遥控`）。
- 短词加边界防误命中（`\bir\b` 而不是裸 `ir`，否则 "wire"/"first" 会误命中）。
- 跟已有关键词重叠没关系（`灯带` 会同时命中 led 和 leds-pixel）—— 多内联一个 skill 无害，
  skill 内容会告诉 LLM 该用哪个。
- 任何外设关键词命中后，`usr-board` 会被**自动附加**（custom 路径需要它）。

---

## 5. 加测试用例

**`scripts/vibe-test-runner.mjs`**（静态：检查拼出来的 prompt 内容对不对，不调 LLM）：
加一个 `tcN`，`checks` 里断言 ① board-context 有/没有这个外设 ② 子 skill 被内联（`sm.includes('tdl_<x>_find')`）③ 关键 API 字符串在 ④ custom 的话有 `CONFIG_ENABLE_*` + usr_board。

**`scripts/vibe-test-llm.mjs`**（真生成：调 LLM 生成代码再校验）：
加同样的 `tcN`，`verify(code)` 断言生成代码里用了正确 API。custom 外设给 `followUp`
（LLM 反问引脚时自动补硬件细节）。统计调用次数用 `countCalls()`（会去注释），别用
`countOccurrences()`（会把注释里的也数进去 —— 踩坑 #4）。

---

## 6. 真编译验证（最终关，不能省）

静态 + LLM 校验只查"API 字符串在不在"，**抓不到漏 include、错 header、类型不符**。
必须用真工具链编一遍。流程（无 API token 也能跑，用订阅子 agent）：

```bash
# A. 把某外设的 example 编出 compile_commands.json（真编译器+真头路径+真宏）
cd /home/share/samba/TuyaOpen
export PATH="$PWD/.venv/bin:$PATH"           # venv 提供 python（platform_prepare 调的是 python 不是 python3）
cd examples/peripherals/<x>
printf '1\n' | python ../../../tos.py config choice   # 选 T5AI board 配置
python ../../../tos.py build                          # cmake configure 后即生成 compile_commands.json

# B. 导出 prompt → 子 agent 生成代码 → 真编译
cd <IDE 仓>
node scripts/vibe-test-llm.mjs tcN --dump-prompts     # 写出 .vibe-test-output/tcN-prompt.txt
#   用 Agent 工具喂 tcN-prompt.txt，让它生成代码写到 tcN-response.txt
node scripts/vibe-compile-check.mjs tcN <example>     # 复用 example flags 跑 -fsyntax-only
```

`vibe-compile-check.mjs` 把生成的 `.c` 用 example 的真实编译命令跑 `-fsyntax-only`，
能逐文件报出 header/类型错误。**改完 skill 要重新生成再编（不要手改打补丁）**，
这样验证的是"skill 能让 LLM 产出可编译代码"，而不是"我手动改对了"。

注意：要测的外设必须在对应 example 里**启用**（include 路径才会暴露它的 TDL 头）。
所以每个外设用它自己的 example（audio→audio_codecs, touch→tp, ir→ir, ...）。

---

## 7. 已知踩坑（真编译抓出来的，写新 skill 时直接规避）

| # | 坑 | 规避 |
|---|---|---|
| 1 | `board_register_hardware()` 的 include 不是 `board_register.h`/`board_register_hardware.h`（都不存在） | 用 **`board_com_api.h`**。已写进主 SKILL.md 的 Entry Point。 |
| 2 | usr_board.c 用 `TUYA_CALL_ERR_LOG`/`PR_ERR` 却漏 include → `implicit declaration of PR_ERR` | usr_board.c 必须 `#include "tal_api.h"`。已写进 usr-board 模板。 |
| 3 | TDL 头里用 `OUT`/`IN`/`INOUT` 注解宏 → 普通 include 链没定义、不跨平台 | **公共 TDL 头不要用注解宏，用裸指针**。`tdl_pixel_dev_manage.h` 曾犯，已改。新 skill 引用的 API 若发现这类宏，应在 SDK 侧去掉。 |
| 4 | 测试里 `countOccurrences('board_register_hardware')` 把注释里的也数进去 → 误报"调用多次" | 用 `countCalls()`（先 strip 注释再数调用点）。 |
| 5 | mic/事件回调在驱动上下文里跑，里面做重活/再调播放会出问题 | skill 里明确"回调只缓冲/置标志位，重活丢给自己的 task"（见 audio 的 ringbuf 模式）。 |
| 6 | 设备名复用 | touch 复用 `DISPLAY_NAME`（不是单独的 "touch" 名）。这类复用关系必须在 skill 里写清。 |
| 7 | 写完不刷新看不到效果 | leds-pixel 设完颜色必须 `tdl_pixel_dev_refresh()`。这类"必须调用"的收尾步骤要在 skill 里标 REQUIRED。 |

---

## 8. checklist（提交前过一遍）

- [ ] 所有 API/结构体/枚举都对照过真实 SDK 头，没编造
- [ ] Usage Template 里的 `#include` 齐全，能让代码自洽编过
- [ ] board-adapted / custom 路径分清，Kconfig 写法正确
- [ ] frontmatter 关键词中英文都有
- [ ] 5 处接线都改了（extension.ts + 2 个测试脚本 + 2 张表）
- [ ] `npm run compile` 过（extension.ts 改动）
- [ ] `node scripts/vibe-test-runner.mjs` 全绿
- [ ] 真编译验证：子 agent 生成的代码 `vibe-compile-check.mjs` 全过
- [ ] 踩坑表里的 7 条都规避了
```
