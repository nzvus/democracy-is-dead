export default {
  ranking_title: "Classifica Finale",
  matrix_title: "Matrice dei Voti",
  matrix_subtitle: "I punteggi grezzi assegnati da ogni partecipante.",
  
  reopen_btn: "Riapri Voto",
  reopen_confirm: "Sei sicuro? Questo permetterà agli utenti di cambiare i voti.",
  
  math_legend_desc: "Come vengono calcolati i punteggi in base all'algoritmo scelto.",
  
  matrix_anon: "Utente Anonimo",
  my_vote: "(Tu)",

  systems: {
    weighted: {
      title: "Media Pesata",
      desc: "Media classica dei voti ponderata per l'importanza dei criteri."
    },
    borda: {
      title: "Conteggio Borda",
      desc: "Punti assegnati in base alla posizione nella classifica di ogni utente."
    },
    schulze: {
      title: "Metodo Schulze",
      desc: "Metodo di Condorcet basato sui percorsi più forti nei duelli a coppie."
    },
    median: {
      title: "Mediana",
      desc: "Il valore centrale, robusto contro i voti estremi."
    }
  },

  charts: {
    radar: "Analisi Radar",
    radar_desc: "Confronto delle forze su diversi criteri.",
    comparison: "Confronto Algoritmi",
    compare_title: "Vincitori per Sistema", // <--- AGGIUNTO
    comparison_desc: "Come cambia il vincitore a seconda della matematica usata."
  },

  schulze_matrix: {
    title: "Matrice dei Duelli",
    subtitle: "Analisi Pairwise: Leggi la riga per vedere quante volte quel candidato ha battuto gli altri (Riga > Colonna).",
    wins: "Vince",
    loses: "Perde",
    ties: "Pareggia"
  },

  badges: {
    title: "Titoli",
    hater: "Il Critico Spietato",
    lover: "L'Ottimista Incurabile",
    contrarian: "Bastian Contrario",
    oracle: "L'Oracolo",
    hive_mind: "Mente Collettiva"
  },
  
  badges_desc: {
     hater: "Ha dato i voti medi più bassi.",
     lover: "Ha dato i voti medi più alti.",
     contrarian: "Spesso in disaccordo con la maggioranza.",
     oracle: "I suoi gusti rispecchiano esattamente il vincitore.",
     hive_mind: "Vota quasi sempre come la media del gruppo."
  }
}