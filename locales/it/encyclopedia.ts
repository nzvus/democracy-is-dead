const encyclopedia = {
  weighted: {
    title: "Media Pesata (Weighted)",
    subtitle: "Il classico democratico con un tocco di precisione.",
    history: "Derivato dalla media aritmetica, uno dei concetti matematici più antichi, usato sin dai tempi dei Pitagorici. L'aggiunta dei 'pesi' permette di dare più importanza ad alcuni criteri rispetto ad altri.",
    mechanism: "Ogni votante assegna un voto (es. 1-10) per ogni criterio. Il voto finale è la somma dei voti moltiplicati per il peso del criterio.",
    pros: "Facile da capire; permette di valutare sfumature su più dimensioni.",
    cons: "Vulnerabile al voto tattico (dare 1 o 10 per influenzare la media); non garantisce il vincitore preferito dalla maggioranza assoluta."
  },
  borda: {
    title: "Conteggio Borda",
    subtitle: "Premia il consenso, non solo la popolarità.",
    history: "Proposto da Jean-Charles de Borda nel 1770 per l'Accademia delle Scienze francese come alternativa al voto di maggioranza semplice.",
    mechanism: "Se ci sono 5 candidati, la tua prima scelta prende 4 punti, la seconda 3, ecc. Si sommano i punti di tutti.",
    pros: "Sceglie candidati ampiamente accettati; riduce l'impatto dei candidati polarizzanti.",
    cons: "Può essere manipolato inserendo candidati 'cloni' o fantoccio per diluire i voti degli avversari."
  },
  schulze: {
    title: "Metodo Schulze (Beatpath)",
    subtitle: "Il Re dei metodi Condorcet. Matematicamente superiore.",
    history: "Sviluppato da Markus Schulze nel 1997. È usato da organizzazioni come Debian, Ubuntu, e il Partito Pirata per la sua robustezza.",
    mechanism: "Confronta ogni candidato contro ogni altro (duelli). Se A batte B più spesso di quanto B batta A, si traccia un percorso. Vince chi batte tutti gli altri nei percorsi più forti.",
    pros: "Soddisfa il criterio di Condorcet (se uno batte tutti, vince); immune a molte strategie manipolative.",
    cons: "Complesso da calcolare a mano e difficile da spiegare intuitivamente."
  }
}

export default encyclopedia