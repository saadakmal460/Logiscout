const fs = require('fs');
const path = require('path');

function fixRequireStatements(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixRequireStatements(fullPath);
    } else if (item.endsWith('.cjs')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace require("./path.js") with require("./path.cjs")
      content = content.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")');
      content = content.replace(/require\('\.\/([^']+)\.js'\)/g, "require('./$1.cjs')");
      // Replace require("../path.js") with require("../path.cjs")
      content = content.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")');
      content = content.replace(/require\('\.\.\/([^']+)\.js'\)/g, "require('../$1.cjs')");
      // Handle multiple levels of ../
      content = content.replace(/require\("((?:\.\.\/)+)([^"]+)\.js"\)/g, 'require("$1$2.cjs")');
      content = content.replace(/require\('((?:\.\.\/)+)([^']+)\.js'\)/g, "require('$1$2.cjs')");

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

function renameJsToCjs(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameJsToCjs(fullPath);
    } else if (item.endsWith('.js') && !item.endsWith('.d.ts')) {
      const newPath = fullPath.replace(/\.js$/, '.cjs');
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
  }
}

const cjsDir = path.join(__dirname, '..', 'dist', 'cjs');
if (fs.existsSync(cjsDir)) {
  console.log('Renaming .js files to .cjs in dist/cjs...');
  renameJsToCjs(cjsDir);
  console.log('Fixing require statements...');
  fixRequireStatements(cjsDir);
  console.log('Done!');
} else {
  console.log('dist/cjs directory not found');
}
