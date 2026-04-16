const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Dell/Desktop/Sparc Innovation/gic-app/src');
let count = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const orig = content;

    content = content.replace(/\{ next: \{ revalidate: \d+ \} \}/g, '{ cache: "no-store" }');
    content = content.replace(/next: \{ revalidate: \d+ \},/g, 'cache: "no-store",');
    content = content.replace(/next: \{ revalidate: \d+ \}/g, 'cache: "no-store"');
    
    if (file.includes('ErrorBoundary.tsx')) {
       content = content.replace('error.message', '(error as any).message');
    }

    if (content !== orig) {
        fs.writeFileSync(file, content);
        count++;
    }
}
console.log(`Fixed ${count} files.`);
