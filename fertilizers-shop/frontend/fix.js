import fs from 'fs';
import path from 'path';

const replacement = `const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const SERVER_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('const SERVER_URL = import.meta.env.VITE_SERVER_URL;')) {
        content = content.replace('const SERVER_URL = import.meta.env.VITE_SERVER_URL;', replacement);
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}
processDir('c:/Users/hi/Downloads/fertilizers-shop (1)/fertilizers-shop/frontend/src');
