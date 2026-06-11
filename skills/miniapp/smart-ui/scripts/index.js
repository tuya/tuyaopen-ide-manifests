/**
 * 一键同步文档与元数据（按顺序执行）：
 * 2. scripts/smart-ui-lib-copy-docs.js — ray-smart-ui README → references/smart-ui
 * 3. scripts/generate-smart-ui-meta.js — 生成 smart-ui/_meta.json
 * 5. scripts/replace-phone-numbers.js — 脱敏手机号、邮箱
 *
 * 用法: node scripts/index.js
 * 将额外参数透传给第 4 步，例如: node scripts/index.js --meta-only
 */

const { execFileSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

const STEPS = [
  { file: 'smart-ui-lib-copy-docs.js', passThrough: false },
  { file: 'generate-smart-ui-meta.js', passThrough: false },
  { file: 'replace-phone-numbers.js', passThrough: false },
];

function main() {
  const extraArgs = process.argv.slice(2);
  const start = Date.now();

  for (const step of STEPS) {
    const scriptPath = path.join(__dirname, step.file);
    const argv =
      step.passThrough && extraArgs.length > 0
        ? [scriptPath, ...extraArgs]
        : [scriptPath];

    console.log(`\n${'='.repeat(60)}`);
    console.log(
      `▶ node scripts/${step.file}${step.passThrough && extraArgs.length ? ' ' + extraArgs.join(' ') : ''}`
    );
    console.log('='.repeat(60));

    execFileSync(process.execPath, argv, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
  }

  console.log(`\n✓ 全部完成 (耗时 ${((Date.now() - start) / 1000).toFixed(2)}s)\n`);
}

main();
