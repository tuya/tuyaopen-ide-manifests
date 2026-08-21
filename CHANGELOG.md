# Changelog

Manifest-level changes, newest first. Versions are the release tag of this
repo (`v<x.y.z>`), not the IDE's. Per-domain versions live in
[`registry.json`](./registry.json) and are what drive the IDE's per-page
"update available" indicator.

## [Unreleased]

### 内测第一轮反馈落地(2026-08-21)

第一轮实战测试(claude sonnet 5 / Linux / t5ai / 可调色温灯)暴露的问题,技能侧的修法。
CLI 侧的对应改动见主仓库。

`tuyaopen-shared` 1.4.0 → **1.5.0**,新增 **§0「先装先读,再动手」**。这是那一轮里最贵的
一个错误,而且是测试者自己认的:目录一开始就同步了,技能却是在**已经把错的命令配方发给用户
之后**才装、才读。两个具体代价 ——`tuyaopen-cloud` 明写着 `product solution-list` 永远返回空、
要用 `custom-list`,以及 devplat 写操作走 `--dry-run` → `--confirm` 而不是 `--yes`,而错配方
恰恰是 `solution-list` + `--yes`;`tuyaopen-shared` §8 画了 `.tuyaopen/` + `source/embedded/`
的布局,结果是靠 `firmware build` 的报错反推、手工拼出来的。`tuyaopen-workflow-product-dev`
装了但从没打开 —— 它正是本该第一个读的编排技能。

同一节还加了一条:**先问 CLI,再断言功能缺失。** 那一轮报了「应该有个删除本地 SK token 的
logout 命令」,而 `tuyaopen credential logout` 一直都在,`credential --help` 第三行就列着它。

`tuyaopen-cloud` 1.2.0 → **1.3.0**:`credential login --emit-url`。登录 URL 一直走 stderr
（stdout 要守单行 JSON 契约),但 stderr **不一定可见** —— 分开捕获两个流、或把 stderr 缓冲到
子进程退出的 harness,会让人什么都看不到,而这条命令要阻塞到 `--timeout`。那一轮就是这样:
agent 换遍 `--json`/`--format human`/`stdbuf`/`setsid` 都拿不到 URL,写了轮询脚本去找一个
CLI 早就打印过的地址,还三次把进程 SIGTERM 掉(等于取消登录)。新 flag 把它作为
`{"event":"login_url","url":…}` 放在 stdout,排在最终信封前面。

`tuyaopen-embedded-device-auth` 1.2.0 → **1.3.0**:开头补「为什么会走到这一步:
`client no active`」。那一轮固件编译、烧录、DP 处理、上报调用全对,设备却永远不出现在 App 里,
串口只有一行 `client no active` —— **没有授权码就上不了云**,而在此之前没有任何一步提示过
需要授权。判据现在是 `diag doctor` 的 `deviceAuth.localLicenses`。

`tuyaopen-embedded-build` 1.0.4 → **1.1.0**:`firmware build --timeout`。默认 300 s 对**首次**
全量编译几乎必然不够(还要下载平台与工具链),那一轮因此放弃包装层直接跑 `tos.py build`,
连带丢掉日志捕获和类型化信封。

`tuyaopen-embedded-flash` 1.2.0 → **1.3.0**:一块板子可能有多个串口,用途与波特率都不同。
实测 `tuya-t5ai-board`:`ttyACM0 @ 115200` 是应用 CLI,`ttyACM1 @ 460800` 才是日志口。
测试者在 ACM0 上看不到任何 `PR_*`,一度以为是自己的日志等级配错,试了四档波特率才对上。

`manifests.skills.version` 1.4.0 → **1.5.0**。

### 修:三条已发布技能的 payload 变了但 `version` 没动(2026-08-21)

`tuyaopen-shared` 1.3.0 → **1.4.0**(新增两节:wrapper 存活自检、目录陈旧检测 —— 新行为,取
minor)、`tuyaopen-skill-maker` 1.3.0 → **1.3.1**、`tuyaopen-workflow-product-dev` 1.2.0 →
**1.2.1**(后两条是措辞修补,取 patch)。

**为什么门禁没拦住它。** `check-skill-version-bumps.py` 的 `--released-index` 由 CI 用
`git show "$RELEASE_TAG:skills/…index.json"` 取,而在这个 fork 上**没有任何 git ref 描述实际
发布出去的内容**:

| | 内容 |
|---|---|
| `v0.0.9` **tag 指向的树** | 扁平 `skills/index.json`,23 条,斜杠式旧 id(`tuyaopen/build`) |
| `v0.0.9` **实际发布的 tarball** | 扁平 `skills/index.json`,28 条,连字符 id;payload 在 `skills/TuyaOpen/<id>/`;**没有** `skills/TuyaOpen/index.json` |

