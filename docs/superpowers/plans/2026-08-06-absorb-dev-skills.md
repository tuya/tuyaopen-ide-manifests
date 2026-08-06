# 归档 TuyaOpen-dev-skills 并内联进 tuyaopen-ide-manifests

> **For agentic workers:** 按任务顺序执行，每个 Task 一个 commit / 一个 PR。步骤使用 `- [ ]` 复选框跟踪。

**目标：** 把 `tuya/TuyaOpen-dev-skills` 的全部内容搬进 `tuyaopen-ide-manifests`，让 `skills/` 成为技能的唯一来源；随后把上游仓库设为 archived（只读），并拆掉两仓之间的 `repository_dispatch` 联动。

**核心结论：** 这次迁移**不需要改 IDE 端代码**。8 个 dev-skills 条目的 `installPayload` 已经是 `embedded/tuyaopen/<name>`，只要落到 `skills/embedded/tuyaopen/<name>`，`source` 从 `{devSkills,subpath}` 换成 `{localPath}` 即可 —— `localPath` 这条路径 IDE 早已在用（27 个条目里 19 个是 localPath），而 `release.yml` 打包时本来就 `cp -r skills staging/`，文件天然进 `manifests.tar.gz`。净效果是少一次网络下载。

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

## 二、待确认（不阻塞开工，但影响 Task 2 / Task 4）

1. **`cli-debug` 与 `crash-decode` 是否登记进 index？**
   建议：**登记**，`defaultEnabled: false`。它们已经写好且随包分发了 3 个月却对用户不可见 —— 这本身是 bug。若决定不要，则直接删掉，不要留在 `skills/` 下当死内容。
2. **是否保留上游 git 历史？**
   建议：**直接复制文件**，commit body 里记上游 HEAD SHA。技能是小体量文档，历史留在 archived 仓库可查。若要求可追溯，改用 `git subtree add --prefix=skills/embedded/tuyaopen`（但上游路径是 `skills/tuyaopen/`，subtree 后还要一次 `git mv`，历史会有一层 rename）。
3. **`devSkillsRelease` 墓碑保留几个 release？**
   取决于 IDE 是否在启动时无条件读它。Task 0 先查清；查清前不要删。

---

## 三、任务

### Task 0：确认 IDE 端消费方式（前置，~15 分钟）

在 IDE 仓库里 grep 三个词，确认后再动 index.json：

- [ ] `devSkillsRelease` —— 是否**无条件**读取/校验？缺失会不会抛错？决定墓碑保留策略
- [ ] `localPath` —— 确认安装逻辑是「从 manifests 包内 `localPath` 拷到 `installPayload`」
- [ ] `source.devSkills` / `subpath` —— 确认没有别处硬编码上游 URL 或 `skills/tuyaopen/` 前缀

**若发现 IDE 无条件读 `devSkillsRelease`：** 墓碑必须留到「不再读它的 IDE 版本」成为最低支持版本之后，Task 6 相应延后。

### Task 1：搬运文件（1 个 commit）

**Files:** 新增 `skills/embedded/tuyaopen/**`、`tests/skills/**`

- [ ] 克隆上游 master，记下 HEAD SHA
- [ ] 8 个技能：`skills/tuyaopen/<name>` → `skills/embedded/tuyaopen/<name>`（含 `references/`、`scripts/`）
- [ ] `skills/tuyaopen-cli-debug` → `skills/embedded/tuyaopen/cli-debug`（连 `requirements.txt`）
- [ ] `skills/tuyaopen-crash-decode` → `skills/embedded/tuyaopen/crash-decode`
- [ ] 两者 SKILL.md frontmatter 的 `name:` 归一到嵌套风格：`tuyaopen-cli-debug` → `tuyaopen/cli-debug`，`tuyaopen-crash-decode` → `tuyaopen/crash-decode`（与其余 8 个 `tuyaopen/build` 风格一致）
- [ ] `tests/` → `tests/skills/`，改 3 个文件的 `sys.path.insert` 路径为 `../../skills/embedded/tuyaopen/<name>/scripts`
- [ ] 不搬：`README.md`、`README_zh.md`、`LICENSE`、`release.json`、`.github/`、`scripts/sync-gitee-release.sh`（本仓已有等价物）
- [ ] 确认没带入 `__pycache__` / `*.pyc`

