const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const docsDir = path.join(PROJECT_ROOT, 'skills/RayCommonDevelopSkill/references/smart-ui');
const outputFile = path.join(docsDir, '_meta.json');

// 读取目录下所有 md 文件
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

const components = [];

files.forEach(file => {
  const filePath = path.join(docsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // 匹配标题：# ActionSheet 动作面板
  const titleMatch = content.match(/^#\s+(\S+)\s+(.+)$/m);
  if (!titleMatch) {
    console.log(`Skipping ${file}, no title found`);
    return;
  }

  const englishName = titleMatch[1];
  const chineseName = titleMatch[2];

  // 匹配介绍部分：### 介绍 后面的内容
  const introMatch = content.match(/###\s+介绍\s*\n\s*\n([^\n]+)/);
  const description = introMatch ? introMatch[1].trim() : '';

  // 匹配 category
  const categoryMatch = content.match(/^category:\s*(.+)$/m);
  const category = categoryMatch ? categoryMatch[1].trim() : '';

  components.push({
    englishName,
    chineseName,
    description: description,
    category,
  });
});

// 按英文名称排序
components.sort((a, b) => a.englishName.localeCompare(b.englishName));

// 生成 JSON
fs.writeFileSync(outputFile, JSON.stringify(components, null, 2), 'utf-8');

console.log(`Generated ${outputFile} with ${components.length} components`);