两者的 id 集合几乎不相交,所以以 tag 树为基线时,当前每一条 id 都被判成"从未发布"→ 可以自由
吸收改动 → 门禁**空过**。而仓库里 `release.json` 的 `tag` 字段是上游的 `v1.0.0`,CI 取的其实是
那个,在 fork 上更不是内测基线。

要发现这件事只能**把 tarball 下载下来逐字节比**——这也是这次的做法:比完之后真实漂移只有
上面三条,另外 11 条被首轮误报的 miniapp 技能 payload **逐字节相同**(误报源于用 tag 树算
`--changed`,与 CI 那个基线错误同一类)。

**门禁本身没改。** 它的逻辑是对的,错的是喂给它的基线;在 fork 上正确的基线是 release asset,
不是 git ref。发下一个内测版本前,基线应当取自已发布的 tarball。

### 嵌入式技能加面名前缀:`tuyaopen-embedded-*`(2026-08-19)

`embedded` 组 10 条技能的 id 与目录改名,与既有的 `tuyaopen-miniapp-*` 对称:

| 旧 id | 新 id |
|---|---|
| `tuyaopen-build` | `tuyaopen-embedded-build` |
| `tuyaopen-project` | `tuyaopen-embedded-project` |
| `tuyaopen-dependency` | `tuyaopen-embedded-dependency` |
| `tuyaopen-hardware` | `tuyaopen-embedded-hardware` |
| `tuyaopen-flash` | `tuyaopen-embedded-flash` |
| `tuyaopen-diagnose` | `tuyaopen-embedded-diagnose` |
| `tuyaopen-add-board` | `tuyaopen-embedded-add-board` |
| `tuyaopen-code-check` | `tuyaopen-embedded-code-check` |
| `tuyaopen-env-setup` | `tuyaopen-embedded-env-setup` |
| `tuyaopen-workflow-dev-loop` | `tuyaopen-embedded-dev-loop` |

最后一条**没有**机械插入(`tuyaopen-embedded-workflow-dev-loop` 太长),`workflow-` 段去掉了;
它原本就有 `tuyaopen-dev-loop` 这个别名在用。

`cloud` 与 `core` 两组不动:`tuyaopen-cloud` 本身已带面名,而地基层是跨面的。

**旧 id 全部进 `aliases[]`**,所以 `--ids tuyaopen-build` 仍解析到新技能。但**别名只做输入
重定向**:已经装在项目里的旧目录不会自己改名。IDE 侧靠 `scanLegacySkillLayout` 的一键修复
接住(主仓同 MR 让它认 `aliases`,此前会把旧目录报成 orphan);纯 CLI 用户需要自己删掉旧目录,
或重装一次。

payload 内容除交叉引用与 frontmatter `name:` 外未变,因此**未提升各技能的 `version`** ——
按 `scripts/check-skill-version-bumps.py` 的规则,这些版本号自上次发布起从未打包过
(v1.0.0 不含它们,内测 v0.0.9 根本没有 `version` 字段),属"in flight",可以在同一号下继续
吸收改动。

`skills/TuyaOS/` 下两处正文提到旧 id,**刻意未改** —— 那棵树不进产品,且有"不改动 TuyaOS"的
约定在。

### 修:版本号门禁自布局拆分起就没真跑过(2026-08-19)

`scripts/check-skill-version-bumps.py` 的 `--head-index` 默认值仍指向拆分前的
`skills/index.json`,而它的 `--help` 文案**已经写成了新路径** —— 于是凡是基于拆分后 main 的
PR,这个检查都以 `✗ index file not found` 退出 1,"让 `version` 可信"的那道门自此没有执行过。
错得难被发现,恰恰因为 help 是对的:读 `--help` 得到的是关于代码的错误信息。

同时修 `.github/workflows/validate-skills-index.yml` 里两处 `git show`:改为先试
`skills/TuyaOpen/index.json`、再回落 `skills/index.json`。回落是必须的 —— 上次发布的 tag
仍是扁平布局,只写一个路径就会静默产出一个空基线,而空基线意味着"什么都不用 bump"。

### 目录布局:两条产品线显式分离(2026-08-19)

`skills/index.json` → **`skills/TuyaOpen/index.json`**;TuyaOS 的 payload 从
repo-root `tuyaos-skills/` 移回 **`skills/TuyaOS/`**,并补上它自己的 `index.json`。
两次移动都未修改 payload 内容(git 记录为 rename)。