**验证：** `find skills/embedded/tuyaopen -name SKILL.md | wc -l` = 10

### Task 2：改 `skills/index.json`（1 个 commit）

- [ ] 8 个条目：`"source": {"devSkills": true, "subpath": "skills/tuyaopen/X"}` → `"source": {"localPath": "skills/embedded/tuyaopen/X"}`。`installPayload`、`id`、`order`、`commands` **一律不动** —— 这是「IDE 零改动」的前提
- [ ] 新增 2 个条目（若 Task 0/决策 1 通过）：`tuyaopen-cli-debug`、`tuyaopen-crash-decode`；`surface: embedded`、`sdks: ["tuyaopen"]`、`defaultEnabled: false`、`order` 接在现有 embedded 段之后；双语 `name`/`summary`/`whenToUse` 从各自 SKILL.md 的 description 提炼（已含中文关键词，可直接复用）；`related` 指向 `tuyaopen-debug-helper` / `tuyaopen-build`
- [ ] `devSkillsRelease` **保持原样**（墓碑），另加 `"note"` 字段说明「retained for IDE ≤ X compatibility, remove after」
- [ ] 更新 `publishedAt`
- [ ] `registry.json`：`manifests.skills.version` 0.1.0 → 0.2.0（minor：新增条目 + source 语义变更）

**注意** JSON 文件是 UTF-8 且含中文，编辑时不要让工具改写编码。可用 `node tools/manifest-gen/bin/manifest-gen.js skills list/get/set` 操作以避免手改整文件。

**验证：** `python3 scripts/validate-skills-index.py` 通过；`grep -c devSkills skills/index.json` 只剩 `devSkillsRelease` 那一处

### Task 3：更新校验脚本（1 个 commit）

**Files:** `scripts/validate-skills-index.py`

- [ ] `devSkillsRelease` 从必填改为选填（存在时仍校验字段与 URL 格式）
- [ ] `source` 的 devSkills 分支：保留解析能力，但对命中的条目打印 deprecation 警告（Task 6 后改为报错）
- [ ] **新增「孤儿技能目录」检查**：遍历 `skills/**/SKILL.md`，每个目录必须被恰好一个 index 条目的 `source.localPath` 引用；否则报错。这正是漏掉 `cli-debug`/`crash-decode` 的那类 bug，装上护栏才不会复发
- [ ] 同步更新文件头 docstring 的 Checks 列表

**验证：** 故意删掉一个 index 条目 → 脚本报孤儿错误；恢复后通过

### Task 4：补 pytest CI（1 个 commit）

**Files:** 新增 `.github/workflows/skills-tests.yml`

- [ ] `on: pull_request/push` + `paths: ["skills/embedded/tuyaopen/**", "tests/skills/**", ".github/workflows/skills-tests.yml"]`
- [ ] `python3 -m pip install pytest` → `python3 -m pytest tests/skills -q`
- [ ] 本地先跑一遍确认 3 个测试文件在新路径下全绿（上游从未在 CI 跑过，可能本来就有失败）

### Task 5：文档（1 个 commit）

- [ ] `README.md` skills 段落：说明 skills 内容现已完全内联，dev-skills 已归档
- [ ] `docs/manifest-architecture.md`：目录树补上 `skills/embedded|cloud|miniapp/**`，删掉外部 dev-skills 依赖的描述
- [ ] 新增 `skills/README.md`：布局约定、`localPath` 与 `installPayload` 的对应规则（`installPayload == localPath - "skills/"`）、加一个技能的步骤（建目录 → 写 SKILL.md → `manifest-gen skills add` → 跑 validator）
- [ ] 在 `docs/superpowers/specs/` 或本 plan 同目录留一条迁移记录，含上游 HEAD SHA

