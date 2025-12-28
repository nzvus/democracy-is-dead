 
⚠️ **ATTENZIONE:** Le Regex sono potenti ma "cieche". Fai sempre un backup o committa su Git prima di eseguire queste operazioni in massa, perché potrebbero cancellare parti di stringhe che sembrano commenti (es. `http://...`).

### 1. La "Super Regex" (TS, TSX, JSON, SQL, MD)

Questa regex cerca di catturare tutti i tipi di commenti comuni in un colpo solo.

**Cerca:**

```regex
(/\*[\s\S]*?\*/)|()|((?<!:)\/\/.*)|(--.*)

```

**Sostituisci con:**
*(Lascia vuoto)*

**Spiegazione:**

1. `(/\*[\s\S]*?\*/)`: Cattura commenti a blocco tipo `/* ... */` (JS, TS, SQL).
2. `|`: Oppure...
3. `()`: Cattura commenti HTML/Markdown ``.
4. `|`: Oppure...
5. `((?<!:)\/\/.*)`: Cattura commenti a riga singola `//` (JS, TS), ma **ignora** quelli preceduti da `:` (per salvare gli URL come `https://`).
6. `|`: Oppure...
7. `(--.*)`: Cattura commenti SQL a riga singola `--`.

---

### 2. Regex Specifiche (Più Sicure)

Se vuoi agire su file specifici per evitare errori, usa queste:

#### A. Per TypeScript, TSX, JSON (`.ts`, `.tsx`, `.json`)

Gestisce `//` e `/* */`, proteggendo gli URL (`http://`).

**Cerca:**

```regex
(/\*[\s\S]*?\*/)|((?<!:)\/\/.*)

```

#### B. Per SQL (`.sql`)

Gestisce `--` e `/* */`.

**Cerca:**

```regex
(--.*)|(/\*[\s\S]*?\*/)|(#.*)

```

*(Ho aggiunto anche `#` che è usato in alcuni dialetti SQL come MySQL)*

#### C. Per Markdown (`.md`)

Gestisce i commenti stile HTML.

**Cerca:**

```regex

```

---

### 3. Alternativa "Pro": Estensione VS Code (Consigliata)

Le regex faticano a distinguere tra un vero commento e un commento dentro una stringa (es. `const x = "// questo non è un commento";`).

Per una pulizia professionale senza rischi, ti consiglio di installare un'estensione dedicata che "capisce" il codice:

1. Apri le Estensioni (Ctrl+Shift+X).
2. Cerca **"Remove Comments"**.
3. Installala (quella di *Rio* è molto usata).
4. Premi `F1` e digita `Remove All Comments`.

Questo metodo è molto più sicuro per una codebase grande come la tua.