`manifests.skills.version` 1.3.4 → **1.4.0**(布局变更,不是内容修补)。
`manifests.skills.url` 同步指向新路径。

三处**各自独立**的机制把第二条产品线挡在产品之外 —— 刻意不合成一处,因为一处就是
一处可以被遗忘:

| 什么 | 在哪里生效 |
|---|---|
| IDE/CLI 只解析一份索引 | `registry.json` 的 `manifests.skills.url` |
| release 不打包这棵树 | `release.yml` 在 staging 后 `rm -rf staging/skills/TuyaOS` |
| 验证器不评判它 | `validate-skills-index.py` 的 `GOVERNED_SUBTREE` |

验证器的收窄**不是豁免**:该脚本的每条规则描述的都是与 `tuyaopen` CLI 的关系
(`cli` 声明、单值 `sdks`、Shortcuts 一致性),套到 TuyaOS 技能上会断言无意义的事。
在此之前那些扫描遍历整个 `skills/`,而那只在 `skills/` 恰好只有一条产品线时才正确。

双向验证过:在 `skills/TuyaOpen/` 下放一个未索引目录仍会报 orphan;放在
`skills/TuyaOS/` 下则不再误报。`release.yml` 的排除也实测过 —— staging 后
`skills/` 下只剩 `TuyaOpen/`,且 `registry.json` 的 url 在包内可解析到 28 条。


Accumulated on the branch since `v1.0.0`. `skills` is the only registered
domain that changed, and its version moves `1.0.0` → **`1.3.2`**
(`registry.json` → `manifests.skills.version`) in four steps:
`1.0.0` → `1.2.0` → `1.3.0` → `1.3.1` → `1.3.2`. Three of those are the
catalogue work described below. `1.3.1` is not: it came from a concurrent branch
(rpx style scale in `tuyaopen-miniapp-panel-dev`'s theme doc and its
`validate.mjs`) and is recorded here only so the arithmetic reconciles — that
work is not summarised in the entries below.

The headline is that **the `tuyaopen` CLI is now the primary path in every
skill body**, with the legacy tools (`tos.py`, `tyutool_cli`,
`tuya-devplat-cli`) kept as a fallback the agent can *decide* to take rather
than a parallel set of instructions it has to guess between. All **28**
registered `SKILL.md` bodies changed in service of that.

### Changed

- **The skills catalogue is TuyaOpen-only.** The two items of the second
  product line were removed from `skills/index.json` (30 → 28) and their
  payload moved unmodified to the repo-root `tuyaos-skills/` — outside
  `skills/`, so the validator's orphan check is satisfied, and outside the
  release workflow's staging list, so it contributes zero bytes to
  `manifests.tar.gz`. Every remaining item's `sdks` is now `["tuyaopen"]` (18
  were dual-declared), and the validator's `PRODUCT_LINES` / `SDKS` are
  single-valued. Nothing here was ever visible to a TuyaOpen user: both
  consumers' SDK gates already dropped those items at ingestion — what changed
  is that they are now absent rather than filtered. See
  [`tuyaos-skills/README.md`](./tuyaos-skills/README.md).
- **Every item now carries `group`**, so `tuyaopen skills groups` and
  `install --group` reach all 28 across the five install units (`core` 2,
  `embedded` 10, `cloud` 3, `miniapp` 7, `category` 6). The only two that
  legitimately lacked one were the other line's; the validator's group check is
  now unconditional. 17 items carry `defaultEnabled: true` — the set New
  Project and `skills install --default` install.
- **Every item now carries a `cli` object** declaring its relationship to the
  `tuyaopen` CLI, and it is a *hard* field, not an optional hint. Fourteen items
  name the CLI groups they invoke (`cli.groups`, e.g. `tuyaopen-flash` →
  `["firmware", "device"]`); the other fourteen — `tuyaopen-add-board`,
  `tuyaopen-code-check` and the twelve MiniApp skills — declare
  `{"groups": "none", "reason": "…"}` and say so in the body too. Eleven items
  additionally declare `cli.fallback`, the legacy tool(s) the body falls back to
  when the CLI is unavailable (`tos.py`, `tyutool_cli`, `tuya-devplat-cli`).
  Before this, "not stating it" was an invisible state: measured 2026-08-17,
  three skills mentioned the CLI zero times and all three were among the nine
  that had never declared anything.
