# 归档 TuyaOpen-dev-skills 并内联进 tuyaopen-ide-manifests

> **For agentic workers:** 按任务顺序执行，每个 Task 一个 commit / 一个 PR。步骤使用 `- [ ]` 复选框跟踪。

**目标：** 把 `tuya/TuyaOpen-dev-skills` 的全部内容搬进 `tuyaopen-ide-manifests`，让 `skills/` 成为技能的唯一来源；随后把上游仓库设为 archived（只读），并拆掉两仓之间的 `repository_dispatch` 联动。

**核心结论：** 这次迁移**不需要改 IDE 端代码**。8 个 dev-skills 条目的 `installPayload` 已经是 `embedded/tuyaopen/<name>`，只要落到 `skills/embedded/tuyaopen/<name>`，`source` 从 `{devSkills,subpath}` 换成 `{localPath}` 即可 —— `localPath` 这条路径 IDE 早已在用（27 个条目里 19 个是 localPath），而 `release.yml` 打包时本来就 `cp -r skills staging/`，文件天然进 `manifests.tar.gz`。净效果是少一次网络下载。

---

## 进展（2026-08-06）

分支 `feat/absorb-dev-skills`，Task 1–5 已完成并各自成 commit：

| commit | 内容 |
|--------|------|
| `6c28b9a` | 搬入 10 个技能 + `tests/skills/`（上游 `d0655d46`） |
| `631480a` | 8 个 source 改 localPath、登记 cli-debug/crash-decode、skills 0.2.0 |
| `9c76b65` | validator：`devSkillsRelease` 选填、devSkills 降级为警告、新增孤儿载荷检查 |
| `f8c6a35` | 新增 `skills-tests.yml`（15 个测试全绿） |
| `7c3ad3e` | 删除 `update-dev-skills.yml` dispatch 监听 |
| `3ae1627` | 文档：新增 `skills/README.md`，更新 README / manifest-architecture |

随后 Task 0 在 IDE 仓库（只读）核实通过，据此删掉 `devSkillsRelease` 墓碑并把
`source.devSkills` 从警告升级为报错 —— 详见下方 Task 0。

已验证：`validate-skills-index.py` 通过（29 条目）；`pytest tests/skills` 15 passed；
打包 dry-run 产物含全部 10 个 `SKILL.md`，体积 5.73 MB → 5.79 MB。

随后做了一轮独立 review，发现 1 个 Blocker（安装路径写错，全部 SKILL.md 波及）+ 2 个
Major + 8 个 Minor/Nit，已在 `b3ab228` 修完并加了护栏 —— 详见第六节。

**仍未做：** Task 6（发 v0.1.8 + **同窗口推 IDE submodule 指针** + IDE 冒烟）、
Task 7 上游侧（归档 `TuyaOpen-dev-skills`，含新发现的 `tuya-devplat-cli` 消费方）、
Task 8 剩余低优先级清尾 + IDE 侧 4 项遗留。

---

## 一、现状（已核对）

### 上游仓库 `tuya/TuyaOpen-dev-skills`（master，约 160 KB）

| 内容 | 说明 |
|------|------|
| `skills/tuyaopen/{add-board,build,code-check,debug-helper,dev-loop,device-auth,env-setup,project-config}` | 8 个技能，**已**登记在本仓 `skills/index.json` |
| `skills/tuyaopen-cli-debug/` | SKILL.md + `cli_debug.py` + `requirements.txt`（pyserial）—— **未登记**，随 tar 包分发但 IDE 不会安装 |
| `skills/tuyaopen-crash-decode/` | 仅 SKILL.md —— **未登记**，同上 |
| `tests/test_{build_run,check_files,monitor_helper}.py` | pytest，用 `sys.path.insert` 指向 `skills/tuyaopen/*/scripts` —— **上游无 CI 跑它** |
| `.github/workflows/release.yml` | 打 tar 包、写 `release.json`、同步 Gitee、向本仓 `repository_dispatch` 发 `dev-skills-released` |
| `.github/workflows/sync-gitee.yml`、`scripts/sync-gitee-release.sh` | 与本仓同名文件重复 |
| `README.md` / `README_zh.md` / `LICENSE` / `release.json` | 元数据 |

### 本仓的耦合点

