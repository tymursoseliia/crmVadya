const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.sql')) return;
  
  let code = fs.readFileSync(filePath, 'utf8');
  let original = code;
  
  // Replacements
  code = code.replace(/\bvoha\b/g, 'vady');
  code = code.replace(/\bvohaTeam\b/g, 'vadyTeam');
  code = code.replace(/\bvohaStats\b/g, 'vadyStats');
  code = code.replace(/\bVoha\b/g, 'Vady');
  code = code.replace(/Вохи/g, 'Вади');
  code = code.replace(/Воха/g, 'Вадя'); // in case it appears

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walkDir('./src', replaceInFile);
replaceInFile('./supabase-init.sql');

console.log('Replacement complete.');