- **The risk-gate documentation was recalibrated to what the CLI enforces.**
  `P1` is gone entirely — its gate was byte-for-byte identical to P0's and no
  command ever landed in it. `P0` now means one thing: no reverse command
  exists *and* the run destroys state the caller cannot reconstruct. On that
  test `firmware flash`, `firmware authorize`, `dependency remove` and
  `skills uninstall` all dropped to P2, leaving `license remove` as the only P0
  command, and the bodies that documented a `--confirm <token>` ceremony for
  those four were corrected to the P2 gate (`--yes` +
  `TUYAOPEN_AUTOCONFIRM_P2=1`, and a P2 `--dry-run` hands back no token).
  `tuyaopen-shared` § 4 now also documents the **P3** tier — ungated, yet
  twelve of its members still write — so "not P2" can no longer be misread as
  "does not write", and it teaches the env var as a per-invocation prefix
  rather than an `export`, which would leave every later P2 command in the
  shell one `--yes` away.
- `tuyaopen-env-setup` Step 3 points at **`tuyaopen diag doctor`** instead of a
  bundled script (see *Removed*).
- `tuyaopen-skill-maker` § 3 rewritten around a single payload location. It also
  carried a false claim worth naming: that the CLI does not apply the `sdks`
  filter and lists every item. `cli/commands/skills.ts` has filtered since
  2026-08-15.
- `tuyaopen-dependency` described `tuyaopen library list` as listing the
  "TuyaOS platform sub-SDKs (LVGL, mbedtls, …)". Wrong twice over: it lists the
  TuyaOpen core repo plus its per-chip platform repos, read from the SDK's own
  `platform/platform_config.yaml`; and LVGL/mbedtls are what `ecosystem install`
  adds — the other half of the very paragraph that sentence was drawing a
  distinction in. The IDE-side command description carried the same error and
  was corrected there in the same change.
- Per-skill payload `version`s bumped alongside the bodies they describe.
- **Twelve more MiniApp templates** published to `miniapp-templates/`. Not a
  registered domain, so no domain version moves — see the 1.0.0 entry for why.

### Added

- **`scripts/check-domain-version-bumps.py` + `validate-domains.yml`** — the
  domain-version rule in [README](./README.md#contributing) had no gate, and it
  showed: the commits summarised above changed 439 files under `skills/` while
  `manifests.skills.version` stayed at the `1.0.0` that shipped with `v1.0.0`,
  and `skills/index.json`'s `publishedAt` still carried that release's date.
  Since `release.json#domains` is generated from those numbers, and the IDE
  lights its per-page "update available" dot from them, an unbumped domain means
  an already-synced IDE downloads the new tarball and then tells the user
  nothing changed. The check also refuses a registry entry whose `url` is
  missing or whose `domain` field disagrees with its key — the IDE's
  `cacheIntegrity()` will not start on either, so those are startup failures
  rather than tidiness. Unit-tested in `tests/scripts/`, and all three failure
  branches were verified by mutation against this very state.
- **Three `cli`-declaration rules in `scripts/validate-skills-index.py`**, each
  closing a different way the declaration could be wrong:
  1. **The field is required.** An item with no `cli` object fails, so "never
     declared" stops being indistinguishable from "declared no coverage".
     `{"groups": "none"}` must come with a `reason`, and the body must also
     carry the sentence ``No `tuyaopen` CLI coverage`` — the reader needs to see
     it, not just the index.
  2. **Group names must be real.** `cli.groups` entries are checked against the
     CLI's actual group list, which catches a typo here *and* a group rename on
     the CLI side.
  3. **The declaration and the body must agree, in both directions.** The
     validator reads the item's own `SKILL.md` (never anything under
     `references/`) and compares `cli.groups` against the **Command column of
     the `## Shortcuts` table** — deliberately that column and nothing else,
     because Rule 3 is about what the skill *invokes*, and prose, an `## Other`
     section or a `> **No CLI?**` aside mentioning a group is not an
     invocation. A declared group with no matching Command-column row is
     *declared but unused*; a Command-column row invoking a group that is not
     declared is *used but undeclared*. An item declaring groups with no
     `## Shortcuts` section at all fails outright — that section is the agent's
     entry point.
  Unit-tested in `tests/scripts/test_validate_cli_declaration.py`.

### Removed

- **`tuyaopen-env-setup/scripts/check_env.{sh,ps1,bat}`** (162 lines: 65 + 43 +
  54). `tuyaopen diag doctor` now answers all seven of the questions those
  scripts asked — the activated venv and `OPEN_SDK_ROOT` (as
  `sdk.envReady` / `sdk.installed`), `tos.py` on PATH (`sdk.tosPresent`), git,
  python3, and **cmake and ninja, which were added to `diag doctor` for this**
  — so three per-platform copies of the same probe were pure maintenance cost,
  and the shell/PowerShell/batch triplet was the part most likely to drift
  apart silently. Step 3 of the skill points at the CLI command instead.

