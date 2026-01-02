export interface Participant {
  user_id: string;
  nickname: string; // Will be "Anonymous Voter" if masked
  avatar_url: string | null; // Will be null if masked
  has_voted: boolean;
  badges: string[]; // JSONB array from DB
}