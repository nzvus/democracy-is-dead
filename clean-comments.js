const fs = require('fs');
const path = require('path');
 
const ALLOWED_EXTENSIONS = ['.ts', '.tsx']; 

const IGNORE_DIRS = [
  'node_modules', 
  '.next', 
  '.git', 
  'dist', 
  'build', 
  '.vscode',
  'public'
];

const IGNORE_FILES = [
  'next-env.d.ts',
  'clean-comments.js',  
  'scan-codebase.js'
];

 
const COMMENT_REGEX = /(\/\*[\s\S]*?\*\/)|((?<!:)\/\/.*)/g;

function cleanDirectory(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return;  
  }

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        cleanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      
      if (ALLOWED_EXTENSIONS.includes(ext) && !IGNORE_FILES.includes(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          const newContent = content.replace(COMMENT_REGEX, '');
          
          if (content !== newContent) {
            const compactedContent = newContent.replace(/^\s*[\r\n]/gm, ''); 
            
            fs.writeFileSync(fullPath, compactedContent, 'utf8');
            console.log(`✅ Pulito: ${file}`);
          }
        } catch (e) {
          console.error(`❌ Errore su ${file}: ${e.message}`);
        }
      }
    }
  });
}

console.log('--- AVVIO PULIZIA (SOLO .TS / .TSX) ---');
console.log('I file JSON e di configurazione verranno ignorati.');
cleanDirectory('.');
console.log('--- OPERAZIONE COMPLETATA ---');