### Fixed

- `peripheral-sd`'s frontmatter `name` was `SD Card Storage`, carrying no
  namespace. Bundled sub-skills are not merely internal: Codex scans
  `$HOME/.agents/skills` recursively and registers every nested `SKILL.md` as an
  independent skill, so that name occupied a global identifier on any machine
  that installed `tuyaopen-hardware`. Now `tuyaopen/peripheral-sd`, matching its
  25 siblings, and `tuyaopen-skill-maker` § 2 states the rule so the next
  sub-skill gets it right.

## [1.0.0] - 2026-08-13

First release paired with TuyaOpen IDE 1.0.0. All four domain versions are
aligned to `1.0.0` here; from the next release on they move independently
again, as [the design principles](./README.md#design-principles) intend.

### Added

- **`miniapp-templates/` now ships in `manifests.tar.gz`.** The MiniApp
  template gallery reads `miniapp-templates/miniapp-template-covers.json` from
  the manifest cache, and no release before this one carried it — a packaged IDE
  showed only its one bundled starter template. It is deliberately **not** a
  registry domain: the file is `schemaVersion: 2` with a `templates` array and
  no `domain` field, so the IDE's domain-envelope check would reject it, and a
  `registry.json` entry would make its cache-integrity check demand a file older
  releases lack — forcing a full tarball re-download on every startup. Needs IDE
  ≥ 1.0.0, which is the first version that installs the directory into its cache.
- **Per-skill payload `version`** on all 29 `skills` items, with CI enforcing a
  bump whenever a payload changes and refusing a version that moves backwards
  onto already-released ground (`scripts/check-skill-version-bumps.py`). This is
  what lets the IDE tell an upstream skill update apart from a user's local edit
  instead of silently overwriting it. See
  [`skills/README.md`](./skills/README.md#version--per-skill-payload-version).
- **Nine TuyaOpen development skills absorbed from `TuyaOpen-dev-skills`** —
  `env-setup`, `dev-loop`, `project-config`, `debug-helper`, `cli-debug`,
  `crash-decode`, `code-check`, `device-auth`, `tyutool_cli` — payloads and index
  entries in one place, with unit tests for the scripts they ship.
- **Device-authorization ledger** documented in the `device-auth` skill, plus a
  corrected serial-port rule.
- **`oemUrl` on demos** for one-click OEM product creation, replacing the
  `productId` seed. Demos without an OEM source can still declare a ready-to-use
  preset PID.
- **MiniApp template covers catalogue** — 32 templates with bilingual display
  names, cover images, QR codes and download URLs.

### Changed

- **All domain versions → `1.0.0`** (`platforms` 0.3.0, `boardsAndChips` 0.4.0,
  `demos` 0.1.3, `skills` 0.3.0). Note `demos` had accumulated changes since
  v0.1.7 without a version bump, so IDEs that had already synced were never told
  the OEM links existed; this release corrects that.
- **Board `manufacturer` values are localized and de-duplicated** —
  `{ "en": …, "zh-CN": … }` for Tuya, Espressif, Waveshare, ALIENTEK, JLC and
  GigaDevice. Waveshare had been spelled both `微雪` and `Waveshare` across four
  boards, which reads as two different vendors; the Chinese-only strings showed
  up as Chinese for English users.
- **Documentation corrected against the shipping IDE** in three places where the
  README described behaviour that does not exist: official-board detection reads
  `manufacturer` first and only falls back to `brand` (it is not
  `brand.en === "Tuya"`, and `brand` is optional); `board.platformId` is the
  platform **group** while `board.variantId` is the chip **variant** (the README
  had these swapped); and `demos` spells its visibility flag `publish` while
  `boardsAndChips` / `platforms` use `published` — deliberately, on the IDE side,
  so "normalising" the names would silently publish hidden demos.

### Fixed

- **11 MiniApp templates unpublished** after every template in the catalogue was
  built and screenshotted headlessly: compile failures, blank screens, templates
  needing real hardware or a live cloud, and one that renders only against DP
  data it does not ship. Published count 26 → 15.
- **Stale counters** in the template covers catalogue (`withCover` / `withoutCover`
  described an earlier 34-template state and summed to more than the total).
- **TuyaOpenClaw board ids** reverted by an earlier change.
- **Ubuntu board** switched to cross-deploy over SSH, renamed, arm64 dropped.

---

Releases before 1.0.0 are not covered here; see the
[commit history](https://github.com/tuya/tuyaopen-ide-manifests/commits/main)
and the [GitHub Releases](https://github.com/tuya/tuyaopen-ide-manifests/releases)
page.
