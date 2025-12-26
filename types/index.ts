// Definizioni globali per il progetto Democracy is Dead

// Tipologie di Trend per i fattori
// higher_better: Più alto è il voto, meglio è (es. Gusto)
// lower_better: Più basso è il valore, meglio è (es. Prezzo, Calorie)
export type Trend = 'higher_better' | 'lower_better';

// Tipologia di Fattore
// vote: Votato soggettivamente dagli utenti (slider)
// static: Dato oggettivo inserito dall'admin (input numerico)
export type FactorType = 'vote' | 'static';

export interface Factor {
  id: string;
  name: string;
  weight: number;
  type: FactorType;
  trend: Trend;
  image_url?: string | null; // Icona/Immagine del fattore
  description?: string; // <--- NUOVO CAMPO
}

export interface Candidate {
  id: string;
  lobby_id: string;
  name: string;
  description: string;
  image_url: string | null;
  // Valori per i fattori statici (es. { "prezzo_id": 3.50 })
  static_values?: Record<string, number>; 
}

export interface Participant {
  id: string;
  user_id: string;
  nickname: string;
  has_voted: boolean;
  avatar_url?: string | null; // Avatar personalizzato utente
  is_online?: boolean;
}

export interface VotingScale {
  max: number;
}

export interface LobbySettings {
  privacy: 'public' | 'private';
  voting_scale: VotingScale;
  allow_decimals: boolean;
  factors: Factor[];
}

export interface Lobby {
  id: string;
  code: string;
  host_id: string;
  status: 'setup' | 'voting' | 'ended';
  settings: LobbySettings;
  created_at: string;
}
