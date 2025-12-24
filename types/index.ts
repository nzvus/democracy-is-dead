export type Trend = 'higher_better' | 'lower_better' // Es. Gusto vs Prezzo
export type FactorType = 'vote' | 'static' // Voto Utente vs Dato Admin

export interface Factor {
  id: string
  name: string
  weight: number
  type: FactorType
  trend: Trend
  suffix?: string // es. "€", "kcal"
}

export interface Candidate {
  id: string
  lobby_id: string
  name: string
  description: string
  image_url: string | null
  // Per i fattori statici (prezzo, ecc), useremo una mappa chiave-valore
  static_values?: Record<string, number> 
}

export interface Participant {
  id: string
  user_id: string
  nickname: string
  has_voted: boolean
  is_online?: boolean
}

export interface LobbySettings {
  privacy: 'public' | 'private'
  voting_scale: { max: number }
  allow_decimals: boolean
  factors: Factor[]
}