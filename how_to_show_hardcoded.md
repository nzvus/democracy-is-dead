

# 🚨 Guida di Emergenza: Ripristino Controllo Hardcoded (ESLint 8)

**Sintomo:** Scrivi `<div>Ciao</div>` e non appare nessuna sottolineatura rossa.
**Causa probabile:** Un aggiornamento ha installato ESLint 9 (troppo nuovo) o ha sovrascritto la configurazione.

### PASSO 1: Piazza Pulita (Terminale)

Dobbiamo rimuovere le versioni nuove e rimettere quelle stabili (ESLint 8).

1. Apri il terminale nella cartella del progetto.
2. Esegui questi due comandi in ordine:

```powershell
# 1. Rimuovi le versioni attuali (che potrebbero essere la v9)
npm uninstall eslint eslint-config-next

# 2. Installa le versioni STABILI (v8) e i plugin necessari
npm install --save-dev eslint@^8.57.0 eslint-config-next@14.1.0 eslint-plugin-i18next @typescript-eslint/parser

```

### PASSO 2: Ripristina il file `.eslintrc.json`

Questo è il "cervello" che dice a ESLint cosa cercare. Assicurati che il file **`.eslintrc.json`** contenga ESATTAMENTE questo (soprattutto la sezione `overrides`):

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:i18next/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["i18next"],
  "overrides": [
    {
      "files": ["*.tsx", "*.ts"],
      "rules": {
        "i18next/no-literal-string": [
          "error",
          {
            "markupOnly": true,
            "validateTemplate": true,
            "ignoreAttribute": [
              "className", "style", "href", "src", "alt", "key", "id", 
              "width", "height", "fill", "stroke", "viewBox", "d", 
              "target", "rel", "type", "placeholder", "as", "data-testid",
              "name", "value", "defaultValue", "role",
              "k", "label", "title", "aria-label"
            ]
          }
        ]
      }
    }
  ]
}

```

### PASSO 3: Forza VS Code a controllare TypeScript

A volte VS Code è pigro e controlla solo i file JS. Forziamolo.
Controlla che il file **`.vscode/settings.json`** esista e abbia questo contenuto:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}

```

### PASSO 4: Il Riavvio Magico (FONDAMENTALE)

Dopo aver cambiato queste cose, VS Code è ancora "addormentato" sulle vecchie impostazioni. Devi svegliarlo.

1. Mentre sei su VS Code, premi **F1** (oppure `Ctrl + Shift + P`).
2. Scrivi: **`ESLint: Restart ESLint Server`**.
3. Premi **Invio**.

### PASSO 5: La Prova del Nove

1. Apri un file `.tsx` (es. `page.tsx`).
2. Scrivi una scritta proibita:
```tsx
<div>TEST HARDCODED</div>

```


3. Aspetta 2 secondi.

Se vedi l'onda rossa sotto "TEST HARDCODED", **hai vinto**. 🎯