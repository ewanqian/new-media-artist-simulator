import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const targetDir = path.join(root, '..', 'new-media-time-simulator');

if (!fs.existsSync(distDir)) {
  console.error('dist 不存在，请先执行 npm run build');
  process.exit(1);
}

console.log(`同步构建产物到: ${targetDir}`);

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(distDir, targetDir, { recursive: true });

console.log('✅ 已同步完成');
console.log('访问入口: 根目录 index.html → ./new-media-time-simulator/');
