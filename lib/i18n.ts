// lib/i18n.ts

export type Language = 'it' | 'en';

export const dictionaries = {
  it: {
    home: {
      title: "DEMOCRACY\nIS DEAD",
      subtitle: "Teoria della Scelta Sociale • Analisi Realtime • Costo Zero",
      cta_button: "Inizia Nuova Elezione",
      cta_loading: "Creazione...",
      no_registration: "Nessuna registrazione richiesta",
      toast_init: "Inizializzazione protocollo democrazia...",
      toast_success: "Lobby creata! Reindirizzamento...",
      toast_error: "Errore critico: ",
    },
    lobby: {
        waiting_title: "Scheda Elettorale",
        waiting_subtitle: "Assegna un punteggio ai candidati.\n(Il voto è segreto e matematicamente protetto).",
        factors: "Fattori",
        vote_btn: "Conferma Voti ✅",
        update_btn: "Aggiorna Voto ↻",
        sending: "Invio in corso...",
        terminate_btn: "Termina Votazione",
        terminate_confirm: "Sei sicuro di voler chiudere le urne?",
        setup_title: "Setup Elezione",
        add_candidate: "Aggiungi Candidato",
        start_btn: "🚀 APRI LE VOTAZIONI"
    },
    results: {
        winner_title: "IL VINCITORE È...",
        analysis_title: "⚔️ Analisi Fattoriale",
        ranking_title: "Classifica Completa"
    }
  },
  en: {
    home: {
      title: "DEMOCRACY\nIS DEAD",
      subtitle: "Social Choice Theory • Realtime Analysis • Zero Cost",
      cta_button: "Start New Election",
      cta_loading: "Creating...",
      no_registration: "No registration required",
      toast_init: "Initializing democracy protocol...",
      toast_success: "Lobby created! Redirecting...",
      toast_error: "Critical error: ",
    },
    lobby: {
        waiting_title: "Ballot Paper",
        waiting_subtitle: "Score the candidates.\n(Voting is secret and mathematically protected).",
        factors: "Factors",
        vote_btn: "Confirm Votes ✅",
        update_btn: "Update Vote ↻",
        sending: "Sending...",
        terminate_btn: "End Election",
        terminate_confirm: "Are you sure you want to close the polls?",
        setup_title: "Election Setup",
        add_candidate: "Add Candidate",
        start_btn: "🚀 OPEN VOTING"
    },
    results: {
        winner_title: "THE WINNER IS...",
        analysis_title: "⚔️ Factorial Analysis",
        ranking_title: "Full Ranking"
    }
  }
};