| 位置 | 现在的作用 | 迁移后 |
|------|-----------|--------|
| `skills/index.json` → `devSkillsRelease` | 告诉 IDE 去哪下 `TuyaOpen-dev-skills.tar.gz`（v0.0.10, 38809 B） | 先保留为墓碑，确认 IDE 底线版本后删除 |
| `skills/index.json` → 8 × `source:{devSkills:true,subpath}` | IDE 从上游 tar 包里取 `subpath` | 改为 `source:{localPath}` |
| `.github/workflows/update-dev-skills.yml` | 监听 `dev-skills-released`，自动 bump `devSkillsRelease` | 删除 |
| `scripts/validate-skills-index.py` | `devSkillsRelease` 是**必填**顶层键；`source` 二选一含 devSkills 分支 | 放宽 + 新增"孤儿技能目录"检查 |
| `tools/manifest-editor/frontend/js/skill-editor.js:20` | 显示 `dev-skills: <subpath>` | 迁移后无条目命中，低优先级清理 |
| `tools/manifest-gen/src/commands/skills.js` `add --repo/--subpath/--ref` | 造远端 source | 低优先级清理 |

### 目标目录布局

```
skills/embedded/tuyaopen/
├── add-board/        build/           code-check/      debug-helper/
├── dev-loop/         device-auth/     env-setup/       project-config/
├── cli-debug/        ← 原 skills/tuyaopen-cli-debug
└── crash-decode/     ← 原 skills/tuyaopen-crash-decode
tests/skills/         ← 原 tests/
```

`skills/index.json` 条目数 27 → 29；`registry.json` 的 `skills` 版本 0.1.0 → 0.2.0。

---

## 二、决策（2026-08-06 已确认，按建议执行）

1. **`cli-debug` 与 `crash-decode` 登记进 index** ✅ 已执行：`defaultEnabled: false`，order 26/27。
   原建议：**登记**，`defaultEnabled: false`。它们已经写好且随包分发了 3 个月却对用户不可见 —— 这本身是 bug。若决定不要，则直接删掉，不要留在 `skills/` 下当死内容。
2. **不保留上游 git 历史** ✅ 已执行：直接复制，上游 HEAD `d0655d464bcda9d9441aa2ba5e405b3f140fcb2c`（v0.0.10, 2026-07-15）记于 commit body。
   原建议：**直接复制文件**，commit body 里记上游 HEAD SHA。技能是小体量文档，历史留在 archived 仓库可查。若要求可追溯，改用 `git subtree add --prefix=skills/embedded/tuyaopen`（但上游路径是 `skills/tuyaopen/`，subtree 后还要一次 `git mv`，历史会有一层 rename）。
3. **`devSkillsRelease` 暂留为墓碑** ✅ 已执行：字段原样保留并加 `note` 说明；删除时机取决于 Task 0。
   取决于 IDE 是否在启动时无条件读它。Task 0 先查清；查清前不要删。

---

## 三、任务

### Task 0：确认 IDE 端消费方式 ✅ 已完成

读 `D:\LENOVO\Documents\code\gitlib\tuyaopen_ide`（未做任何修改），结论：

- [x] **`devSkillsRelease` 可以直接删** —— `SkillsManifest.devSkillsRelease?` 是可选类型，且从引入它的第一个 commit（`c3ab7948` / `e1e254d3` / `7ffdaaf8`，均 2026-05-27）起就带守卫：`skillsFlow.ts:199` 只在 `devSkillsRelease != null && some(source.devSkills === true)` 时才同步；`skillsSync.ts:192` 在缺失时 log 并跳过。`manifestsLoader.ts:464 assertDomainEnvelope` 只校验 `schemaVersion` / `domain` / `items`。**没有任何已发布版本会无条件读它**，因此墓碑已一并删除。
- [x] **`localPath` 两条路径都对得上**：
  - dev：`skillsRegistry.ts:356-366` 直读 `<extensionRoot>/vendor/tuyaopen-ide-manifests/<localPath>`
  - prod：`manifestsCacheIntegrity.ts:110-118` 把解包后的 `skills/{embedded,cloud,miniapp}` 整体 `cp` 到 `<globalStorage>/cache/skills-registry/{surface}`，再由 `skills.ts:271,410` 按 `installPayload` 取用 —— 这正是 `installPayload == localPath - "skills/"` 必须成立的原因
