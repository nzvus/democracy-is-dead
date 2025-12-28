const fs = require('fs');
const path = require('path');

// --- CONFIGURAZIONE DI SICUREZZA ---
// MODIFICA QUI: Solo ed esclusivamente TypeScript
const ALLOWED_EXTENSIONS = ['.ts', '.tsx']; 

// Cartelle da ignorare assolutamente
const IGNORE_DIRS = [
  'node_modules', 
  '.next', 
  '.git', 
  'dist', 
  'build', 
  '.vscode',
  'public'
];

// File specifici da ignorare (opzionale)
const IGNORE_FILES = [
  'next-env.d.ts', // File generato automaticamente, meglio non toccarlo
  'clean-comments.js', // Non pulire questo script
  'scan-codebase.js'
];

// Regex "Chirurgica":
// 1. Cattura commenti blocco /* ... */
// 2. Cattura commenti riga // ... (MA IGNORA quelli preceduti da : per salvare gli URL https://)
// 3. Cattura commenti JSX {/* ... */} se formattati come blocchi
const COMMENT_REGEX = /(\/\*[\s\S]*?\*\/)|((?<!:)\/\/.*)/g;

function cleanDirectory(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return; // Cartella non accessibile
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
      
      // IL CONTROLLO FONDAMENTALE:
      // Procedi solo se è .ts o .tsx E non è nella lista dei file ignorati
      if (ALLOWED_EXTENSIONS.includes(ext) && !IGNORE_FILES.includes(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Esegue la pulizia
          const newContent = content.replace(COMMENT_REGEX, '');
          
          // Scrive su disco SOLO se c'è una differenza (risparmia scritture inutili)
          if (content !== newContent) {
            // Rimuove anche le righe vuote multiple lasciate dai commenti cancellati (opzionale, ma pulisce meglio)
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