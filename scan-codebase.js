
const fs = require('fs');
const path = require('path');


const OUTPUT_FILE = '_project_transcript.txt';
const INCLUDED_EXTENSIONS = ['.ts', '.tsx', '.json', '.css'];
const IGNORED_DIRS = [
  'node_modules', 
  '.next', 
  '.git', 
  '.vscode', 
  'dist', 
  'build',
  'public'
];
const IGNORED_FILES = [
  'package-lock.json', 
  'yarn.lock', 
  'pnpm-lock.yaml',
  OUTPUT_FILE, 
  path.basename(__filename)
];


if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}


const header = `PROJECT TRANSCRIPT\nDate: ${new Date().toLocaleString()}\n\n`;
fs.writeFileSync(OUTPUT_FILE, header);

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      
      
      if (INCLUDED_EXTENSIONS.includes(ext) && !IGNORED_FILES.includes(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          const fileHeader = `\n\n` +
            `================================================================================\n` +
            `FILE: ${fullPath}\n` +
            `================================================================================\n`;

          fs.appendFileSync(OUTPUT_FILE, fileHeader + content);
          console.log(`Included: ${fullPath}`);
        } catch (err) {
          console.error(`Error reading ${fullPath}:`, err.message);
        }
      }
    }
  });
}

console.log('--- STARTING SCAN ---');
scanDirectory('.');
console.log('--- SCAN COMPLETE ---');
console.log(`Output saved to: ${OUTPUT_FILE}`);