- [x] **没有硬编码上游 URL 或 `skills/tuyaopen/` 前缀** —— URL 全部来自 `devSkillsRelease` 数据；`src/` 里只剩注释和两条 i18n 文案提到该仓库名
- [x] **IDE CI 不校验本仓 skills** —— `scripts/manifest-validator.mjs` 只覆盖 boards/demos/platforms，且只挂在手动 `npm run validate:manifest`，本次改动不会打破 IDE CI

**顺带确认修掉了一个已记录的问题：** `docs/audit-2026-08-03/REPORT.md:448` 记录「submodule 里 8 个 skill 的 `installPayload` 实际不存在，dev 下 F5 仍要联网」。submodule 现 pin 在 `ee3102d`；本次迁移后这 8 个技能在 dev 下直接从 submodule 命中。

**IDE 侧遗留（不阻塞发版，需另开 issue）：**

1. `skillsFlow.ts:926 handleSyncUpstreamSkillsCommand`（命令面板「同步 TuyaOpen-dev-skills 技能目录…」）迁移后必然是空转：`filterSyncable` 要求 `source.repo`、devSkills 分支要求 `devSkillsRelease`，两者都已不存在 → 永远弹 "Synced 0 skill(s)."。应改为调 `manifestsReleaseManager.checkAndSync({ force: true })`，或直接下掉该命令 + 两条 i18n 文案（`en.ts:1441` / `zh-CN.ts:1425`）。
2. `syncSkills` 的 `prunedCount` 清理逻辑随之不再触发（启动路径不再调用它）。技能从 index 移除后，`skills-registry/` 下的旧目录会残留；不影响目录展示（`reapplyManifestToEntries` 以 manifest 为准过滤），但缓存会慢慢变胖。
3. `manifestsTypes.ts` 的 `devSkills` union 分支、`DevSkillsRelease` 类型、`skillsSync.ts` 的 devSkills 通道与 `.dev-skills-release.json` stamp 均已无数据可对应，可以删。
4. `skillsFlow.ts:920` 注释称 tarball 落在 `skills-registry/upstream/`，与实际的 `skills-registry/<installPayload>` 不符（迁移前就已漂移）。

### Task 1：搬运文件（1 个 commit）

**Files:** 新增 `skills/embedded/tuyaopen/**`、`tests/skills/**`

- [x] 克隆上游 master，记下 HEAD SHA
- [x] 8 个技能：`skills/tuyaopen/<name>` → `skills/embedded/tuyaopen/<name>`（含 `references/`、`scripts/`）
- [x] `skills/tuyaopen-cli-debug` → `skills/embedded/tuyaopen/cli-debug`（连 `requirements.txt`）
- [x] `skills/tuyaopen-crash-decode` → `skills/embedded/tuyaopen/crash-decode`
- [x] 两者 SKILL.md frontmatter 的 `name:` 归一到嵌套风格：`tuyaopen-cli-debug` → `tuyaopen/cli-debug`，`tuyaopen-crash-decode` → `tuyaopen/crash-decode`（与其余 8 个 `tuyaopen/build` 风格一致）
- [x] `tests/` → `tests/skills/`，改 3 个文件的 `sys.path.insert` 路径为 `../../skills/embedded/tuyaopen/<name>/scripts`
- [x] 不搬：`README.md`、`README_zh.md`、`LICENSE`、`release.json`、`.github/`、`scripts/sync-gitee-release.sh`（本仓已有等价物）
- [x] 确认没带入 `__pycache__` / `*.pyc`

**验证：** `find skills/embedded/tuyaopen -name SKILL.md | wc -l` = 10

### Task 2：改 `skills/index.json`（1 个 commit）

- [x] 8 个条目：`"source": {"devSkills": true, "subpath": "skills/tuyaopen/X"}` → `"source": {"localPath": "skills/embedded/tuyaopen/X"}`。`installPayload`、`id`、`order`、`commands` **一律不动** —— 这是「IDE 零改动」的前提
- [x] 新增 2 个条目（若 Task 0/决策 1 通过）：`tuyaopen-cli-debug`、`tuyaopen-crash-decode`；`surface: embedded`、`sdks: ["tuyaopen"]`、`defaultEnabled: false`、`order` 接在现有 embedded 段之后；双语 `name`/`summary`/`whenToUse` 从各自 SKILL.md 的 description 提炼（已含中文关键词，可直接复用）；`related` 指向 `tuyaopen-debug-helper` / `tuyaopen-build`
- [x] `devSkillsRelease` **保持原样**（墓碑），另加 `"note"` 字段说明「retained for IDE ≤ X compatibility, remove after」
- [x] 更新 `publishedAt`
- [x] `registry.json`：`manifests.skills.version` 0.1.0 → 0.2.0（minor：新增条目 + source 语义变更）

