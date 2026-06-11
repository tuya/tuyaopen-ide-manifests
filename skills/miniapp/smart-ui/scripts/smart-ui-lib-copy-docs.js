const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SMART_UI_REPO = '/Users/luo/Desktop/work/components/ray-smart-ui';
const srcDir = path.join(SMART_UI_REPO, 'src');
const smartUIDocsDir = path.join(PROJECT_ROOT, 'skills/RayCommonDevelopSkill/smartUIDocs');
const smartUiRefDir = path.join(
  PROJECT_ROOT,
  'skills/RayCommonDevelopSkill/references/smart-ui'
);

function copyDirectory(src, dest) {
  console.log(`Copying ${src} -> ${dest}`);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  function copyRecursive(srcDirInner, destDirInner) {
    const entries = fs.readdirSync(srcDirInner, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDirInner, entry.name);
      const destPath = path.join(destDirInner, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  copyRecursive(src, dest);
}

console.log('Step 1: git pull (ray-smart-ui)...');
console.log(`$ git pull`);
try {
  execSync('git pull', { cwd: SMART_UI_REPO, stdio: 'inherit' });
} catch (e) {
  console.error('git pull failed');
  process.exit(1);
}

if (!fs.existsSync(srcDir)) {
  console.error(`Source not found: ${srcDir}`);
  process.exit(1);
}

// 确保 smartUIDocs 为空后写入
if (fs.existsSync(smartUIDocsDir)) {
  fs.rmSync(smartUIDocsDir, { recursive: true });
}
fs.mkdirSync(smartUIDocsDir, { recursive: true });

const components = fs.readdirSync(srcDir).filter(item => {
  const itemPath = path.join(srcDir, item);
  return fs.statSync(itemPath).isDirectory();
});

let copiedCount = 0;

components.forEach(component => {
  const readmePath = path.join(srcDir, component, 'README.md');

  if (fs.existsSync(readmePath)) {
    const kebabCaseName = component
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    const destPath = path.join(smartUIDocsDir, `${kebabCaseName}.md`);
    fs.copyFileSync(readmePath, destPath);
    console.log(`✓ 已复制: ${component} -> ${kebabCaseName}.md`);
    copiedCount++;
  }
});

console.log(`\n完成！共复制 ${copiedCount} 个组件文档到 smartUIDocs 目录`);

console.log('\nStep 2: smartUIDocs -> references/smart-ui ...');
copyDirectory(smartUIDocsDir, smartUiRefDir);

console.log('\nStep 3: 删除 smartUIDocs 临时目录...');
fs.rmSync(smartUIDocsDir, { recursive: true });

console.log('\n✓ smart-ui-lib-copy-docs 完成。\n');
