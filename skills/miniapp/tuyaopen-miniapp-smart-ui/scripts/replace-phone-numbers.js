const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const referencesDir = path.join(PROJECT_ROOT, 'skills/RayCommonDevelopSkill/references');

// 要处理的文件扩展名
const extensions = ['.md', '.mdx'];

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        processFile(filePath);
      }
    }
  }
}

function processFile(filePath) {
  totalFiles++;
  let content = fs.readFileSync(filePath, 'utf-8');
  let replacements = 0;

  content = content.replace(/\b1[3-9]\d{9}\b/g, (match) => {
    replacements++;
    return '1********';
  });

  content = content.replace(/(\+?86)[-\s](1[3-9]\d{9})/g, (match, code) => {
    replacements++;
    return `${code}-1********`;
  });

  content = content.replace(/\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match) => {
    replacements++;
    return '***@***.***';
  });

  if (replacements > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedFiles++;
    totalReplacements += replacements;
    console.log(`Modified: ${filePath} (${replacements} replacements)`);
  }
}

console.log('Starting sensitive info replacement...');
console.log(`Scanning directory: ${referencesDir}`);
console.log('');

processDirectory(referencesDir);

console.log('');
console.log('Replacement complete!');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