**注意** JSON 文件是 UTF-8 且含中文，编辑时不要让工具改写编码。可用 `node tools/manifest-gen/bin/manifest-gen.js skills list/get/set` 操作以避免手改整文件。

**验证：** `python3 scripts/validate-skills-index.py` 通过；`grep -c devSkills skills/index.json` 只剩 `devSkillsRelease` 那一处

### Task 3：更新校验脚本（1 个 commit）

**Files:** `scripts/validate-skills-index.py`

- [x] `devSkillsRelease` 从必填改为选填（存在时仍校验字段与 URL 格式）
- [x] `source` 的 devSkills 分支：保留解析能力，但对命中的条目打印 deprecation 警告（Task 6 后改为报错）
- [x] **新增「孤儿技能目录」检查**：遍历 `skills/**/SKILL.md`，每个目录必须被恰好一个 index 条目的 `source.localPath` 引用；否则报错。这正是漏掉 `cli-debug`/`crash-decode` 的那类 bug，装上护栏才不会复发
- [x] 同步更新文件头 docstring 的 Checks 列表

**验证：** 故意删掉一个 index 条目 → 脚本报孤儿错误；恢复后通过

### Task 4：补 pytest CI（1 个 commit）

**Files:** 新增 `.github/workflows/skills-tests.yml`

- [x] `on: pull_request/push` + `paths: ["skills/embedded/tuyaopen/**", "tests/skills/**", ".github/workflows/skills-tests.yml"]`
- [x] `python3 -m pip install pytest` → `python3 -m pytest tests/skills -q`
- [x] 本地先跑一遍确认 3 个测试文件在新路径下全绿（上游从未在 CI 跑过，可能本来就有失败）

### Task 5：文档（1 个 commit）

- [x] `README.md` skills 段落：说明 skills 内容现已完全内联，dev-skills 已归档
- [x] `docs/manifest-architecture.md`：目录树补上 `skills/embedded|cloud|miniapp/**`，删掉外部 dev-skills 依赖的描述
- [x] 新增 `skills/README.md`：布局约定、`localPath` 与 `installPayload` 的对应规则（`installPayload == localPath - "skills/"`）、加一个技能的步骤（建目录 → 写 SKILL.md → `manifest-gen skills add` → 跑 validator）
- [x] 在 `docs/superpowers/specs/` 或本 plan 同目录留一条迁移记录，含上游 HEAD SHA

### Task 6：发版（1 个 release）

- [ ] 合并 Task 1–5 后打 tag `v0.1.8`（`release.yml` 会自动打包、写 release.json、同步 Gitee、开 PR 回写 main）
- [ ] 下载产出的 `manifests.tar.gz`，确认含 `skills/embedded/tuyaopen/` 下 10 个 `SKILL.md`
- [ ] **⚠ 同一窗口内把 IDE 仓库的 `vendor/tuyaopen-ide-manifests` submodule 指针推到合并后的 commit。** 现 pin 在 `ee3102d`（迁移前），其树下没有 `skills/embedded/tuyaopen/`。dev 模式下 `manifestsRelease.ts:227-232` 在 submodule 存在时**直接跳过 tarball 下载**，`skills-registry/` 会是空的 —— 于是合并后、指针未动这段时间里，F5 下装这 10 个技能会拿到 `SKILL_NOT_CACHED_ERROR`，比现状更糟（现状至少还能回落到 dev-skills tar 包）。生产用户不受影响（走 release tarball）。
- [ ] IDE 端冒烟：安装 `tuyaopen-build`、`tuyaopen-dev-loop`，确认①缓存落到 `skills-registry/embedded/tuyaopen/...`、②项目里落到 `.agents/skills/tuyaopen-build/`（扁平，不是 `tuyaopen/build/`）、③**没有**发起 `TuyaOpen-dev-skills.tar.gz` 的下载请求
- [ ] 冒烟时实跑一次 SKILL.md 里的脚本命令（如 `$OPEN_SDK_PYTHON .agents/skills/tuyaopen-dev-loop/scripts/build_run.py`），确认路径修正后真的能执行

### Task 7：下线上游仓库（1 个 PR + 手工操作）

