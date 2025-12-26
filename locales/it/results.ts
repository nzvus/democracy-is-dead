export default {
    winner_title: "VINCITORE",
    winner_subtitle: "Basato sul sistema selezionato",
    
    ranking_title: "Dettaglio Punteggi",
    col_cand: "Candidato",
    
    
    math_legend_title: "Come funziona il calcolo?",
    math_legend_desc: "I voti sono normalizzati per eliminare le differenze tra giudici severi e buoni. Il punteggio finale dipende dal sistema di voto selezionato in alto.",

    
    podium: {
        gold: "Vincitore",
        silver: "2° Classificato",
        bronze: "3° Classificato"
    },

    
    systems: {
        weighted: {
            title: "Media Ponderata",
            desc: "Calcola la media matematica dei voti, moltiplicata per il peso di ogni criterio.",
            history: "È il metodo più intuitivo e comune (es. pagelle scolastiche). Premia la qualità costante e la media alta, ma è vulnerabile ai voti estremi (1 o 10) che possono falsare il risultato."
        },
        borda: {
            title: "Metodo Borda",
            desc: "Assegna punti fissi in base alla posizione in classifica (es. 1° = 10pt, 2° = 9pt...).",
            history: "Ideato nel 1770 da Jean-Charles de Borda. Usato nell'Eurovision e in Formula 1. Premia il 'consenso': vince chi piace a tutti, anche se non è il preferito assoluto, penalizzando chi polarizza (odiato da alcuni, amato da altri)."
        },
        median: {
            title: "Giudizio (Mediana)",
            desc: "Prende il voto centrale esatto: metà dei giudici ha dato di più, metà di meno.",
            history: "Simile al 'Majority Judgment'. È il sistema più resistente ai troll o ai fan accaniti, perché ignora completamente i picchi anomali. Vince chi convince la 'maggioranza silenziosa'."
        }
    },

    
    charts: {
        radar: "Radar Fattori",
        distribution: "Distribuzione",
        comparison: "Confronto Sistemi",
        compare_title: "Classifica (Barra più corta = Migliore)",
        radar_desc: "Visualizza i punti di forza e debolezza di ogni candidato sui vari criteri.",
        compare_desc: "Confronta come cambierebbe la classifica usando sistemi di voto diversi."
    },

    
    matrix_title: "Matrice dei Voti",
    matrix_subtitle: "Scopri chi ha votato cosa (Trasparenza)",
    matrix_anon: "Voto Segreto",
    matrix_anon_desc: "L'host ha impostato i voti come anonimi.",
    my_vote: "(Tu)",

    
    badges: {
        hater: "Il Critico",
        lover: "L'Entusiasta",
        hive_mind: "Il Conformista",
        maverick: "Bastian Contrario"
    },
    badges_desc: {
        hater: "Ha dato i voti più bassi in media",
        lover: "Ha dato i voti più alti in media",
        hive_mind: "Vota quasi identico alla media del gruppo",
        maverick: "Vota spesso all'opposto del gruppo"
    },

    
    reopen_btn: "Riapri Votazione",
    reopen_confirm: "Vuoi riaprire la votazione? Gli utenti potranno modificare i loro voti e i risultati potrebbero cambiare."
}