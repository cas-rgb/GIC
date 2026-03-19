const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('export const dynamic')) {
        content = `export const dynamic = 'force-dynamic';\n` + content;
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.resolve(__dirname, '../src/app/api/analytics'));
console.log('Done.');