**在 `tuya/TuyaOpen-dev-skills`：**
- [ ] 删除 `release.yml` 里的 “Notify tuyaopen-ide-manifests” 步骤（或整个 `release.yml` + `sync-gitee.yml`）
- [ ] `README.md` / `README_zh.md` 顶部加归档横幅：**已归档，内容已迁入 `tuya/tuyaopen-ide-manifests` 的 `skills/embedded/tuyaopen/`**，附新路径链接与最后版本 v0.0.10
- [ ] GitHub Settings → Archive this repository（**不要删仓、不要删 release**：v0.0.10 的 tar 包必须对已发布的旧 IDE 保持可下载；archived 仓库的 release 资产仍可下载）
- [ ] Gitee 镜像 `tuya-open/TuyaOpen-dev-skills` 同样加归档说明并设只读

**在本仓：**
- [x] 删除 `.github/workflows/update-dev-skills.yml`
- [ ] 组织级 secret `MANIFESTS_DISPATCH_TOKEN` 若无其他用途则回收

**第二个下游消费方（review 发现，原计划漏了）：** `tuya-devplat-cli`（IDE 仓库的另一个 submodule，`vendor/tuya-devplat-cli`）从上游 **release tar 包**里 vendor 了 5 个技能，pin 在 v0.0.9：

- `scripts/sync-tuyaopen-skills.mjs:2` —— 注释写明「vendor TuyaOpen-dev-skills（pin v0.0.9）」
- `opencode-config/skills/skills-vendor.manifest.json:3` —— `"source": "https://github.com/tuya/TuyaOpen-dev-skills"`
- `.../sdk-project/references/TOS_COMMANDS.md:18` —— 指向上游 `skills/tuyaopen/project-config/references/TOS_COMMANDS.md`

- [ ] 把该仓库的 vendor source 与文档链接改指 `tuyaopen-ide-manifests`
- [ ] 归档说明里写明 **v0.0.9 和 v0.0.10 的 release 资产都不能删**（原计划只提了 v0.0.10）。归档本身不影响下载，但一旦有人清理 release，该仓库的 sync / `--check` 会挂

### Task 8：清尾

Task 0 已证明无需兼容窗口，本仓两项提前做完：

- [x] `skills/index.json` 删除 `devSkillsRelease`
- [x] `scripts/validate-skills-index.py`：`source.devSkills` 由警告改为**报错**（同时删掉随之失效的 warning 机制）
- [ ] `tools/manifest-editor/frontend/js/skill-editor.js:20` 删除 dev-skills 显示分支（低优先级，无条目会命中）
- [ ] `tools/manifest-gen/src/commands/skills.js` 删除 `--repo/--subpath/--ref` 选项（低优先级）
- [ ] IDE 侧四项遗留见 Task 0 末尾

---

## 四、风险与回滚

| 风险 | 影响 | 处置 |
|------|------|------|
| ~~IDE 无条件读 `devSkillsRelease`，被删后启动报错~~ | ~~高~~ | **已排除**：Task 0 核实该字段自引入起即为可选 + 有守卫，字段已删 |
| 旧 IDE 版本仍去下上游 tar 包 | 低 | 归档 ≠ 删除，v0.0.10 资产长期可下载；三镜像（GitHub/Gitee/tuyacn CDN）均保留 |
| `installPayload` 被顺手改动 | 高 | Task 2 明确禁止改；validator 的 `installPayload == localPath - "skills/"` 规则会拦住不一致 |
| 归档后上游又收到 PR/需要热修 | 中 | 归档前在 README 写明「新 PR 提到 tuyaopen-ide-manifests」 |
| 中文 JSON 编码被工具破坏 | 中 | 用 `manifest-gen skills` 子命令改，或确保以 UTF-8 读写；PR diff 里检查中文字段 |

**回滚：** Task 6 发版前，revert PR 即可（`devSkillsRelease` 与 8 个 devSkills `source` 一起回来，旧链路完整恢复 —— 上游 v0.0.10 的三个镜像仍在）。发版后回滚则再发一个 patch 版本做同样的 revert。

---

## 五、收益

- 技能内容与 board/demo/platform manifests 同仓同版本发布，不再出现「index.json 指向 v0.0.9 而 tar 包已是 v0.0.10」的偏移窗口
- IDE 少一次网络下载与一次 sha256 校验
- 少一条 `repository_dispatch` 链路、一个 workflow、一份重复的 `sync-gitee-release.sh`
- 顺带修掉 `cli-debug` / `crash-decode` 两个技能「已分发但用户看不见」的问题，并用 validator 护栏防复发
- 顺带修掉全部 36 处失效的技能自引用路径（见第六节 B1），`dev-loop` / `debug-helper` 这两个默认开启的技能之前就是坏的

