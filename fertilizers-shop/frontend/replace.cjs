const fs = require('fs');
const path = require('path');
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/ \|\| [\"']http:\/\/localhost:5000[\"']/g, '');
  content = content.replace(/ \/\/ e\.g\. http:\/\/localhost:5173/g, '');
  content = content.replace(/localhost:5173/g, '{BASE}');
  fs.writeFileSync(filePath, content);
}
function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) { walk(full); }
    else if (full.endsWith('.jsx')) { replaceInFile(full); }
  }
}
walk('src');
