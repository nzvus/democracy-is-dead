




export type Trend = 'higher_better' | 'lower_better';




export type FactorType = 'vote' | 'static';

export interface Factor {
  id: string;
  name: string;
  weight: number;
  type: FactorType;
  trend: Trend;
  image_url?: string | null; 
  description?: string; 
}

export interface Candidate {
  id: string;
  lobby_id: string;
  name: string;
  description: string;
  image_url: string | null;
  
  static_values?: Record<string, number>; 
}

export interface Participant {
  id: string;
  user_id: string;
  nickname: string;
  has_voted: boolean;
  avatar_url?: string | null; 
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