---

## 六、独立 review 的发现与处置（2026-08-06）

### B1（Blocker，已修）：安装路径不是载荷路径

IDE 安装技能的目标目录是 `path.join('.agents/skills', item.id)`（`skills.ts:357`）—— **由 `id` 决定，扁平**；`skillsLegacyMigration.ts:5-8` 更明确把 `.agents/skills/tuyaopen/build/` 称作要修掉的 OLD layout。而上游 10 个 SKILL.md 里所有自引用都写成嵌套形式，指向不存在的路径。

根因很有意思：上游 README 的手动安装说明装的就是 `.agents/skills/tuyaopen/`，所以在上游语境里这些路径是自洽的 —— 只是跟 IDE 安装器不一致。这些技能一直靠 IDE 分发，也就一直是坏的（`dev-loop`、`debug-helper` 都是 `defaultEnabled: true`）。

处置：31 处 tuyaopen 引用 + 5 处 `skills/miniapp/smart-panel-dev`（其 id 是 `smart-panel-dev`，不带 `miniapp-` 前缀）全部改为扁平形式；含一处反斜杠写法的 Windows 路径。validator 新增护栏：`skills/**/*.md` 里任何 `.agents[/\]skills[/\]<seg>` 的首段必须是已知 item id —— 这条护栏在写文档过程中当场抓到我自己两处笔误。

### 一并处置的其它发现

| 级别 | 发现 | 处置 |
|------|------|------|
| Major | IDE submodule 指针停在迁移前，合并后 dev 模式会 `SKILL_NOT_CACHED_ERROR` | 写进 Task 6，必须同窗口推指针 |
| Major | `tuya-devplat-cli` 是第二个下游消费方，pin 在上游 v0.0.9 | 写进 Task 7 |
| Minor | `source.localPath` 只校验目录存在，指到父目录可同时骗过孤儿检查 | validator 增加「必须直接含 SKILL.md」 |
| Minor | `surface` 与 `localPath` 所在目录可以不一致 | validator 增加一致性检查 |
| Minor | `manifest-gen skills add` 两个 source 选项都不传时会写出无 `source` 的条目 | `--local-path` 改为必填，删掉 `--repo/--subpath/--ref` |
| Minor | `skills-tests.yml` 只盯 `skills/embedded/tuyaopen/**` | 放宽到 `skills/**` |
| Minor | `release.yml` 不跑 validator，但 README 声称会跑 | 打包前加一步校验 |
| Minor | `registry.json` 的 `publishedAt` 未跟着 bump；skills `summary` 混入了迁移说明 | 都已修（已确认 IDE 不以 `publishedAt` 做刷新门禁，仅一致性问题） |
| Nit | `check_env.sh` 上游是 100755，Windows 上 `cp` 丢了执行位 | `git update-index --chmod=+x` 复原（内容 blob 未变） |
| Nit | 上游 README 独有的「手动安装（不用 IDE）」说明归档后会消失 | 按扁平布局重写后并入 `skills/README.md` |

### 未处置 / 留给 IDE 侧

- IDE 侧 4 项遗留见 Task 0 末尾；其中命令面板那个「同步 TuyaOpen-dev-skills」按钮迁移后必然空转，建议随本次发版一起下掉。
- validator 仍不会检查「改了 `skills/**` 是否 bump 了 `registry.json` 的 skills 版本」—— 漏 bump 会让差分刷新给出旧缓存。需要跟 base 分支比对，暂未实现。
- `cli_debug.py`（477 行，本次唯一体量较大且首次可被用户调用的脚本）没有任何测试，`tests/skills` 也没导入它。仅确认过 `py_compile` 通过。

### 协调风险

review 期间发现 IDE 仓库有并行改动（分支 `fix/skills-startup-triple-scan`，改 `skillsSync.ts` / `skillsFlow.ts` 及其测试），内容是给 `SkillSyncItemResult` 加 `changed` 字段修启动重复 push。它投入的正是本次迁移会让其永久走不到的 devSkills 同步通道（新测试完全建立在 `devSkillsRelease` fixture 上）。两边落地前应先对齐。
