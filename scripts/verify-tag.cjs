const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = walk('dist');
console.log('Total HTML files found:', htmlFiles.length);
htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const hasTag = content.includes('name="google-site-verification" content="5aJdjV8Gtb9kcS_-alDDmJWYezALgoUWsKe0w_ET9ZQ"');
  console.log(f + ': ' + (hasTag ? 'VERIFIED ✓' : 'MISSING ✗'));
});
