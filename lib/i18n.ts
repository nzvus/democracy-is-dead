// lib/i18n.ts

export type Language = 'it' | 'en';

export const dictionaries = {
  it: {
    home: {
      title: "DEMOCRACY\nIS DEAD",
      subtitle: "Teoria della Scelta Sociale • Analisi Realtime • Costo Zero",
      cta_button: "Inizia Nuova Elezione",
      cta_loading: "Creazione...",
      or_divider: "OPPURE",
      join_placeholder: "Codice (es. 1234)",
      join_btn: "Entra ➤",
      no_registration: "Nessuna registrazione richiesta",
      toast_init: "Inizializzazione protocollo democrazia...",
      toast_success: "Lobby creata! Reindirizzamento...",
      toast_error: "Errore critico: ",
      error_code_short: "Codice troppo corto",
      error_lobby_not_found: "Lobby non trovata o chiusa."
    },
    onboarding: {
        title: "Identificati",
        subtitle: "Come ti chiameranno gli altri?",
        nick_placeholder: "Il tuo Nickname (es. 'Il Boss')",
        join_btn: "Entra nella Lobby",
        error_nick: "Inserisci un nickname valido"
    },
    lobby: {
        // Testi generali Lobby
        waiting_title: "Scheda Elettorale",
        waiting_subtitle: "Assegna un punteggio ai candidati.\n(Il voto è segreto e matematicamente protetto).",
        vote_btn: "Conferma Voti ✅",
        update_btn: "Aggiorna Voto ↻",
        sending: "Invio in corso...",
        terminate_btn: "Termina Votazione",
        terminate_confirm: "Sei sicuro di voler chiudere le urne?",
        
        // Testi generali Admin/Setup
        setup_title: "Setup Elezione",
        start_btn: "AVVIA ELEZIONE 🚀",
        code_label: "CODICE:",
        share_link: "INVITA",
        tab_candidates: "1. Candidati",
        tab_settings: "2. Regole",
        
        // Modale Share
        invite_title: "Invita Amici",
        scan_qr: "Scansiona per entrare",
        copy_link: "Copia Link",
        link_copied: "Link copiato!",
        share_btn: "Invita / QR",

        // Chat
        chat_title: "Chat Lobby",
        chat_placeholder: "Insulta la pizza...",
        chat_empty: "Nessun messaggio. Rompi il ghiaccio!",
        anon_user: "Agente",

        // Status Ospite
        guest_title: "Lavori in Corso",
        guest_desc: "L'Host sta configurando i candidati e le regole della votazione.",
        status_label: "STATUS",
        status_waiting: "In attesa dell'avvio...",
    },
    setup: {
        // Sezione Candidati
        add_placeholder: "Nome Candidato (es. Opzione A)",
        upload_photo: "Carica Foto",
        
        // Sezione Settings
        section_metrics: "Metrica di Voto",
        scale_label: "Scala Massima",
        scale_5: "⭐⭐⭐⭐⭐ (5 Punti)",
        scale_10: "🏆 10 Punti (Standard)",
        scale_100: "💯 100 Punti (Percentuale)",
        
        section_privacy: "Privacy Lobby",
        privacy_public: "Pubblica",
        privacy_private: "Privata",
        
        section_factors: "Criteri di Valutazione",
        factor_placeholder: "Nuovo Criterio (es. Estetica)",
        factor_weight_ph: "Peso",
        min_factor_error: "Devi avere almeno un criterio di voto."
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
      or_divider: "OR",
      join_placeholder: "Code (e.g. 1234)",
      join_btn: "Join ➤",
      no_registration: "No registration required",
      toast_init: "Initializing democracy protocol...",
      toast_success: "Lobby created! Redirecting...",
      toast_error: "Critical error: ",
      error_code_short: "Code too short",
      error_lobby_not_found: "Lobby not found or closed."
    },
    onboarding: {
        title: "Identify Yourself",
        subtitle: "How should others call you?",
        nick_placeholder: "Your Nickname (e.g. 'The Boss')",
        join_btn: "Join Lobby",
        error_nick: "Please enter a valid nickname"
    },
    lobby: {
        waiting_title: "Ballot Paper",
        waiting_subtitle: "Score the candidates.\n(Voting is secret and mathematically protected).",
        vote_btn: "Confirm Votes ✅",
        update_btn: "Update Vote ↻",
        sending: "Sending...",
        terminate_btn: "End Election",
        terminate_confirm: "Are you sure you want to close the polls?",
        
        setup_title: "Election Setup",
        start_btn: "START ELECTION 🚀",
        code_label: "CODE:",
        share_link: "INVITE",
        tab_candidates: "1. Candidates",
        tab_settings: "2. Rules",

        invite_title: "Invite Friends",
        scan_qr: "Scan to join",
        copy_link: "Copy Link",
        link_copied: "Link copied!",
        share_btn: "Invite / QR",

        chat_title: "Lobby Chat",
        chat_placeholder: "Roast the pizza...",
        chat_empty: "No messages. Break the ice!",
        anon_user: "Agent",

        guest_title: "Work in Progress",
        guest_desc: "The Host is configuring candidates and voting rules.",
        status_label: "STATUS",
        status_waiting: "Waiting for start...",
    },
    setup: {
        add_placeholder: "Candidate Name (e.g. Option A)",
        upload_photo: "Upload Photo",
        
        section_metrics: "Voting Metrics",
        scale_label: "Max Scale",
        scale_5: "⭐⭐⭐⭐⭐ (5 Points)",
        scale_10: "🏆 10 Points (Standard)",
        scale_100: "💯 100 Points (Percentile)",
        
        section_privacy: "Lobby Privacy",
        privacy_public: "Public",
        privacy_private: "Private",
        
        section_factors: "Evaluation Criteria",
        factor_placeholder: "New Criteria (e.g. Aesthetics)",
        factor_weight_ph: "Weight",
        min_factor_error: "You must have at least one voting criteria."
    },
    results: {
        winner_title: "THE WINNER IS...",
        analysis_title: "⚔️ Factorial Analysis",
        ranking_title: "Full Ranking"
    }
  }
};