### Task 6：发版（1 个 release）

- [ ] 合并 Task 1–5 后打 tag `v0.1.8`（`release.yml` 会自动打包、写 release.json、同步 Gitee、开 PR 回写 main）
- [ ] 下载产出的 `manifests.tar.gz`，确认含 `skills/embedded/tuyaopen/` 下 10 个 `SKILL.md`
- [ ] IDE 端冒烟：安装 `tuyaopen-build`、`tuyaopen-dev-loop`，确认落到 `embedded/tuyaopen/...` 且**没有**发起 `TuyaOpen-dev-skills.tar.gz` 的下载请求

### Task 7：下线上游仓库（1 个 PR + 手工操作）

**在 `tuya/TuyaOpen-dev-skills`：**
- [ ] 删除 `release.yml` 里的 “Notify tuyaopen-ide-manifests” 步骤（或整个 `release.yml` + `sync-gitee.yml`）
- [ ] `README.md` / `README_zh.md` 顶部加归档横幅：**已归档，内容已迁入 `tuya/tuyaopen-ide-manifests` 的 `skills/embedded/tuyaopen/`**，附新路径链接与最后版本 v0.0.10
- [ ] GitHub Settings → Archive this repository（**不要删仓、不要删 release**：v0.0.10 的 tar 包必须对已发布的旧 IDE 保持可下载；archived 仓库的 release 资产仍可下载）
- [ ] Gitee 镜像 `tuya-open/TuyaOpen-dev-skills` 同样加归档说明并设只读

**在本仓：**
- [ ] 删除 `.github/workflows/update-dev-skills.yml`
- [ ] 组织级 secret `MANIFESTS_DISPATCH_TOKEN` 若无其他用途则回收

### Task 8：清尾（可延后，等 IDE 底线版本抬上来）

- [ ] `skills/index.json` 删除 `devSkillsRelease`
- [ ] `scripts/validate-skills-index.py` 删除 devSkills 分支（改为报错）
- [ ] `tools/manifest-editor/frontend/js/skill-editor.js:20` 删除 dev-skills 显示分支
- [ ] `tools/manifest-gen/src/commands/skills.js` 删除 `--repo/--subpath/--ref` 选项

---

## 四、风险与回滚

| 风险 | 影响 | 处置 |
|------|------|------|
| IDE 无条件读 `devSkillsRelease`，被删后启动报错 | 高 | Task 0 先查；墓碑保留到确认为止（Task 8 才删） |
| 旧 IDE 版本仍去下上游 tar 包 | 低 | 归档 ≠ 删除，v0.0.10 资产长期可下载；三镜像（GitHub/Gitee/tuyacn CDN）均保留 |
| `installPayload` 被顺手改动 | 高 | Task 2 明确禁止改；validator 的 `installPayload == localPath - "skills/"` 规则会拦住不一致 |
| 归档后上游又收到 PR/需要热修 | 中 | 归档前在 README 写明「新 PR 提到 tuyaopen-ide-manifests」 |
| 中文 JSON 编码被工具破坏 | 中 | 用 `manifest-gen skills` 子命令改，或确保以 UTF-8 读写；PR diff 里检查中文字段 |

**回滚：** Task 6 发版前，revert PR 即可；`devSkillsRelease` 全程未动，旧链路立刻恢复。发版后回滚则再发一个 patch 版本把 8 个 `source` 改回 devSkills。

---

## 五、收益

- 技能内容与 board/demo/platform manifests 同仓同版本发布，不再出现「index.json 指向 v0.0.9 而 tar 包已是 v0.0.10」的偏移窗口
- IDE 少一次网络下载与一次 sha256 校验
- 少一条 `repository_dispatch` 链路、一个 workflow、一份重复的 `sync-gitee-release.sh`
- 顺带修掉 `cli-debug` / `crash-decode` 两个技能「已分发但用户看不见」的问题，并用 validator 护栏防复发
